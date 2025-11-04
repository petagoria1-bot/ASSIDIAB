import React, { useState, useMemo } from 'react';
import { usePatientStore } from '../store/patientStore';
import Card from '../components/Card';
import AddFoodModal from '../components/AddFoodModal'; // Import the new modal
import { Food } from '../types';

const FoodLibrary: React.FC = () => {
  const { foodLibrary } = usePatientStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setAddModalOpen] = useState(false); // State for the modal

  const filteredFood = useMemo(() => {
    if (!searchTerm) {
        return foodLibrary.sort((a,b) => a.name.localeCompare(b.name));
    }
    return foodLibrary.filter(food =>
      food.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [searchTerm, foodLibrary]);
  
  const inputClasses = "w-full p-3 bg-input-bg rounded-input border border-black/10 text-text-title placeholder-placeholder-text focus:outline-none focus:border-emerald-main focus:ring-2 focus:ring-emerald-main/30 transition-all duration-150";

  return (
    <div className="p-4 space-y-4">
      <header className="py-4 text-center">
        <h1 className="text-3xl font-display font-bold text-white text-shadow">Bibliothèque d'aliments</h1>
      </header>
      <div className="sticky top-0 bg-white/30 backdrop-blur-sm py-2 z-10 -mx-4 px-4 shadow-sm">
        <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Rechercher parmi ${foodLibrary.length} aliments...`}
            className={inputClasses}
        />
      </div>

      <div className="space-y-2 pb-20">
        {filteredFood.map(food => (
          <Card key={food.id} className="animate-fade-in-lift">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-text-main">{food.name}</p>
                <p className="text-xs text-text-muted">{food.source}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-main">{food.carbs_per_100g_net}g</p>
                <p className="text-xs text-text-muted">pour 100{food.unit_type}</p>
              </div>
            </div>
          </Card>
        ))}
         {filteredFood.length === 0 && (
            <Card className="text-center">
                <p className="text-text-muted">Aucun aliment trouvé pour "{searchTerm}".</p>
            </Card>
         )}
      </div>
      
      <button 
        onClick={() => setAddModalOpen(true)} 
        className="fixed bottom-24 right-5 bg-emerald-main text-white rounded-full p-4 shadow-lg hover:bg-jade-deep-dark transition-all duration-200 transform hover:scale-105"
        aria-label="Ajouter un aliment"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      </button>

      {isAddModalOpen && <AddFoodModal onClose={() => setAddModalOpen(false)} />}
    </div>
  );
};

export default FoodLibrary;
