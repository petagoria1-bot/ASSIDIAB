import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { Food, MealItem } from '../types.ts';
// FIX: Changed import to be a relative path and added file extension for proper module resolution.
import useTranslations from '../hooks/useTranslations.ts';
import CarbIndicator from './CarbIndicator.tsx';

interface AddFoodConfirmationModalProps {
  food: Food;
  onClose: () => void;
  onConfirm: (item: MealItem) => void;
  useNetCarbs: boolean;
}

const AddFoodConfirmationModal: React.FC<AddFoodConfirmationModalProps> = ({ food, onClose, onConfirm, useNetCarbs }) => {
    const t = useTranslations();
    const initialWeight = food.common_portion_g || 100;
    const [weight, setWeight] = useState(initialWeight.toString());
    
    const carbs_per_100g = useNetCarbs ? food.carbs_per_100g_net : (food.carbs_per_100g_total ?? food.carbs_per_100g_net);

    const calculatedCarbs = useMemo(() => {
        const weightValue = parseFloat(weight.replace(',', '.'));
        if (isNaN(weightValue) || weightValue < 0) return 0;
        return (weightValue / 100) * carbs_per_100g;
    }, [weight, carbs_per_100g]);
    
    const handleConfirm = () => {
        const weightValue = parseFloat(weight.replace(',', '.'));
        if (isNaN(weightValue) || weightValue < 0) {
            toast.error(t.toast_invalidWeight);
            return;
        }

        const newItem: MealItem = {
            listId: `${food.id}-${Date.now()}`,
            food,
            poids_g: weightValue,
            carbs_g: Math.round(calculatedCarbs),
        };
        onConfirm(newItem);
    };

    const inputClasses = "w-full p-3 bg-input-bg rounded-input border border-black/10 text-text-title placeholder-placeholder-text focus:outline-none focus:border-emerald-main focus:ring-2 focus:ring-emerald-main/30 transition-all duration-150 text-center";

    const modalContent = (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-off-white rounded-card shadow-2xl p-6 w-full max-w-sm border border-slate-200/75 animate-fade-in-lift" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-display font-semibold text-text-title mb-2 text-center">{t.addFood_confirm_title}</h3>
                <p className="text-center text-text-muted mb-4 font-semibold">{food.name}</p>

                <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="col-span-2 space-y-3">
                         <div>
                            <label htmlFor="food-weight" className="block text-sm font-medium text-text-muted mb-1">{t.addFood_confirm_quantity} ({food.unit_type})</label>
                            <input
                                type="number"
                                inputMode="decimal"
                                id="food-weight"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                className={inputClasses}
                                autoFocus
                                onFocus={(e) => e.target.select()}
                            />
                        </div>
                        <div className="text-center bg-mint-soft/50 p-2 rounded-xl">
                            <p className="text-xs text-text-muted">{t.addFood_confirm_calculatedCarbs}</p>
                            <p className="font-display font-bold text-2xl text-emerald-main">
                                {calculatedCarbs.toFixed(0)}g
                            </p>
                        </div>
                    </div>
                    <div className="col-span-1">
                        <CarbIndicator carbs_per_100g={carbs_per_100g} unit={food.unit_type} />
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <button onClick={onClose} className="w-full bg-white text-text-muted font-bold py-3 rounded-button border border-slate-300 hover:bg-slate-50 transition-colors">{t.common_cancel}</button>
                    <button onClick={handleConfirm} className="w-full bg-emerald-main text-white font-bold py-3 rounded-button hover:bg-jade-deep-dark transition-colors shadow-sm">{t.addFood_confirm_addToMeal}</button>
                </div>
            </div>
        </div>
    );
    
    return createPortal(modalContent, document.body);
};

export default AddFoodConfirmationModal;