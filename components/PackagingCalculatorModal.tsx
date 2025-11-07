import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { MealItem, Food } from '../types.ts';
// FIX: Changed import to be a relative path and added file extension for proper module resolution.
import useTranslations from '../hooks/useTranslations.ts';

interface PackagingCalculatorModalProps {
  onClose: () => void;
  onConfirm: (item: MealItem) => void;
  useNetCarbs: boolean;
}

const PackagingCalculatorModal: React.FC<PackagingCalculatorModalProps> = ({ onClose, onConfirm, useNetCarbs }) => {
  const [name, setName] = useState('');
  const [refCarbs, setRefCarbs] = useState('');
  const [refWeight, setRefWeight] = useState('100');
  const [refFiber, setRefFiber] = useState('');
  const [consumedWeight, setConsumedWeight] = useState('');
  const [unit, setUnit] = useState<'g' | 'ml'>('g');
  const t = useTranslations();

  const inputClasses = "w-full p-3 bg-input-bg rounded-input border border-black/10 text-text-title placeholder-placeholder-text focus:outline-none focus:border-emerald-main focus:ring-2 focus:ring-emerald-main/30 transition-all duration-150";

  const calculatedCarbs = useMemo(() => {
    const refCarbsValue = parseFloat(refCarbs.replace(',', '.'));
    const refWeightValue = parseFloat(refWeight.replace(',', '.'));
    const consumedWeightValue = parseFloat(consumedWeight.replace(',', '.'));
    const refFiberValue = refFiber ? parseFloat(refFiber.replace(',', '.')) : 0;

    if (
      !isNaN(refCarbsValue) && refCarbsValue >= 0 &&
      !isNaN(refWeightValue) && refWeightValue > 0 &&
      !isNaN(consumedWeightValue) && consumedWeightValue > 0 &&
      !isNaN(refFiberValue) && refFiberValue >= 0
    ) {
      const totalCarbsForPortion = (consumedWeightValue / refWeightValue) * refCarbsValue;
      if (useNetCarbs) {
        const fiberForPortion = (consumedWeightValue / refWeightValue) * refFiberValue;
        return totalCarbsForPortion - fiberForPortion;
      }
      return totalCarbsForPortion;
    }
    return null;
  }, [refCarbs, refWeight, consumedWeight, refFiber, useNetCarbs]);

  const handleConfirm = () => {
    const nameValue = name.trim();
    const consumedWeightValue = parseFloat(consumedWeight.replace(',', '.'));
    const refCarbsValue = parseFloat(refCarbs.replace(',', '.'));
    const refWeightValue = parseFloat(refWeight.replace(',', '.'));
    const refFiberValue = refFiber ? parseFloat(refFiber.replace(',', '.')) : 0;

    if (!nameValue) {
        toast.error(t.toast_foodNameRequired);
        return;
    }
    if (isNaN(consumedWeightValue) || isNaN(refCarbsValue) || isNaN(refWeightValue) || refWeightValue <= 0 || isNaN(refFiberValue)) {
        toast.error(t.toast_fillAllFieldsCorrectly);
        return;
    }
    
    const carbs_per_100g_total = (refCarbsValue / refWeightValue) * 100;
    const fiber_per_100g = (refFiberValue / refWeightValue) * 100;
    const carbs_per_100g_net = carbs_per_100g_total - fiber_per_100g;

    const tempFood: Food = {
        id: uuidv4(),
        name: t.packaging_calculatedFoodName(nameValue),
        category: t.packaging_calculatedCategory,
        carbs_per_100g_total: carbs_per_100g_total,
        fiber_per_100g: fiber_per_100g,
        carbs_per_100g_net: carbs_per_100g_net,
        unit_type: unit,
        source: t.packaging_source,
    };

    const carbs_for_item = useNetCarbs ? 
        (consumedWeightValue / 100) * carbs_per_100g_net :
        (consumedWeightValue / 100) * carbs_per_100g_total;
    
    const newItem: MealItem = {
        listId: uuidv4(),
        food: tempFood,
        poids_g: consumedWeightValue,
        carbs_g: Math.round(carbs_for_item),
    };

    onConfirm(newItem);
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-off-white rounded-card shadow-2xl p-6 w-full max-w-sm border border-slate-200/75 animate-fade-in-lift" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-display font-semibold text-text-title mb-4 text-center">{t.packaging_title}</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="pack-name" className="block text-sm font-medium text-text-muted mb-1">{t.addFood_foodNameLabel}</label>
            <input
              type="text"
              id="pack-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClasses}
              placeholder={t.packaging_foodNamePlaceholder}
            />
          </div>
          
          <div className="flex gap-2">
            <button onClick={() => setUnit('g')} className={`flex-1 py-2 rounded-pill text-sm font-semibold transition-colors ${unit === 'g' ? 'bg-emerald-main text-white shadow-sm' : 'bg-white text-text-main border border-slate-300 hover:bg-slate-50'}`}>
              {t.packaging_grams}
            </button>
            <button onClick={() => setUnit('ml')} className={`flex-1 py-2 rounded-pill text-sm font-semibold transition-colors ${unit === 'ml' ? 'bg-emerald-main text-white shadow-sm' : 'bg-white text-text-main border border-slate-300 hover:bg-slate-50'}`}>
              {t.packaging_milliliters}
            </button>
          </div>

          <div className="text-center text-text-muted text-sm my-2">{t.packaging_labelInfo}:</div>
          <div className="grid grid-cols-3 gap-2">
             <div className="col-span-1">
                <label htmlFor="ref-weight" className="block text-xs font-medium text-text-muted mb-1">{t.packaging_forWeight} ({unit})</label>
                <input
                  type="number"
                  inputMode="decimal"
                  id="ref-weight"
                  value={refWeight}
                  onChange={(e) => setRefWeight(e.target.value)}
                  className={inputClasses}
                  placeholder="100"
                />
            </div>
             <div className="col-span-1">
                <label htmlFor="ref-carbs" className="block text-xs font-medium text-text-muted mb-1">{t.common_carbs}</label>
                <input
                  type="number"
                  inputMode="decimal"
                  id="ref-carbs"
                  value={refCarbs}
                  onChange={(e) => setRefCarbs(e.target.value)}
                  className={inputClasses}
                  placeholder="30"
                />
            </div>
            <div className="col-span-1">
                <label htmlFor="ref-fiber" className="block text-xs font-medium text-text-muted mb-1">{t.addFood_fiberLabel}</label>
                <input
                  type="number"
                  inputMode="decimal"
                  id="ref-fiber"
                  value={refFiber}
                  onChange={(e) => setRefFiber(e.target.value)}
                  className={inputClasses}
                  placeholder={`(${t.common_optional})`}
                />
            </div>
          </div>
          
           <div>
              <label htmlFor="consumed-weight" className="block text-sm font-medium text-text-muted mb-1">{t.packaging_consumedWeight} ({unit})</label>
              <input
                type="number"
                inputMode="decimal"
                id="consumed-weight"
                value={consumedWeight}
                onChange={(e) => setConsumedWeight(e.target.value)}
                className={inputClasses}
                placeholder={t.packaging_consumedWeightPlaceholder}
              />
            </div>
        </div>

        {calculatedCarbs !== null && (
            <div className="mt-4 text-center bg-mint-soft/50 p-3 rounded-xl animate-fade-in">
                <p className="text-sm text-text-muted">{t.packaging_totalCarbsResult} ({useNetCarbs ? t.mealBuilder_netCarbs : t.mealBuilder_totalCarbs})</p>
                <p className="font-display font-bold text-3xl text-emerald-main">
                    {calculatedCarbs.toFixed(0)}
                    <span className="text-lg font-semibold text-text-muted ml-1">g</span>
                </p>
            </div>
        )}
        
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={onClose} className="w-full bg-white text-text-muted font-bold py-3 rounded-button border border-slate-300 hover:bg-slate-50 transition-colors">{t.common_cancel}</button>
          <button onClick={handleConfirm} className="w-full bg-emerald-main text-white font-bold py-3 rounded-button hover:bg-jade-deep-dark transition-colors shadow-sm">{t.packaging_addToMeal}</button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PackagingCalculatorModal;