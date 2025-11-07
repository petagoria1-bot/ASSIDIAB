import React, { useState, useEffect } from 'react';
import { usePatientStore } from '../store/patientStore.ts';
import { useUiStore } from '../store/uiStore.ts';
import { useSettingsStore } from '../store/settingsStore.ts';
import { calculateDose } from '../services/calculator.ts';
import { DoseCalculationOutput, MealTime, Page, MealItem } from '../types.ts';
import toast from 'react-hot-toast';
// FIX: Changed import to be a relative path and added file extension for proper module resolution.
import useTranslations from '../hooks/useTranslations.ts';
import Card from '../components/Card.tsx';
// FIX: Changed import to be a relative path and added file extension for proper module resolution.
import MealBuilderCard from '../components/MealBuilderCard.tsx';
// FIX: Changed import to be a relative path and added file extension for proper module resolution.
import CustomSelect from '../components/CustomSelect.tsx';
import CalculatorIcon from '../components/icons/CalculatorIcon.tsx';
import InfoIcon from '../components/icons/InfoIcon.tsx';
import DoseExplanationModal from '../components/DoseExplanationModal.tsx';
import CheckmarkPopAnimation from '../components/animations/CheckmarkPopAnimation.tsx';
import BreakfastIcon from '../components/icons/BreakfastIcon.tsx';
import LunchIcon from '../components/icons/LunchIcon.tsx';
import SnackIcon from '../components/icons/SnackIcon.tsx';
import DinnerIcon from '../components/icons/DinnerIcon.tsx';
import RatioReminderModal from '../components/RatioReminderModal.tsx';

interface DoseCalculatorProps {
  setCurrentPage: (page: Page) => void;
}

