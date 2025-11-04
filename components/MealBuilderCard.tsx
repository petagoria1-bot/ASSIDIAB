import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { MealItem, Food } from '../types';
import { usePatientStore } from '../store/patientStore';
import Card from './Card';

interface MealBuilderCardProps {
  mealItems: MealItem[];
  setMealItems: React.Dispatch<React.SetStateAction<MealItem[]>>;
  onOpenPackagingModal: () => void;
}

const MealBuilderCard: React.FC<MealBuilderCardProps> = ({ mealItems, setMealItems, onOpenPackagingModal }) => {
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
    
    setMealItems(prevItems => [...prevItems, newItem]);
    
    setSearchTerm('');
    setSelectedFood(null);
    setWeight('');
  };
  
  const handleRemoveItem = (listId: string) => {
    setMealItems(prevItems => prevItems.filter(item => item.listId !== listId));
  };

  const handleSelectFood = (food: Food) => {
    setSelectedFood(food);
    setSearchTerm(food.name);
  }
  
  return (
    <Card>
        <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-display font-semibold text-text-title">Composition du repas</h2>
            <div className="text-right">
                <p className="font-bold text-2xl text-emerald-main">{totalCarbs.toFixed(0)} g</p>
                <p className="text-sm text-text-muted -mt-1">Total Glucides</p>
            </div>
        </div>
        
        <div className="space-y-2">
            <div className="relative">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (selectedFood) setSelectedFood(null);
                    }}
                    placeholder="Rechercher un aliment..."
                    className={`${inputClasses} pl-10`}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
            </div>

            {filteredFood.length > 0 && !selectedFood && (
                <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-md max-h-48 overflow-y-auto border border-black/5">
                    {filteredFood.map(food => (
                        <button key={food.id} onClick={() => handleSelectFood(food)} className="w-full text-left p-3 hover:bg-mint-soft/50 transition-colors block text-text-main">
                            {food.name}
                        </button>
                    ))}
                </div>
            )}
            
            {selectedFood && (
                 <div className="flex gap-2 animate-fade-in">
                    <input
                        type="number"
                        inputMode="decimal"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder={`Poids en ${selectedFood.unit_type}`}
                        className={`${inputClasses} flex-grow`}
                        autoFocus
                    />
                    <button onClick={handleAddFood} className="bg-emerald-main text-white font-bold px-4 rounded-button hover:bg-jade-deep-dark transition-colors shadow-sm">
                        Ajouter
                    </button>
                 </div>
            )}
        </div>
        
        <button
            onClick={onOpenPackagingModal}
            className="w-full text-center text-sm font-semibold text-emerald-main py-2 rounded-lg bg-emerald-main/10 hover:bg-emerald-main/20 transition-colors mt-2"
        >
            Calculer depuis l'emballage
        </button>

        {mealItems.length > 0 && (
            <div className="space-y-2 mt-4 pt-4 border-t border-black/10">
                {mealItems.map(item => (
                    <div key={item.listId} className="flex items-center justify-between bg-mint-soft/50 p-2 rounded-lg animate-fade-in">
                        <div>
                            <p className="font-medium text-text-main">{item.food.name}</p>
                            <p className="text-xs text-text-muted">{item.poids_g} {item.food.unit_type}</p>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="font-semibold text-text-main">{item.carbs_g.toFixed(0)} g</span>
                           <button onClick={() => handleRemoveItem(item.listId)} className="text-danger/70 hover:text-danger transition-colors">
                             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                           </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </Card>
  );
};

export default MealBuilderCard;