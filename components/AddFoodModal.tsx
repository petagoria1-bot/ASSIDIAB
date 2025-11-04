import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { usePatientStore } from '../store/patientStore';
import { Food } from '../types';

interface AddFoodModalProps {
  onClose: () => void;
  foodToEdit?: Food;
}

const AddFoodModal: React.FC<AddFoodModalProps> = ({ onClose, foodToEdit }) => {
  const { addOrUpdateFood } = usePatientStore();
  
  const [name, setName] = useState(foodToEdit?.name || '');
  const [totalCarbs, setTotalCarbs] = useState(foodToEdit?.carbs_per_100g_total?.toString() || '');
  const [fiber, setFiber] = useState(foodToEdit?.fiber_per_100g?.toString() || '');
  const [unitType, setUnitType] = useState<'g' | 'ml'>(foodToEdit?.unit_type || 'g');

  const handleSave = () => {
    const totalCarbsValue = parseFloat(totalCarbs.replace(',', '.'));
    const fiberValue = fiber ? parseFloat(fiber.replace(',', '.')) : 0;

    if (!name.trim()) {
      toast.error("Le nom de l'aliment est requis.");
      return;
    }
    if (isNaN(totalCarbsValue) || totalCarbsValue < 0) {
      toast.error('Veuillez entrer une valeur de glucides valide.');
      return;
    }
     if (isNaN(fiberValue) || fiberValue < 0) {
      toast.error('La valeur des fibres est invalide.');
      return;
    }

    const netCarbs = Math.max(0, Math.round(totalCarbsValue - fiberValue));

    const newFood: Food = {
      id: foodToEdit?.id || uuidv4(),
      name: name.trim(),
      category: foodToEdit?.category || 'Aliment manuel',
      carbs_per_100g_total: totalCarbsValue,
      fiber_per_100g: fiberValue,
      carbs_per_100g_net: netCarbs,
      unit_type: unitType,
      source: foodToEdit?.source || 'Ajout manuel',
    };

    addOrUpdateFood(newFood);
    toast.success(`'${newFood.name}' a été ${foodToEdit ? 'modifié' : 'ajouté'} !`);
    onClose();
  };
  
  const inputClasses = "w-full p-3 bg-input-bg rounded-input border border-black/10 text-text-title placeholder-placeholder-text focus:outline-none focus:border-emerald-main focus:ring-2 focus:ring-emerald-main/30 transition-all duration-150";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-off-white rounded-card shadow-2xl p-6 w-full max-w-sm border border-slate-200/75 animate-fade-in-lift" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-display font-semibold text-text-title mb-4 text-center">
            {foodToEdit ? "Modifier l'aliment" : "Ajouter un aliment"}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="food-name" className="block text-sm font-medium text-text-muted mb-1">Nom de l'aliment</label>
            <input
              type="text"
              id="food-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClasses}
              placeholder="Ex: Yaourt aux fruits"
            />
          </div>
          
          <div className="flex gap-2">
            <button onClick={() => setUnitType('g')} className={`flex-1 py-2 rounded-pill text-sm font-semibold transition-colors ${unitType === 'g' ? 'bg-emerald-main text-white' : 'bg-input-bg text-text-main'}`}>
              pour 100 g
            </button>
            <button onClick={() => setUnitType('ml')} className={`flex-1 py-2 rounded-pill text-sm font-semibold transition-colors ${unitType === 'ml' ? 'bg-emerald-main text-white' : 'bg-input-bg text-text-main'}`}>
              pour 100 ml
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div>
                <label htmlFor="total-carbs" className="block text-sm font-medium text-text-muted mb-1">Glucides totaux</label>
                <input
                  type="number"
                  inputMode="decimal"
                  id="total-carbs"
                  value={totalCarbs}
                  onChange={(e) => setTotalCarbs(e.target.value)}
                  className={inputClasses}
                  placeholder="Ex: 15.5"
                />
            </div>
            <div>
                <label htmlFor="fiber" className="block text-sm font-medium text-text-muted mb-1">dont Fibres</label>
                <input
                  type="number"
                  inputMode="decimal"
                  id="fiber"
                  value={fiber}
                  onChange={(e) => setFiber(e.target.value)}
                  className={inputClasses}
                  placeholder="(Optionnel)"
                />
            </div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={onClose} className="w-full bg-white text-text-muted font-bold py-3 rounded-button border border-slate-300 hover:bg-slate-50 transition-colors">Annuler</button>
          <button onClick={handleSave} className="w-full bg-emerald-main text-white font-bold py-3 rounded-button hover:bg-jade-deep-dark transition-colors shadow-sm">Enregistrer</button>
        </div>
      </div>
    </div>
  );
};

export default AddFoodModal;