import React, { useState, useMemo, useEffect } from 'react';
import { Page, MealTime, MealItem, DoseCalculationOutput, Mesure, Repas, Injection } from '../types';
import { usePatientStore } from '../store/patientStore';
import { calculateDose } from '../services/calculator';
import { MEAL_TIMES } from '../constants';
import Card from '../components/Card';
import MealBuilderCard from '../components/MealBuilderCard';
import PackagingCalculatorModal from '../components/PackagingCalculatorModal';
import toast from 'react-hot-toast';

interface DoseCalculatorProps {
  setCurrentPage: (page: Page) => void;
}

const DoseCalculator: React.FC<DoseCalculatorProps> = ({ setCurrentPage }) => {
  const { patient, addFullBolus, getLastCorrection } = usePatientStore();
  
  const [mealItems, setMealItems] = useState<MealItem[]>([]);
  const [glycemie, setGlycemie] = useState('');
  const [mealTime, setMealTime] = useState<MealTime>('dejeuner');
  const [calculation, setCalculation] = useState<DoseCalculationOutput | null>(null);
  const [isPackagingModalOpen, setPackagingModalOpen] = useState(false);
  const [useNetCarbs, setUseNetCarbs] = useState(true); // Default to net carbs

  const totalCarbs = useMemo(() => mealItems.reduce((sum, item) => sum + item.carbs_g, 0), [mealItems]);

  // Recalculate meal items carbs when the calculation mode changes
  useEffect(() => {
    // By removing the `if` condition and acting directly on the previous state,
    // we ensure the recalculation always happens with the most up-to-date meal items.
    setMealItems(prevItems =>
        prevItems.map(item => {
            const carbs_per_100g = useNetCarbs
                ? item.food.carbs_per_100g_net
                : (item.food.carbs_per_100g_total ?? item.food.carbs_per_100g_net);
            const newCarbs = (item.poids_g / 100) * carbs_per_100g;
            return { ...item, carbs_g: Math.round(newCarbs) };
        })
    );
  }, [useNetCarbs]);


  useEffect(() => {
    const runCalculation = async () => {
      const glyValue = parseFloat(glycemie.replace(',', '.'));
      if (!patient || isNaN(glyValue) || glyValue <= 0) {
        setCalculation(null);
        return;
      }

      const lastCorrection = await getLastCorrection();
      
      const result = calculateDose({
        gly_pre: glyValue,
        moment: mealTime,
        carbs_g: totalCarbs,
        patient,
        lastCorrection,
      });
      setCalculation(result);
    };

    runCalculation();
  }, [glycemie, totalCarbs, mealTime, patient, getLastCorrection]);

  const handleSaveBolus = async () => {
    if (!calculation || !patient) {
      toast.error("Le calcul n'est pas complet.");
      return;
    }
    const glyValue = parseFloat(glycemie.replace(',', '.'));
    if (isNaN(glyValue)) return;
    
    const timestamp = new Date().toISOString();

    const mesure: Omit<Mesure, 'id' | 'patient_id' | 'ts'> = {
      gly: glyValue,
      source: 'doigt',
    };

    const repas: Omit<Repas, 'id' | 'patient_id' | 'ts'> = {
      moment: mealTime,
      items: mealItems.map(item => ({
        nom: item.food.name,
        carbs_g: item.carbs_g,
        poids_g: item.poids_g,
      })),
      total_carbs_g: totalCarbs,
    };
    
    const injection: Omit<Injection, 'id' | 'patient_id' | 'ts'> = {
      type: 'rapide',
      dose_U: calculation.doseTotale,
      calc_details: `Repas: ${calculation.doseRepas_U.toFixed(1)}U + Correction: ${calculation.addCorr_U.toFixed(1)}U`,
    };

    try {
      await addFullBolus({ mesure: mesure as Mesure, repas: repas as Repas, injection: injection as Injection }, timestamp);
      toast.success(`Bolus de ${calculation.doseTotale}U enregistré !`);
      
      setMealItems([]);
      setGlycemie('');
      setCalculation(null);

      setTimeout(() => setCurrentPage('journal'), 1000);

    } catch (error) {
      toast.error("Erreur lors de l'enregistrement du bolus.");
      console.error(error);
    }
  };

  const handleAddToMealFromPackaging = (newItem: MealItem) => {
    setMealItems(prevItems => [...prevItems, newItem]);
    setPackagingModalOpen(false);
    toast.success(`${newItem.food.name} ajouté au repas !`);
  };

  const inputClasses = "w-full p-3 bg-input-bg rounded-input border border-black/10 text-text-title placeholder-placeholder-text focus:outline-none focus:border-emerald-main focus:ring-2 focus:ring-emerald-main/30 transition-all duration-150";

  return (
    <div className="p-5 space-y-4 font-sans">
      <header className="py-4">
        <h1 className="text-3xl font-display font-bold text-white text-shadow text-center">Calcul de Dose</h1>
      </header>
      
      <div className="relative z-20 animate-fade-in-lift" style={{ animationDelay: '100ms' }}>
        <MealBuilderCard 
            mealItems={mealItems} 
            setMealItems={setMealItems} 
            onOpenPackagingModal={() => setPackagingModalOpen(true)}
            useNetCarbs={useNetCarbs}
            setUseNetCarbs={setUseNetCarbs}
        />
      </div>

      <div className="animate-fade-in-lift" style={{ animationDelay: '200ms' }}>
        <Card>
          <h2 className="text-xl font-display font-semibold text-text-title mb-4">Glycémie & Moment</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="glycemie" className="block text-sm font-medium text-text-muted mb-1">Glycémie actuelle (g/L)</label>
              <input
                id="glycemie"
                type="number"
                inputMode="decimal"
                value={glycemie}
                onChange={(e) => setGlycemie(e.target.value)}
                placeholder="Ex: 1.25"
                className={inputClasses}
              />
            </div>
            <div>
              <span className="block text-sm font-medium text-text-muted mb-2">Moment du repas</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(MEAL_TIMES).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setMealTime(key as MealTime)}
                    className={`py-2 px-3 rounded-pill text-sm font-semibold transition-all duration-200 ${
                      mealTime === key 
                      ? 'bg-emerald-main text-white shadow-sm' 
                      : 'bg-white text-text-main hover:bg-slate-50 border border-slate-300'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {calculation && (
        <div className="bg-white/90 rounded-card p-5 shadow-glass border border-black/5 animate-fade-in-lift" style={{ animationDelay: '300ms' }}>
          <h2 className="text-2xl font-display font-bold text-text-title mb-2 text-center">Bolus calculé</h2>
          <div className="text-center my-4">
              <p className="font-display font-extrabold text-7xl text-text-title tracking-tighter">
                  {calculation.doseTotale.toFixed(1).replace('.', ',')}
                  <span className="text-4xl font-bold align-middle text-text-title/70 ml-1">U</span>
              </p>
          </div>
          <div className="text-center text-sm text-text-muted mt-2 space-y-1 bg-mint-soft/50 p-3 rounded-xl">
              <p>Dose repas: {calculation.doseRepas_U.toFixed(1).replace('.', ',')} U (pour {totalCarbs.toFixed(0)}g)</p>
              <p>Correction: +{calculation.addCorr_U.toFixed(1).replace('.', ',')} U (pour {glycemie} g/L)</p>
              {calculation.warning && (
                  <p className="text-orange-600 text-xs font-semibold mt-2">{calculation.warning}</p>
              )}
          </div>
          <button 
            onClick={handleSaveBolus}
            className="w-full mt-4 bg-emerald-main text-white font-bold text-lg py-4 rounded-button hover:bg-jade-deep-dark transition-colors shadow-lg"
          >
            Enregistrer dans le journal
          </button>
        </div>
      )}

      {isPackagingModalOpen && (
        <PackagingCalculatorModal
            onClose={() => setPackagingModalOpen(false)}
            onConfirm={handleAddToMealFromPackaging}
            useNetCarbs={useNetCarbs}
        />
      )}
    </div>
  );
};

export default DoseCalculator;