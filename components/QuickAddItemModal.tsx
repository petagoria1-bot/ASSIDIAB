import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { MealItem, Food } from '../types';

interface QuickAddItemModalProps {
  onClose: () => void;
  onAddItem: (item: MealItem) => void;
}

const QuickAddItemModal: React.FC<QuickAddItemModalProps> = ({ onClose, onAddItem }) => {
  const [name, setName] = useState('');
  const [carbsPer100g, setCarbsPer100g] = useState('');
  const [portionWeight, setPortionWeight] = useState('');
  const [currentUnit, setCurrentUnit] = useState<'g' | 'ml' | 'cl'>('g');

  const calculatedCarbs = useMemo(() => {
    const carbsNum = parseFloat(carbsPer100g.replace(',', '.'));
    const portionNum = parseFloat(portionWeight.replace(',', '.'));
    if (isNaN(carbsNum) || isNaN(portionNum) || carbsNum < 0 || portionNum < 0) {
      return null;
    }
    
    let portionInBaseUnit = portionNum;
    if (currentUnit === 'cl') {
        portionInBaseUnit = portionNum * 10;
    }

    return (carbsNum / 100) * portionInBaseUnit;
  }, [carbsPer100g, portionWeight, currentUnit]);

  const handleAddItem = () => {
    if (!name.trim()) {
      toast.error("Veuillez entrer un nom pour l'aliment.");
      return;
    }
    if (calculatedCarbs === null || calculatedCarbs < 0) {
      toast.error('Veuillez entrer des valeurs valides pour les glucides et le poids.');
      return;
    }

    let portionInBaseUnit = parseFloat(portionWeight.replace(',', '.'));
    if (currentUnit === 'cl') {
        portionInBaseUnit = portionInBaseUnit * 10;
    }

    const transientFood: Food = {
      id: uuidv4(), // transient id
      name: name.trim(),
      category: 'Ajout rapide',
      carbs_per_100g_net: parseFloat(carbsPer100g.replace(',', '.')),
      unit_type: currentUnit === 'g' ? 'g' : 'ml',
      source: 'Ajout rapide',
      quality: 'certaine',
    };

    const newItem: MealItem = {
      listId: uuidv4(),
      food: transientFood,
      poids_g: portionInBaseUnit,
      carbs_g: calculatedCarbs,
    };

    onAddItem(newItem);
    onClose();
  };
  
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      event.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-4">Ajout rapide d'un aliment</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="quick-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom</label>
            <input type="text" id="quick-name" value={name} onChange={(e) => setName(e.target.value)} onFocus={handleFocus} className="mt-1 w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600" placeholder="ex: Marbré Savane"/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quick-carbs" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Glucides /{currentUnit === 'g' ? '100g' : '100ml'}</label>
              <input type="number" inputMode="decimal" id="quick-carbs" value={carbsPer100g} onChange={(e) => setCarbsPer100g(e.target.value)} onFocus={handleFocus} className="mt-1 w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600" placeholder="54"/>
            </div>
            <div>
              <label htmlFor="quick-weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{currentUnit === 'g' ? 'Poids portion' : 'Volume portion'}</label>
              <div className="mt-1 flex items-center">
                <input type="number" inputMode="decimal" id="quick-weight" value={portionWeight} onChange={(e) => setPortionWeight(e.target.value)} onFocus={handleFocus} className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600" placeholder="40"/>
                <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 ml-2 flex-shrink-0">
                    <button type="button" onClick={() => setCurrentUnit('g')} className={`px-2 py-3 text-sm rounded-l-lg ${currentUnit === 'g' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>g</button>
                    <button type="button" onClick={() => setCurrentUnit('ml')} className={`px-2 py-3 text-sm ${currentUnit === 'ml' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>ml</button>
                    <button type="button" onClick={() => setCurrentUnit('cl')} className={`px-2 py-3 text-sm rounded-r-lg ${currentUnit === 'cl' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>cl</button>
                </div>
              </div>
            </div>
          </div>
          {calculatedCarbs !== null && (
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-center">
              <p className="font-bold text-lg text-blue-800 dark:text-blue-200">Glucides calculés: {calculatedCarbs.toFixed(1)} g</p>
            </div>
          )}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={onClose} className="w-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 rounded-lg hover:bg-gray-300">Annuler</button>
          <button onClick={handleAddItem} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">Ajouter</button>
        </div>
      </div>
    </div>
  );
};

export default QuickAddItemModal;
