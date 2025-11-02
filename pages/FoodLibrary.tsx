import React, { useState, useMemo } from 'react';
import { usePatientStore } from '../store/patientStore';
import { Food } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Plus, X, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const FoodEditModal = ({ foodToEdit, onClose }: { foodToEdit: Partial<Food> | null, onClose: () => void }) => {
    const { addOrUpdateFood } = usePatientStore();
    const [food, setFood] = useState<Partial<Food>>(foodToEdit || { unit_type: 'g', source: 'Manuel' });
    
    const handleSave = async () => {
        if (!food.name || food.carbs_per_100g_net === undefined) {
            toast.error("Le nom et les glucides nets sont obligatoires.");
            return;
        }

        const foodToSave: Food = {
            id: food.id || uuidv4(),
            name: food.name,
            category: food.category || 'Divers',
            carbs_per_100g_net: food.carbs_per_100g_net,
            unit_type: food.unit_type || 'g',
            source: food.source || 'Manuel',
            carbs_per_100g_total: food.carbs_per_100g_total,
            fiber_per_100g: food.fiber_per_100g,
            quality: food.quality,
        };

        await addOrUpdateFood(foodToSave);
        toast.success(`Aliment "${food.name}" sauvegardé.`);
        onClose();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFood(prev => ({ ...prev, [name]: value }));
    };

    const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const numValue = value === '' ? undefined : parseFloat(value);
      setFood(prev => ({...prev, [name]: numValue }));
    }

    // Auto-calculate net carbs
    useMemo(() => {
        const total = food.carbs_per_100g_total;
        const fiber = food.fiber_per_100g;

        if (total === undefined || total === null) {
            setFood(prev => ({...prev, carbs_per_100g_net: 0, quality: 'incertaine'}));
            return;
        }
        
        const net = total - (fiber || 0);
        const roundedNet = Math.round(net);
        const quality = (fiber === undefined || fiber === null) ? 'incertaine' : 'certaine';
        
        setFood(prev => ({...prev, carbs_per_100g_net: roundedNet, quality }));

    }, [food.carbs_per_100g_total, food.fiber_per_100g]);


    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50" onClick={onClose}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">{food.id ? 'Modifier un aliment' : 'Ajouter un aliment'}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24}/></button>
          </div>
          <div className="space-y-3">
            <input name="name" value={food.name || ''} onChange={handleInputChange} placeholder="Nom de l'aliment" className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600"/>
            <input name="category" value={food.category || ''} onChange={handleInputChange} placeholder="Catégorie (ex: Fruit)" className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600"/>
            <input name="source" value={food.source || ''} onChange={handleInputChange} placeholder="Source (ex: GluciCheckManuel)" className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600"/>
            <div className="grid grid-cols-2 gap-2">
                <input type="number" name="carbs_per_100g_total" value={food.carbs_per_100g_total === undefined ? '' : food.carbs_per_100g_total} onChange={handleNumericChange} placeholder="Glucides totaux /100g" className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600"/>
                <input type="number" name="fiber_per_100g" value={food.fiber_per_100g === undefined ? '' : food.fiber_per_100g} onChange={handleNumericChange} placeholder="Fibres /100g" className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600"/>
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/50 rounded-md text-center">
                <p className="text-sm text-blue-800 dark:text-blue-200">Glucides assimilables calculés</p>
                <p className="font-bold text-lg">{food.carbs_per_100g_net || 0} g / 100g</p>
                {food.quality === 'incertaine' && <p className="text-xs text-yellow-600 dark:text-yellow-400">Qualité incertaine (fibres non fournies)</p>}
            </div>
          </div>
          <div className="mt-6">
            <button onClick={handleSave} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">Sauvegarder</button>
          </div>
        </div>
      </div>
    );
};

const FoodLibrary: React.FC = () => {
  const { foodLibrary } = usePatientStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [foodToEdit, setFoodToEdit] = useState<Partial<Food> | null>(null);

  const hasCustomFood = useMemo(() => 
    foodLibrary.some(f => f.source.toLowerCase().includes('manuel')), 
  [foodLibrary]);

  const handleEdit = (food: Food) => {
    setFoodToEdit(food);
    setIsModalOpen(true);
  }

  const handleAdd = () => {
    setFoodToEdit(null);
    setIsModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFoodToEdit(null);
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      {isModalOpen && <FoodEditModal foodToEdit={foodToEdit} onClose={handleCloseModal} />}
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Bibliothèque d'aliments</h1>
      
      {!hasCustomFood && (
          <div className="bg-blue-50 dark:bg-blue-900/50 p-4 rounded-lg mb-4 border border-blue-200 dark:border-blue-700">
              <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-300 mr-3 mt-1 flex-shrink-0"/>
                  <div>
                      <h2 className="font-bold text-blue-800 dark:text-blue-200">Construisez votre base de confiance</h2>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          Cette liste est une base de départ. Pour une précision maximale, ajoutez vos propres aliments en utilisant les valeurs de votre diététicien ou de l'application Gluci-Check de l'hôpital.
                      </p>
                  </div>
              </div>
          </div>
      )}

      <div className="space-y-2">
        {foodLibrary.sort((a,b) => a.name.localeCompare(b.name)).map(food => (
          <div key={food.id} onClick={() => handleEdit(food)} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
            <div>
              <p className="font-semibold">{food.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Source: {food.source}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">{food.carbs_per_100g_net}g / 100{food.unit_type}</p>
              {food.quality === 'incertaine' && <p className="text-xs text-yellow-500">Qualité incertaine</p>}
            </div>
          </div>
        ))}
      </div>
       <button
        onClick={handleAdd}
        className="fixed bottom-24 right-4 w-14 h-14 bg-blue-600 rounded-full text-white flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:focus:ring-offset-gray-800"
        aria-label="Ajouter un aliment"
      >
        <Plus size={28} />
      </button>
    </div>
  );
};

export default FoodLibrary;