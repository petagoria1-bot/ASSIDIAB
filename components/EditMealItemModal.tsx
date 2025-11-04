import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { MealItem } from '../types';
import useTranslations from '../hooks/useTranslations';

interface EditMealItemModalProps {
  itemToEdit: MealItem;
  onClose: () => void;
  onConfirm: (updatedItem: MealItem) => void;
  useNetCarbs: boolean;
}

const EditMealItemModal: React.FC<EditMealItemModalProps> = ({ itemToEdit, onClose, onConfirm, useNetCarbs }) => {
  const [weight, setWeight] = useState(itemToEdit.poids_g.toString());
  const t = useTranslations();

  const handleSave = () => {
    const poids_g = parseFloat(weight.replace(',', '.'));
    if (isNaN(poids_g) || poids_g < 0) {
      toast.error(t.toast_invalidQuantity);
      return;
    }

    const { food } = itemToEdit;
    const carbs_per_100g = useNetCarbs
      ? food.carbs_per_100g_net
      : (food.carbs_per_100g_total ?? food.carbs_per_100g_net);

    const carbs_g = (poids_g / 100) * carbs_per_100g;

    const updatedItem: MealItem = {
      ...itemToEdit,
      poids_g,
      carbs_g: Math.round(carbs_g),
    };

    onConfirm(updatedItem);
  };

  const inputClasses = "w-full p-3 bg-input-bg rounded-input border border-black/10 text-text-title placeholder-placeholder-text focus:outline-none focus:border-emerald-main focus:ring-2 focus:ring-emerald-main/30 transition-all duration-150 text-center text-lg";

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-off-white rounded-card shadow-2xl p-6 w-full max-w-sm border border-slate-200/75 animate-fade-in-lift" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-display font-semibold text-text-title mb-2 text-center">{t.editMeal_title}</h3>
        <p className="text-center text-text-muted mb-4 font-semibold">{itemToEdit.food.name}</p>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="item-weight" className="block text-sm font-medium text-text-muted mb-1 text-center">{t.editMeal_newQuantityLabel} ({itemToEdit.food.unit_type})</label>
            <input
              type="number"
              inputMode="decimal"
              id="item-weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className={inputClasses}
              autoFocus
              onFocus={(e) => e.target.select()}
            />
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={onClose} className="w-full bg-white text-text-muted font-bold py-3 rounded-button border border-slate-300 hover:bg-slate-50 transition-colors">{t.common_cancel}</button>
          <button onClick={handleSave} className="w-full bg-emerald-main text-white font-bold py-3 rounded-button hover:bg-jade-deep-dark transition-colors shadow-sm">{t.common_save}</button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default EditMealItemModal;