import React, { useState, useMemo } from 'react';
import { usePatientStore } from '../store/patientStore.ts';
import Card from '../components/Card.tsx';
import AddFoodModal from '../components/AddFoodModal.tsx'; // Import the new modal
import { Food } from '../types.ts';
// FIX: Changed import to be a relative path and added file extension for proper module resolution.
import useTranslations from '../hooks/useTranslations.ts';
import EditIcon from '../components/icons/EditIcon.tsx';

const FoodLibrary: React.FC = () => {
  const { foodLibrary } = usePatientStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const t = useTranslations();

  const filteredFood = useMemo(() => {
    if (!searchTerm) {
        return foodLibrary.sort((a,b) => a.name.localeCompare(b.name));
    }
    return foodLibrary.filter(food =>
      food.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [searchTerm, foodLibrary]);
  
  const inputClasses = "w-full p-3 bg-input-bg rounded-input border border-black/10 text-text-title placeholder-placeholder-text focus:outline-none focus:border-emerald-main focus:ring-2 focus:ring-emerald-main/30 transition-all duration-150";

  const handleCloseModal = () => {
    setAddModalOpen(false);
    setEditingFood(null);
  }

  return (
    <div className="p-4 space-y-4">
      <header className="py-4 text-center">
        <h1 className="text-3xl font-display font-bold text-white text-shadow">{t.foodLibrary_title}</h1>
      </header>
      <div className="sticky top-0 bg-white/30 backdrop-blur-sm py-2 z-10 -mx-4 px-4 shadow-sm">
        <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.foodLibrary_searchPlaceholder(foodLibrary.length)}
            className={inputClasses}
        />
      </div>

      <div className="space-y-2 pb-20">
        {filteredFood.map(food => (
          <Card key={food.id} className="animate-fade-in-lift">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-text-main">{food.name}</p>
                 <button onClick={() => setEditingFood(food)} className="text-text-muted hover:text-emerald-main transition-colors">
                    <EditIcon />
                </button>
              </div>
              <div className="text-end">
                <p className="font-bold text-emerald-main">{food.carbs_per_100g_net}g</p>
                <p className="text-xs text-text-muted">{t.foodLibrary_per100(food.unit_type)}</p>
              </div>
            </div>
          </Card>
        ))}
         {filteredFood.length === 0 && (
            <Card className="text-center">
                <p className="text-text-muted">{t.foodLibrary_noResults(searchTerm)}</p>
            </Card>
         )}
      </div>
      
      <button 
        onClick={() => setAddModalOpen(true)} 
        className="fixed bottom-24 end-5 bg-emerald-main text-white rounded-full p-4 shadow-lg hover:bg-jade-deep-dark transition-all duration-200 transform hover:scale-105"
        aria-label={t.foodLibrary_addFood}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      </button>

      {(isAddModalOpen || editingFood) && (
        <AddFoodModal 
            onClose={handleCloseModal} 
            foodToEdit={editingFood || undefined} 
        />
      )}
    </div>
  );
};

export default FoodLibrary;