const DoseCalculator: React.FC<DoseCalculatorProps> = ({ setCurrentPage }) => {
  const { patient, getLastCorrection, addFullBolus } = usePatientStore();
  const { calculatorMealTime, setCalculatorMealTime } = useUiStore();
  const { showRatioReminder } = useSettingsStore();
  const t = useTranslations();

  const [glyPre, setGlyPre] = useState('');
  const [moment, setMoment] = useState<MealTime>('dejeuner');
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [mealItems, setMealItems] = useState<MealItem[]>([]);
  const [calculation, setCalculation] = useState<DoseCalculationOutput | null>(null);
  const [isExplanationOpen, setExplanationOpen] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [isReminderModalOpen, setReminderModalOpen] = useState(false);

  useEffect(() => {
    if (calculatorMealTime) {
      setMoment(calculatorMealTime);
      setCalculatorMealTime(null); // Clear after use
    }
  }, [calculatorMealTime, setCalculatorMealTime]);

  useEffect(() => {
    if (showSuccessAnimation) {
      const timer = setTimeout(() => setShowSuccessAnimation(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessAnimation]);
  
  const handleCalculate = async () => {
    if (!patient) return;
    const glyValue = parseFloat(glyPre.replace(',', '.'));
    if (isNaN(glyValue) || glyValue <= 0) {
      toast.error(t.toast_invalidGlycemia);
      return;
    }
    setCalculation(null);

    const lastCorrection = await getLastCorrection();
    
    const result = calculateDose({
      gly_pre: glyValue,
      moment,
      carbs_g: totalCarbs,
      patient,
      lastCorrection,
    });
    setCalculation(result);
    setShowSuccessAnimation(true);
  };
  
  const executeSaveBolus = async () => {
    if (!calculation || !patient) {
        toast.error(t.toast_calculationIncomplete);
        return;
    }
    const glyValue = parseFloat(glyPre.replace(',', '.'));
    if (isNaN(glyValue)) return;
    
    const timestamp = new Date().toISOString();
    
    const mesure = {
        gly: glyValue,
        source: 'doigt' as const
    };
    
    const repas = {
        moment,
        items: mealItems.map(i => ({ nom: i.food.name, carbs_g: i.carbs_g, poids_g: i.poids_g })),
        total_carbs_g: totalCarbs
    };
    
    const injection = {
        type: 'rapide' as const,
        dose_U: calculation.doseTotale,
        calc_details: t.calculator_bolusDetails(calculation.doseRepas_U, calculation.addCorr_U)
    };

    try {
      await addFullBolus({ mesure, repas, injection }, timestamp);
      toast.success(t.toast_bolusSaved(calculation.doseTotale));
      setCurrentPage('journal');
    } catch (error) {
      console.error(error);
      toast.error(t.toast_bolusSaveError);
    }
  };

  const handleSaveBolus = () => {
    if (showRatioReminder) {
      setReminderModalOpen(true);
    } else {
      executeSaveBolus();
    }
  };

  const mealTimeOptions = [
    { value: 'petit_dej', label: t.mealTimes.petit_dej, icon: <BreakfastIcon className="w-6 h-6" /> },
    { value: 'dejeuner', label: t.mealTimes.dejeuner, icon: <LunchIcon className="w-6 h-6" /> },
    { value: 'gouter', label: t.mealTimes.gouter, icon: <SnackIcon className="w-6 h-6" /> },
    { value: 'diner', label: t.mealTimes.diner, icon: <DinnerIcon className="w-6 h-6" /> },
  ];
  
  const inputClasses = "w-full p-3 bg-white rounded-input border border-black/10 text-text-title placeholder-placeholder-text focus:outline-none focus:border-emerald-main focus:ring-2 focus:ring-emerald-main/30 transition-all duration-150 text-center text-lg";


  return (
    <div className="p-4 space-y-4 pb-24">
      <header className="py-4 text-center">
        <h1 className="text-3xl font-display font-bold text-white text-shadow">{t.calculator_title}</h1>
      </header>
      
      <Card>
        <h2 className="text-lg font-semibold text-text-title mb-3">{t.calculator_glycemiaAndTimeTitle}</h2>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="glycemie" className="block text-sm font-medium text-text-muted mb-1 text-center">{t.calculator_glycemiaLabel}</label>
                <input
                    id="glycemie"
                    type="number"
                    inputMode="decimal"
                    value={glyPre}
                    onChange={(e) => setGlyPre(e.target.value)}
                    className={inputClasses}
                    placeholder="ex: 1.25"
                />
            </div>
             <div>
                <label htmlFor="meal-time" className="block text-sm font-medium text-text-muted mb-1 text-center">{t.calculator_mealTimeLabel}</label>
                <CustomSelect 
                    options={mealTimeOptions} 
                    value={moment} 
                    onChange={(val) => setMoment(val as MealTime)} 
                />
            </div>
        </div>
      </Card>
      
      <MealBuilderCard onTotalCarbsChange={setTotalCarbs} onMealItemsChange={setMealItems} />
      
      {calculation === null && (
        <button onClick={handleCalculate} className="w-full text-jade-deep font-bold text-lg py-4 rounded-button mt-4 bg-gradient-to-b from-mint-soft to-[#c3f6e2] transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg flex items-center justify-center gap-2 border border-black/5">
            <CalculatorIcon className="w-8 h-8"/>
            <span>{t.dashboard_action_calculate}</span>
        </button>
      )}
      
      {calculation && (
        <div className="relative">
          {showSuccessAnimation && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <CheckmarkPopAnimation className="w-20 h-20" />
            </div>
          )}
          <Card className="animate-fade-in-lift">
            <h2 className="text-lg font-semibold text-text-title mb-3 text-center">{t.calculator_resultTitle}</h2>
            <div className="text-center bg-mint-soft/50 p-4 rounded-xl space-y-2">
              <p className="font-semibold text-text-main">{t.calculator_resultMealDose(calculation.doseRepas_U, totalCarbs)}</p>
              {calculation.addCorr_U > 0 && (
                  <p className="font-semibold text-text-main">{t.calculator_resultCorrectionDose(calculation.addCorr_U, glyPre)}</p>
              )}
              <div className="flex items-center justify-center gap-2">
                <p className="font-display font-bold text-5xl text-emerald-main py-2">{calculation.doseTotale} <span className="text-3xl text-text-muted">U</span></p>
                <button onClick={() => setExplanationOpen(true)} aria-label={t.doseExplanation_title}>
                  <InfoIcon />
                </button>
              </div>
              {calculation.warning && (
                <p className="text-xs text-amber-700 font-semibold bg-amber-100 p-2 rounded-md">{calculation.warning}</p>
              )}
            </div>
            <button onClick={handleSaveBolus} className="w-full mt-4 bg-emerald-main text-white text-sm font-bold py-3 rounded-button hover:bg-jade-deep-dark transition-colors">
              {t.calculator_saveButton}
            </button>
          </Card>
        </div>
      )}
      
      {isExplanationOpen && calculation && patient && (
        <DoseExplanationModal
          onClose={() => setExplanationOpen(false)}
          calculation={calculation}
          patient={patient}
          glyPre={glyPre}
          totalCarbs={totalCarbs}
          moment={moment}
        />
      )}
      
      {isReminderModalOpen && calculation && patient && (
        <RatioReminderModal
          onClose={() => setReminderModalOpen(false)}
          onConfirm={() => {
            setReminderModalOpen(false);
            executeSaveBolus();
          }}
          mealTime={moment}
          ratio={patient.ratios[moment]}
          totalDose={calculation.doseTotale}
        />
      )}

    </div>
  );
};

export default DoseCalculator;