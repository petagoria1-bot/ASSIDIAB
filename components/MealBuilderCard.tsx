import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { MealItem, Food } from '../types';
import { usePatientStore } from '../store/patientStore';
import Card from './Card';
import EditMealItemModal from './EditMealItemModal'; // Import the new modal

interface MealBuilderCardProps {
  mealItems: MealItem[];
  setMealItems: React.Dispatch<React.SetStateAction<MealItem[]>>;
  onOpenPackagingModal: () => void;
  useNetCarbs: boolean;
  setUseNetCarbs: (value: boolean) => void;
}

const InfoIcon: React.FC<{onClick: () => void}> = ({onClick}) => (
    <button onClick={onClick} className="text-text-muted hover:text-emerald-main transition-colors">
        <svg xmlns="http://www.w.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
    </button>
);
const CameraIcon: React.FC = () => <svg xmlns="http://www.w.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>;
const PackageIcon: React.FC = () => <svg xmlns="http://www.w.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v2"></path><path d="M21 14v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="M3 10h18"></path><path d="M12 10v4"></path></svg>;

const CarbModeToggle: React.FC<{ useNetCarbs: boolean; setUseNetCarbs: (value: boolean) => void }> = ({ useNetCarbs, setUseNetCarbs }) => (
    <div className="flex items-center justify-center p-1 bg-input-bg rounded-pill mb-4">
        <button 
            onClick={() => setUseNetCarbs(true)}
            className={`px-4 py-2 w-1/2 rounded-pill text-sm font-semibold transition-all duration-300 ${useNetCarbs ? 'bg-emerald-main text-white shadow' : 'text-text-muted hover:bg-slate-200'}`}
        >
            Glucides Nets
        </button>
        <button 
            onClick={() => setUseNetCarbs(false)}
            className={`px-4 py-2 w-1/2 rounded-pill text-sm font-semibold transition-all duration-300 ${!useNetCarbs ? 'bg-emerald-main text-white shadow' : 'text-text-muted hover:bg-slate-200'}`}
        >
            Glucides Totaux
        </button>
    </div>
);


const MealBuilderCard: React.FC<MealBuilderCardProps> = ({ mealItems, setMealItems, onOpenPackagingModal, useNetCarbs, setUseNetCarbs }) => {
  const { foodLibrary } = usePatientStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [weight, setWeight] = useState('');
  const [isInfoVisible, setInfoVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<MealItem | null>(null);

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
    
    const carbs_per_100g = useNetCarbs 
      ? selectedFood.carbs_per_100g_net 
      : (selectedFood.carbs_per_100g_total ?? selectedFood.carbs_per_100g_net);
      
    const carbs_g = (poids_g / 100) * carbs_per_100g;

    const newItem: MealItem = {
      listId: `${selectedFood.id}-${Date.now()}`,
      food: selectedFood,
      poids_g,
      carbs_g: Math.round(carbs_g)
    };
    
    setMealItems(prevItems => [...prevItems, newItem]);

    // Reset fields
    setSearchTerm('');
    setSelectedFood(null);
    setWeight('');
  };

  const handleRemoveFood = (listId: string) => {
    setMealItems(prevItems => prevItems.filter(item => item.listId !== listId));
  };
  
  const handleUpdateItem = (updatedItem: MealItem) => {
    setMealItems(prevItems => 
        prevItems.map(item => 
            item.listId === updatedItem.listId ? updatedItem : item
        )
    );
    setEditingItem(null);
    toast.success("Quantité modifiée !");
  };

  const handleSelectFood = (food: Food) => {
    setSelectedFood(food);
    setSearchTerm(food.name);
  };

  return (
    <Card>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-display font-semibold text-text-title">
          Repas ({totalCarbs.toFixed(0)}g)
        </h2>
      </div>
      
      <div className="space-y-2 my-4">
        {mealItems.length > 0 ? mealItems.map(item => (
          <button key={item.listId} onClick={() => setEditingItem(item)} className="w-full flex justify-between items-center bg-mint-soft/30 p-2 rounded-lg text-left hover:bg-mint-soft/60 transition-colors">
            <div>
              <p className="font-semibold text-sm text-text-main">{item.food.name}</p>
              <p className="text-xs text-text-muted">{item.poids_g}{item.food.unit_type}</p>
            </div>
            <div className="flex items-center gap-2">
                <p className="font-bold text-sm text-emerald-main">{item.carbs_g.toFixed(0)}g</p>
                <button onClick={(e) => { e.stopPropagation(); handleRemoveFood(item.listId); }} className="text-rose-500 hover:text-rose-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
          </button>
        )) : <p className="text-center text-sm text-text-muted py-2">Le repas est vide.</p>}
      </div>

      <div className="space-y-3 pt-3 border-t border-black/10 relative">
        <div className="flex justify-between items-center">
            <h3 className="font-semibold text-text-title">Ajouter un aliment</h3>
            <InfoIcon onClick={() => setInfoVisible(!isInfoVisible)} />
        </div>
        
        {isInfoVisible && (
            <div className="absolute top-12 right-0 w-full max-w-xs bg-white p-4 rounded-lg shadow-xl border z-10 animate-fade-in-lift text-sm">
                <button onClick={() => setInfoVisible(false)} className="absolute top-2 right-2 text-gray-400">&times;</button>
                <p className="font-bold text-text-title mb-2">Glucides Nets vs Totaux</p>
                <p className="text-text-muted">
                    - <span className="font-semibold">Totaux :</span> Tous les glucides (sucres, amidon, fibres).
                    <br/>
                    - <span className="font-semibold">Nets :</span> Déduit les fibres, qui ont peu d'impact sur la glycémie. C'est souvent plus précis.
                </p>
                <p className="text-xs text-center mt-2 p-1 bg-input-bg rounded">Nets = Totaux - Fibres</p>
            </div>
        )}

        <CarbModeToggle useNetCarbs={useNetCarbs} setUseNetCarbs={setUseNetCarbs} />

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
            <ul className="absolute z-50 w-full bg-white border border-slate-200 rounded-md mt-1 shadow-lg max-h-48 overflow-y-auto">
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
            <button disabled className="flex items-center justify-center gap-2 py-2 px-3 rounded-button bg-white border border-slate-300 text-text-main hover:bg-slate-50 transition-colors opacity-50 cursor-not-allowed">
                <CameraIcon/> Analyse Photo
            </button>
         </div>
      </div>
      {editingItem && (
        <EditMealItemModal
            itemToEdit={editingItem}
            onClose={() => setEditingItem(null)}
            onConfirm={handleUpdateItem}
            useNetCarbs={useNetCarbs}
        />
      )}
    </Card>
  );
};

export default MealBuilderCard;