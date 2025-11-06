import React, { useState, useEffect, useMemo } from 'react';
import { usePatientStore } from '../store/patientStore.ts';
import { Food, MealItem, FavoriteMeal } from '../types.ts';
import useTranslations from '../hooks/useTranslations.ts';
import AddFoodConfirmationModal from './AddFoodConfirmationModal.tsx';
import EditMealItemModal from './EditMealItemModal.tsx';
import PackagingCalculatorModal from './PackagingCalculatorModal.tsx';
import TrashIcon from './icons/TrashIcon.tsx';
import EditIcon from './icons/EditIcon.tsx';
import MiniCarbIndicator from './MiniCarbIndicator.tsx';
import PackagingIcon from './icons/PackagingIcon.tsx';
import CameraIcon from './icons/CameraIcon.tsx';
import toast from 'react-hot-toast';
import CloseIcon from './icons/CloseIcon.tsx';

interface MealBuilderCardProps {
  onTotalCarbsChange: (totalCarbs: number) => void;
  onMealItemsChange: (items: MealItem[]) => void;
}

const MealBuilderCard: React.FC<MealBuilderCardProps> = ({ onTotalCarbsChange, onMealItemsChange }) => {
  const { foodLibrary, favoriteMeals } = usePatientStore();
  const t = useTranslations();

  const [mealItems, setMealItems] = useState<MealItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [editingItem, setEditingItem] = useState<MealItem | null>(null);
  const [isPackagingModalOpen, setPackagingModalOpen] = useState(false);
  const [useNetCarbs, setUseNetCarbs] = useState(true);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);

  useEffect(() => {
    const totalCarbs = mealItems.reduce((sum, item) => sum + item.carbs_g, 0);
    onTotalCarbsChange(Math.round(totalCarbs));
    onMealItemsChange(mealItems);
  }, [mealItems, onTotalCarbsChange, onMealItemsChange]);
  
  const handleAddItem = (item: MealItem) => {
    setMealItems(prev => [...prev, item]);
    setSelectedFood(null);
    setSearchTerm('');
    setPackagingModalOpen(false);
  };

  const handleUpdateItem = (updatedItem: MealItem) => {
    setMealItems(prev => prev.map(item => item.listId === updatedItem.listId ? updatedItem : item));
    setEditingItem(null);
  };
  
  const handleRemoveItem = (listId: string) => {
    setMealItems(prev => prev.filter(item => item.listId !== listId));
    setItemToRemove(null);
    toast.success(t.toast_foodRemoved);
  };

  const filteredFood = useMemo(() => {
    if (searchTerm.trim().length < 2) return [];
    return foodLibrary.filter(food =>
      food.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
  }, [searchTerm, foodLibrary]);

  const totalCarbs = useMemo(() => mealItems.reduce((sum, item) => sum + item.carbs_g, 0), [mealItems]);
  
  return (
    <div className={`bg-white/[.85] rounded-card p-5 shadow-glass border border-black/5 transition-all duration-300 ease-fast space-y-4`}>
      <div>
        <h2 className="text-lg font-semibold text-text-title mb-3">{t.mealBuilder_title}</h2>
        <div className={`transition-all duration-300 ease-fast bg-white rounded-input border ${isFocused ? 'border-emerald-main ring-2 ring-emerald-main/30' : 'border-black/10'}`}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={t.mealBuilder_searchPlaceholder}
            className="w-full p-3 bg-transparent text-text-title placeholder-placeholder-text focus:outline-none"
          />
           {searchTerm.length > 0 && (
            <div className="border-t border-slate-200">
              {filteredFood.map(food => (
                <div key={food.id} onClick={() => setSelectedFood(food)} className="p-3 hover:bg-slate-50 cursor-pointer flex justify-between items-center odd:bg-emerald-main/5">
                  <span>{food.name}</span>
                  <span className="text-sm text-text-muted">{food.carbs_per_100g_net}g / 100{food.unit_type}</span>
                </div>
              ))}
            </div>
           )}
        </div>
      </div>
      
      {searchTerm.length === 0 && (
        <div className="space-y-4 animate-fade-in">
           {mealItems.length === 0 && (
            <p className="text-center text-sm text-text-muted py-2">{t.mealBuilder_start}</p>
           )}
           <div className="grid grid-cols-2 gap-3 text-center text-sm font-semibold">
              <button onClick={() => setPackagingModalOpen(true)} className="flex flex-col items-center justify-center p-3 bg-mint-soft/40 rounded-lg hover:bg-mint-soft transition-colors space-y-2 text-jade-deep">
                  <PackagingIcon className="w-8 h-8"/>
                  <span>{t.mealBuilder_packagingCalc}</span>
              </button>
               <button onClick={() => toast.error(t.toast_comingSoon)} className="flex flex-col items-center justify-center p-3 bg-slate-200/50 rounded-lg transition-colors space-y-2 text-text-muted cursor-not-allowed">
                  <CameraIcon className="w-8 h-8"/>
                  <span className="opacity-70">{t.mealBuilder_photoScan}</span>
              </button>
          </div>
        </div>
      )}

      {/* Meal Items List */}
      <div className="space-y-2">
        {mealItems.map(item => (
          <div key={item.listId} className="bg-input-bg/70 p-2 rounded-lg flex items-center justify-between animate-fade-in" onClick={() => setItemToRemove(null)}>
            <div className="flex items-center gap-3">
              <MiniCarbIndicator carbs_g={item.carbs_g} />
              <div>
                  <p className="font-semibold text-text-main text-sm">{item.food.name}</p>
                  <p className="text-xs text-text-muted">{item.poids_g}{item.food.unit_type}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
                <button onClick={() => setEditingItem(item)} className="p-2 text-text-muted hover:text-emerald-main rounded-full hover:bg-white/50 transition-colors"><EditIcon className="w-5 h-5" /></button>
                {itemToRemove === item.listId ? (
                    <button onClick={() => handleRemoveItem(item.listId)} className="p-2 text-white bg-danger rounded-full transition-colors"><TrashIcon className="w-5 h-5" /></button>
                ) : (
                    <button onClick={() => setItemToRemove(item.listId)} className="p-2 text-text-muted hover:text-danger rounded-full hover:bg-white/50 transition-colors" aria-label={t.mealBuilder_removeItemAria(item.food.name)}>
                        <CloseIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
          </div>
        ))}
        {mealItems.length > 0 && (
          <div className="text-end font-bold text-text-title pt-2 border-t border-slate-200 mt-4">
            Total: {totalCarbs.toFixed(0)}g
          </div>
        )}
      </div>
      
      {/* Modals */}
      {selectedFood && <AddFoodConfirmationModal food={selectedFood} onClose={() => setSelectedFood(null)} onConfirm={handleAddItem} useNetCarbs={useNetCarbs} />}
      {editingItem && <EditMealItemModal itemToEdit={editingItem} onClose={() => setEditingItem(null)} onConfirm={handleUpdateItem} useNetCarbs={useNetCarbs} />}
      {isPackagingModalOpen && <PackagingCalculatorModal onClose={() => setPackagingModalOpen(false)} onConfirm={handleAddItem} useNetCarbs={useNetCarbs} />}
    </div>
  );
};

export default MealBuilderCard;