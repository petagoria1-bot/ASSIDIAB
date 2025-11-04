import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { MealItem, Food } from '../types';

interface PackagingCalculatorModalProps {
  onClose: () => void;
  onConfirm: (item: MealItem) => void;
}

const PackagingCalculatorModal: React.FC<PackagingCalculatorModalProps> = ({ onClose, onConfirm }) => {
  const [name, setName] = useState('');
  const [refCarbs, setRefCarbs] = useState('');
  const [refWeight, setRefWeight] = useState('100');
  const [consumedWeight, setConsumedWeight] = useState('');
  const [unit, setUnit] = useState<'g' | 'ml'>('g');

  const inputClasses = "w-full p-3 bg-input-bg rounded-input border border-black/10 text-text-title placeholder-placeholder-text focus:outline-none focus:border-emerald-main focus:ring-2 focus:ring-emerald-main/30 transition-all duration-150";

  const calculatedCarbs = useMemo(() => {
    const refCarbsValue = parseFloat(refCarbs.replace(',', '.'));
    const refWeightValue = parseFloat(refWeight.replace(',', '.'));
    const consumedWeightValue = parseFloat(consumedWeight.replace(',', '.'));

    if (
      !isNaN(refCarbsValue) && refCarbsValue >= 0 &&
      !isNaN(refWeightValue) && refWeightValue > 0 &&
      !isNaN(consumedWeightValue) && consumedWeightValue > 0
    ) {
      return (consumedWeightValue / refWeightValue) * refCarbsValue;
    }
    return null;
  }, [refCarbs, refWeight, consumedWeight]);

  const handleConfirm = () => {
    const nameValue = name.trim();
    const consumedWeightValue = parseFloat(consumedWeight.replace(',', '.'));

    if (!nameValue) {
        toast.error("Veuillez entrer un nom pour l'aliment.");
        return;
    }
    if (calculatedCarbs === null) {
        toast.error("Veuillez remplir tous les champs de calcul correctement.");
        return;
    }
    
    const refCarbsValue = parseFloat(refCarbs.replace(',', '.'));
    const refWeightValue = parseFloat(refWeight.replace(',', '.'));
    
    const tempFood: Food = {
        id: uuidv4(),
        name: nameValue,
        category: 'Calcul ponctuel',
        carbs_per_100g_net: Math.round((refCarbsValue / refWeightValue) * 100),
        unit_type: unit,
        source: 'Emballage',
    };

    const newItem: MealItem = {
        listId: uuidv4(),
        food: tempFood,
        poids_g: consumedWeightValue,
        carbs_g: Math.round(calculatedCarbs),
    };

    onConfirm(newItem);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-off-white rounded-card shadow-2xl p-6 w-full max-w-sm border border-slate-200/75 animate-fade-in-lift" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-display font-semibold text-text-title mb-4 text-center">Calcul depuis l'emballage</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="pack-name" className="block text-sm font-medium text-text-muted mb-1">Nom de l'aliment</label>
            <input
              type="text"
              id="pack-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClasses}
              placeholder="Ex: Gâteau choco"
            />
          </div>
          
          <div className="flex gap-2">
            <button onClick={() => setUnit('g')} className={`flex-1 py-2 rounded-pill text-sm font-semibold transition-colors ${unit === 'g' ? 'bg-emerald-main text-white shadow-sm' : 'bg-white text-text-main border border-slate-300 hover:bg-slate-50'}`}>
              Grammes (g)
            </button>
            <button onClick={() => setUnit('ml')} className={`flex-1 py-2 rounded-pill text-sm font-semibold transition-colors ${unit === 'ml' ? 'bg-emerald-main text-white shadow-sm' : 'bg-white text-text-main border border-slate-300 hover:bg-slate-50'}`}>
              Millilitres (ml)
            </button>
          </div>

          <div className="text-center text-text-muted text-sm my-2">Pour la portion de référence :</div>
          <div className="grid grid-cols-2 gap-3">
             <div>
                <label htmlFor="ref-carbs" className="block text-sm font-medium text-text-muted mb-1">Glucides</label>
                <input
                  type="number"
                  inputMode="decimal"
                  id="ref-carbs"
                  value={refCarbs}
                  onChange={(e) => setRefCarbs(e.target.value)}
                  className={inputClasses}
                  placeholder="Ex: 30"
                />
            </div>
            <div>
                <label htmlFor="ref-weight" className="block text-sm font-medium text-text-muted mb-1">Pour ({unit})</label>
                <input
                  type="number"
                  inputMode="decimal"
                  id="ref-weight"
                  value={refWeight}
                  onChange={(e) => setRefWeight(e.target.value)}
                  className={inputClasses}
                  placeholder="Ex: 100"
                />
            </div>
          </div>
          
           <div>
              <label htmlFor="consumed-weight" className="block text-sm font-medium text-text-muted mb-1">Poids consommé ({unit})</label>
              <input
                type="number"
                inputMode="decimal"
                id="consumed-weight"
                value={consumedWeight}
                onChange={(e) => setConsumedWeight(e.target.value)}
                className={inputClasses}
                placeholder="Ce que vous mangez"
              />
            </div>
        </div>

        {calculatedCarbs !== null && (
            <div className="mt-4 text-center bg-mint-soft/50 p-3 rounded-xl animate-fade-in">
                <p className="text-sm text-text-muted">Total Glucides pour cette portion</p>
                <p className="font-display font-bold text-3xl text-emerald-main">
                    {calculatedCarbs.toFixed(0)}
                    <span className="text-lg font-semibold text-text-muted ml-1">g</span>
                </p>
            </div>
        )}
        
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={onClose} className="w-full bg-white text-text-muted font-bold py-3 rounded-button border border-slate-300 hover:bg-slate-50 transition-colors">Annuler</button>
          <button onClick={handleConfirm} className="w-full bg-emerald-main text-white font-bold py-3 rounded-button hover:bg-jade-deep-dark transition-colors shadow-sm">Ajouter au repas</button>
        </div>
      </div>
    </div>
  );
};

export default PackagingCalculatorModal;