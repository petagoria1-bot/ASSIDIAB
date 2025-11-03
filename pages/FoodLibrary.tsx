import React, { useState, useMemo, useEffect } from 'react';
import { usePatientStore } from '../store/patientStore';
import { Food } from '../types';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

const Plus: React.FC<{ size: number }> = ({ size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const X: React.FC<{ size: number }> = ({ size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const Info: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
);
const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const Globe: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
);
const ArrowLeft: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);


const FoodEditModal = ({ foodToEdit, onClose }: { foodToEdit: Partial<Food> | null, onClose: () => void }) => {
    const { addOrUpdateFood } = usePatientStore();
    const [food, setFood] = useState<Partial<Food>>(foodToEdit || { unit_type: 'g', source: 'Manuel' });
    
    useEffect(() => {
        setFood(foodToEdit || { unit_type: 'g', source: 'Manuel' });
    }, [foodToEdit]);
    
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
    useEffect(() => {
        const total = food.carbs_per_100g_total;
        const fiber = food.fiber_per_100g;

        if (total === undefined || total === null) {
            setFood(prev => ({...prev, carbs_per_100g_net: prev.carbs_per_100g_net || 0, quality: 'incertaine'}));
            return;
        }
        
        const net = total - (fiber || 0);
        const roundedNet = Math.round(net);
        const quality = (fiber === undefined || fiber === null) ? 'incertaine' : 'certaine';
        
        // Only update if it's different to avoid re-renders
        setFood(prev => {
            if (prev.carbs_per_100g_net !== roundedNet || prev.quality !== quality) {
                return {...prev, carbs_per_100g_net: roundedNet, quality };
            }
            return prev;
        });

    }, [food.carbs_per_100g_total, food.fiber_per_100g]);


    if (!foodToEdit) return null;

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
            <input name="source" value={food.source || ''} onChange={handleInputChange} placeholder="Source (ex: GluciCheck)" className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600"/>
            <div className="grid grid-cols-2 gap-2">
                <input type="number" name="carbs_per_100g_total" value={food.carbs_per_100g_total === undefined ? '' : food.carbs_per_100g_total} onChange={handleNumericChange} placeholder="Glucides totaux /100g" className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600"/>
                <input type="number" name="fiber_per_100g" value={food.fiber_per_100g === undefined ? '' : food.fiber_per_100g} onChange={handleNumericChange} placeholder="Fibres /100g" className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600"/>
            </div>
            <div className="p-2 bg-teal-50 dark:bg-teal-900/50 rounded-md text-center">
                <p className="text-sm text-teal-800 dark:text-teal-200">Glucides assimilables calculés</p>
                <p className="font-bold text-lg">{food.carbs_per_100g_net || 0} g / 100g</p>
                {food.quality === 'incertaine' && <p className="text-xs text-yellow-600 dark:text-yellow-400">Qualité incertaine (fibres non fournies)</p>}
            </div>
          </div>
          <div className="mt-6">
            <button onClick={handleSave} className="w-full bg-teal-600 text-white font-bold py-3 rounded-lg hover:bg-teal-700">Sauvegarder</button>
          </div>
        </div>
      </div>
    );
};

