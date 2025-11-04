import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { MealItem, Food } from '../types';
import { usePatientStore } from '../store/patientStore';
import Card from './Card';

interface MealBuilderCardProps {
  mealItems: MealItem[];
  setMealItems: React.Dispatch<React.SetStateAction<MealItem[]>>;
  onOpenPackagingModal: () => void;
  onOpenAiAnalyzer: () => void;
}

const CameraIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>;
const PackageIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v2"></path><path d="M21 14v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="M3 10h18"></path><path d="M12 10v4"></path></svg>;


const MealBuilderCard: React.FC<MealBuilderCardProps> = ({ mealItems, setMealItems, onOpenPackagingModal, onOpenAiAnalyzer }) => {
  const { foodLibrary } = usePatientStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [weight, setWeight] = useState('');

  const inputClasses = "w-full p-3 bg-input-bg rounded-input border border-black/10 text-text-title placeholder-placeholder-text focus:outline-none focus:border-emerald-main focus:ring-2 focus:ring-emerald-main/30 transition-all duration-150";

  const filteredFood = useMemo(() => {
    if (searchTerm.length < 2) return [];
    return foodLibrary.filter(food =>
      food.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
  }, [searchTerm, foodLibrary]);

  const totalCarbs = useMemo(() => mealItems.reduce((sum, item) => sum + item.carbs_g, 0), [mealItems]);

  const handleAddFood = () => {
    if (!selectedFood) return;
    
    const poids_g = parseFloat(weight.replace(',', '.'));
    if (isNaN(poids_g) || poids_g <= 0) {
        toast.error("Veuillez entrer un poids valide.");
        return;
    }
    
    const carbs_g = (poids_g / 100) * selectedFood.carbs_per_100g_net;

    const newItem: MealItem = {
      listId: `${selectedFood.id}-${Date.now()}`,
      food: selectedFood,
      poids_g,
      carbs_g: Math.round(carbs_g)
    };
    
    // Fix: Corrected typo 'prev' to 'prevItems' and completed the line.
    setMealItems(prevItems => [...prevItems, newItem]);

    // Reset fields
    setSearchTerm('');
    setSelectedFood(null);
    setWeight('');
  };

  const handleRemoveFood = (listId: string) => {
    setMealItems(prevItems => prevItems.filter(item => item.listId !== listId));
  };

  const handleSelectFood = (food: Food) => {
    setSelectedFood(food);
    setSearchTerm(food.name);
  };

  return (
    <Card>
      <h2 className="text-xl font-display font-semibold text-text-title mb-4">
        Repas ({totalCarbs.toFixed(0)}g)
      </h2>
      
      <div className="space-y-2 mb-4">
        {mealItems.length > 0 ? mealItems.map(item => (
          <div key={item.listId} className="flex justify-between items-center bg-mint-soft/30 p-2 rounded-lg">
            <div>
              <p className="font-semibold text-sm text-text-main">{item.food.name}</p>
              <p className="text-xs text-text-muted">{item.poids_g}{item.food.unit_type}</p>
            </div>
            <div className="flex items-center gap-2">
                <p className="font-bold text-sm text-emerald-main">{item.carbs_g.toFixed(0)}g</p>
                <button onClick={() => handleRemoveFood(item.listId)} className="text-rose-500 hover:text-rose-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
          </div>
        )) : <p className="text-center text-sm text-text-muted py-2">Le repas est vide.</p>}
      </div>

      <div className="space-y-3 pt-3 border-t border-black/10">
        <h3 className="font-semibold text-text-title">Ajouter un aliment</h3>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={e => {
                setSearchTerm(e.target.value);
                if(selectedFood) setSelectedFood(null);
            }}
            placeholder="Rechercher un aliment..."
            className={inputClasses}
          />
          {filteredFood.length > 0 && !selectedFood && (
            <ul className="absolute z-10 w-full bg-white border border-slate-200 rounded-md mt-1 shadow-lg max-h-48 overflow-y-auto">
              {filteredFood.map(food => (
                <li key={food.id} onClick={() => handleSelectFood(food)} className="p-2 hover:bg-slate-100 cursor-pointer text-sm">
                  {food.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedFood && (
            <div className="grid grid-cols-3 gap-2 items-end">
                <div className="col-span-1">
                    <label className="block text-xs font-medium text-text-muted mb-1">Poids ({selectedFood.unit_type})</label>
                     <input
                        type="number"
                        inputMode="decimal"
                        value={weight}
                        onChange={e => setWeight(e.target.value)}
                        placeholder="Ex: 150"
                        className={inputClasses}
                    />
                </div>
                <div className="col-span-2">
                   <button onClick={handleAddFood} className="w-full bg-emerald-main text-white font-bold py-3 rounded-button hover:bg-jade-deep-dark transition-colors">
                        Ajouter au repas
                    </button>
                </div>
            </div>
        )}
        
         <div className="grid grid-cols-2 gap-2 text-sm pt-2">
            <button onClick={onOpenPackagingModal} className="flex items-center justify-center gap-2 py-2 px-3 rounded-button bg-white border border-slate-300 text-text-main hover:bg-slate-50 transition-colors">
                <PackageIcon/> Calcul Emballage
            </button>
            <button onClick={onOpenAiAnalyzer} className="flex items-center justify-center gap-2 py-2 px-3 rounded-button bg-white border border-slate-300 text-text-main hover:bg-slate-50 transition-colors">
                <CameraIcon/> Analyse Photo
            </button>
         </div>
      </div>
    </Card>
  );
};

export default MealBuilderCard;
