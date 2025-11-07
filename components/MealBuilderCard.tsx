import React, { useState, useMemo, useEffect } from 'react';
import { usePatientStore } from '../store/patientStore.ts';
import { Food, MealItem } from '../types.ts';
import useTranslations from '../hooks/useTranslations.ts';
import Card from './Card.tsx';
import AddFoodConfirmationModal from './AddFoodConfirmationModal.tsx';
import PackagingCalculatorModal from './PackagingCalculatorModal.tsx';
import EditMealItemModal from './EditMealItemModal.tsx';
import MiniCarbIndicator from './MiniCarbIndicator.tsx';
import TrashIcon from './icons/TrashIcon.tsx';
import EditIcon from './icons/EditIcon.tsx';
import PackagingIcon from './icons/PackagingIcon.tsx';
import CameraIcon from './icons/CameraIcon.tsx';
import ToggleSwitch from './ToggleSwitch.tsx';

interface MealBuilderCardProps {
  onTotalCarbsChange: (totalCarbs: number) => void;
  onMealItemsChange: (items: MealItem[]) => void;
}

const MealBuilderCard: React.FC<MealBuilderCardProps> = ({ onTotalCarbsChange, onMealItemsChange }) => {
  const t = useTranslations();
  const { foodLibrary } = usePatientStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [mealItems, setMealItems] = useState<MealItem[]>([]);
  const [useNetCarbs, setUseNetCarbs] = useState(true);
  
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [editingItem, setEditingItem] = useState<MealItem | null>(null);
  const [isPackagingModalOpen, setPackagingModalOpen] = useState(false);

  const filteredFood = useMemo(() => {
    if (!searchTerm) return [];
    return foodLibrary
      .filter(food => food.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 5);
  }, [searchTerm, foodLibrary]);

  useEffect(() => {
    const total = mealItems.reduce((sum, item) => sum + item.carbs_g, 0);
    onTotalCarbsChange(total);
    onMealItemsChange(mealItems);
  }, [mealItems, onTotalCarbsChange, onMealItemsChange]);

  const handleAddItem = (item: MealItem) => {
    setMealItems(prev => [...prev, item]);
    setSelectedFood(null);
    setPackagingModalOpen(false);
    setSearchTerm('');
  };

  const handleUpdateItem = (updatedItem: MealItem) => {
    setMealItems(prev => prev.map(item => item.listId === updatedItem.listId ? updatedItem : item));
    setEditingItem(null);
  };

  const handleRemoveItem = (listId: string) => {
    setMealItems(prev => prev.filter(item => item.listId !== listId));
  };
  
  const totalCarbs = useMemo(() => mealItems.reduce((sum, item) => sum + item.carbs_g, 0), [mealItems]);

  return (
    <>
      <Card>
        <h2 className="text-lg font-semibold text-text-title mb-3">{t.mealBuilder_title}</h2>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.mealBuilder_searchPlaceholder}
            className="w-full p-3 bg-input-bg rounded-input border border-black/10 text-text-title placeholder-placeholder-text focus:outline-none focus:border-emerald-main focus:ring-2 focus:ring-emerald-main/30 transition-all duration-150"
          />
          {searchTerm && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 max-h-60 overflow-y-auto">
              {filteredFood.length > 0 ? (
                filteredFood.map(food => (
                  <div key={food.id} onClick={() => setSelectedFood(food)} className="p-3 hover:bg-slate-100 cursor-pointer flex justify-between items-center">
                    <span>{food.name}</span>
                    <span className="text-sm text-text-muted">{useNetCarbs ? food.carbs_per_100g_net : (food.carbs_per_100g_total || food.carbs_per_100g_net)}g / 100{food.unit_type}</span>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-text-muted">{t.mealBuilder_noResults}</div>
              )}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-2">
            <button onClick={() => setPackagingModalOpen(true)} className="flex items-center justify-center gap-2 p-2 text-sm font-semibold bg-white rounded-md border border-slate-300 hover:bg-slate-50 text-text-main">
                <PackagingIcon className="w-5 h-5" />
                {t.mealBuilder_addFromPackaging}
            </button>
             <button disabled className="flex items-center justify-center gap-2 p-2 text-sm font-semibold bg-white rounded-md border border-slate-300 text-text-muted opacity-50 cursor-not-allowed">
                <CameraIcon className="w-5 h-5" />
                {t.mealBuilder_scanBarcode}
            </button>
        </div>

        <div className="mt-4">
          <h3 className="text-md font-semibold text-text-title">{t.mealBuilder_currentMeal}</h3>
          <div className="mt-2 space-y-2">
            {mealItems.length > 0 ? (
              mealItems.map(item => (
                <div key={item.listId} className="bg-input-bg/70 p-2 rounded-lg flex items-center justify-between animate-fade-in-fast">
                  <div className="flex items-center gap-3">
                    <MiniCarbIndicator carbs_g={item.carbs_g} />
                    <div>
                      <p className="font-semibold text-text-main">{item.food.name}</p>
                      <p className="text-xs text-text-muted">{item.poids_g}{item.food.unit_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditingItem(item)} className="text-text-muted hover:text-emerald-main p-1"><EditIcon /></button>
                    <button onClick={() => handleRemoveItem(item.listId)} className="text-text-muted hover:text-danger p-1"><TrashIcon /></button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-text-muted p-4">{t.mealBuilder_emptyMeal}</p>
            )}
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-slate-200/80 flex justify-between items-center">
            <div className="flex items-center gap-2">
                 <ToggleSwitch isOn={useNetCarbs} onToggle={() => setUseNetCarbs(!useNetCarbs)} ariaLabel="Use net carbs" />
                 <span className="text-xs font-semibold text-text-muted">{useNetCarbs ? t.mealBuilder_netCarbs.toUpperCase() : t.mealBuilder_totalCarbs.toUpperCase() }</span>
            </div>
          <div>
            <span className="text-sm font-semibold text-text-muted">{t.mealBuilder_totalCarbs}: </span>
            <span className="font-display font-bold text-2xl text-emerald-main">{totalCarbs.toFixed(0)}g</span>
          </div>
        </div>
      </Card>

      {selectedFood && (
        <AddFoodConfirmationModal
          food={selectedFood}
          onClose={() => setSelectedFood(null)}
          onConfirm={handleAddItem}
          useNetCarbs={useNetCarbs}
        />
      )}
      {isPackagingModalOpen && (
        <PackagingCalculatorModal
          onClose={() => setPackagingModalOpen(false)}
          onConfirm={handleAddItem}
          useNetCarbs={useNetCarbs}
        />
      )}
      {editingItem && (
        <EditMealItemModal
          itemToEdit={editingItem}
          onClose={() => setEditingItem(null)}
          onConfirm={handleUpdateItem}
          useNetCarbs={useNetCarbs}
        />
      )}
    </>
  );
};

export default MealBuilderCard;