const FoodLibrary: React.FC = () => {
  const { foodLibrary } = usePatientStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [foodToEdit, setFoodToEdit] = useState<Partial<Food> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState<'local' | 'online'>('local');
  const [onlineResults, setOnlineResults] = useState<any[]>([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);

  const filteredFoodLibrary = useMemo(() => {
    if (!searchTerm) return foodLibrary.sort((a,b) => a.name.localeCompare(b.name));
    return foodLibrary
      .filter(food => food.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a,b) => a.name.localeCompare(b.name));
  }, [searchTerm, foodLibrary]);

  const handleEdit = (food: Food) => {
    setFoodToEdit(food);
    setIsModalOpen(true);
  }

  const handleAdd = () => {
    setFoodToEdit({}); // New empty food
    setIsModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFoodToEdit(null);
  }
  
  const handleOnlineSearch = async () => {
    if (!searchTerm.trim()) {
        toast.error("Veuillez entrer un terme de recherche.");
        return;
    }
    if (!navigator.onLine) {
        toast.error("La recherche en ligne nécessite une connexion internet.");
        return;
    }

    setIsSearchingOnline(true);
    setOnlineResults([]);
    try {
        const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(searchTerm)}&search_simple=1&action=process&json=1&page_size=20&lc=fr`);
        const data = await response.json();
        setSearchMode('online');
        if (data.products && data.products.length > 0) {
            setOnlineResults(data.products);
        } else {
            toast("Aucun résultat trouvé en ligne.", { icon: '🤷' });
        }
    } catch (error) {
        console.error("Online search failed:", error);
        toast.error("La recherche en ligne a échoué.");
    } finally {
        setIsSearchingOnline(false);
    }
  };
  
  const handleAddOnlineFood = (product: any) => {
      const newFood: Partial<Food> = {
          // No ID, it will be generated on save
          name: product.product_name_fr || product.product_name || 'Nom inconnu',
          category: product.categories?.split(',')[0].trim() || 'En ligne',
          source: `OpenFoodFacts: ${product.brands || ''}`.trim(),
          unit_type: 'g', // Default to 'g', user can change
          carbs_per_100g_total: product.nutriments?.carbohydrates_100g,
          fiber_per_100g: product.nutriments?.fiber_100g,
      };
      setFoodToEdit(newFood);
      setIsModalOpen(true);
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      {isModalOpen && <FoodEditModal foodToEdit={foodToEdit} onClose={handleCloseModal} />}
      
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bibliothèque</h1>
        {searchMode === 'online' && (
            <button onClick={() => setSearchMode('local')} className="flex items-center gap-2 text-sm text-teal-600 dark:text-teal-400 font-semibold">
                <ArrowLeft className="w-4 h-4" />
                Ma bibliothèque
            </button>
        )}
      </div>

      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="w-5 h-5 text-gray-400" />
        </div>
        <input 
          type="text"
          placeholder="Rechercher un aliment..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm"
        />
      </div>
      
      {searchMode === 'local' && (
        <>
          <div className="bg-teal-50 dark:bg-teal-900/50 p-4 rounded-lg mb-4 border border-teal-200 dark:border-teal-700">
            <div className="flex items-start">
                <Info className="w-5 h-5 text-teal-600 dark:text-teal-300 mr-3 mt-1 flex-shrink-0"/>
                <div>
                    <h2 className="font-bold text-teal-800 dark:text-teal-200">Pour une précision maximale</h2>
                    <p className="text-sm text-teal-700 dark:text-teal-300 mt-1">
                        Vérifiez et ajustez les valeurs avec votre source de confiance. Cliquez sur un aliment pour le modifier.
                    </p>
                </div>
            </div>
          </div>
          <div className="space-y-2">
            {filteredFoodLibrary.map(food => (
              <div key={food.id} onClick={() => handleEdit(food)} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <div>
                  <p className="font-semibold">{food.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Source: {food.source}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{food.carbs_per_100g_net}g / 100{food.unit_type}</p>
                  {food.quality === 'incertaine' && <p className="text-xs text-yellow-500">Incertain</p>}
                </div>
              </div>
            ))}
             {searchTerm && (
                <button onClick={handleOnlineSearch} disabled={isSearchingOnline} className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 font-bold rounded-lg hover:bg-teal-200 dark:hover:bg-teal-800/60 transition-colors disabled:opacity-50">
                    <Globe className="w-5 h-5"/>
                    {isSearchingOnline ? 'Recherche...' : `Chercher "${searchTerm}" en ligne`}
                </button>
             )}
          </div>
        </>
      )}

      {searchMode === 'online' && (
         <div className="space-y-2">
            {isSearchingOnline && <p className="text-center text-gray-500 p-4">Recherche en ligne...</p>}
            {onlineResults.map(product => (
              <div key={product.code} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{product.product_name_fr || product.product_name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{product.brands}</p>
                  <p className="text-sm font-bold">{product.nutriments?.carbohydrates_100g || 'N/A'} g / 100g</p>
                </div>
                <button onClick={() => handleAddOnlineFood(product)} className="ml-2 bg-teal-500 text-white font-bold p-2 rounded-lg hover:bg-teal-600 flex-shrink-0">
                    <Plus size={20}/>
                </button>
              </div>
            ))}
            {onlineResults.length === 0 && !isSearchingOnline && (
              <p className="text-center text-gray-500 p-4">Aucun résultat trouvé pour "{searchTerm}".</p>
            )}
         </div>
      )}

      <button
        onClick={handleAdd}
        className="fixed bottom-24 right-4 w-14 h-14 bg-teal-600 rounded-full text-white flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:bg-teal-500 dark:focus:ring-offset-gray-800"
        aria-label="Ajouter un aliment"
      >
        <Plus size={28} />
      </button>
    </div>
  );
};

export default FoodLibrary;