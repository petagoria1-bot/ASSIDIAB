import React, { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { usePatientStore } from '../store/patientStore';
import { MealTime, Page, Mesure, Repas, Injection, DoseCalculationOutput, Food, MealItem, FoodItem } from '../types';
import { MEAL_TIMES } from '../constants';
import { calculateDose } from '../services/calculator';
import QuickAddItemModal from '../components/QuickAddItemModal';

const Droplets: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.49-2.2-1.25-3.25A4.42 4.42 0 0 0 11 6.05c0-2.23-1.8-4.05-4-4.05S3 3.82 3 6.05c0 1.16.49 2.2 1.25 3.25A4.42 4.42 0 0 0 3 12.25C3 14.47 4.8 16.3 7 16.3z"></path><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.54 2.52 2.55 4.5 5 5 .44 2.45-.56 4.95-2.42 6.62"></path></svg>
);
const Plus: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const Wheat: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 22 16 8l-4-4-2 2 4 4-2.5 2.5-4.5 4.5-1.5-1.5z"></path><path d="m18 12 2-2-4.5-4.5-2 2 4.5 4.5z"></path><path d="M16 8s2-2 4-4"></path><path d="M18.5 4.5s2 2 4 4"></path></svg>
);
const Star: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);
const Trash2: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);


interface DoseCalculatorProps {
  setCurrentPage: (page: Page) => void;
}

const FoodItemModal = ({
  modalConfig,
  onClose,
  onSave,
  onDelete,
}: {
  modalConfig: { item: MealItem; isNew: boolean };
  onClose: () => void;
  onSave: (item: MealItem) => void;
  onDelete: (listId: string) => void;
}) => {
  const { item, isNew } = modalConfig;
  const isLiquid = item.food.unit_type === 'ml';

  const [quantityStr, setQuantityStr] = useState('');
  const [carbsStr, setCarbsStr] = useState('');
  const [currentUnit, setCurrentUnit] = useState<'g' | 'ml' | 'cl'>('g');
  const [isCarbsEdited, setIsCarbsEdited] = useState(false);

  useEffect(() => {
    let initialQuantity = item.poids_g;
    let initialUnit: 'g' | 'ml' | 'cl' = isLiquid ? 'ml' : 'g';

    if (isLiquid && item.poids_g >= 100 && item.poids_g % 10 === 0) {
      initialQuantity = item.poids_g / 10;
      initialUnit = 'cl';
    } else if (isNew) {
      initialQuantity = item.poids_g;
      initialUnit = isLiquid ? 'ml' : 'g';
    }

    setQuantityStr(initialQuantity.toString());
    setCarbsStr(item.carbs_g.toFixed(0));
    setCurrentUnit(initialUnit);
    setIsCarbsEdited(false);
  }, [item, isLiquid, isNew]);

  useEffect(() => {
    if (isCarbsEdited) return;

    const quantity = parseFloat(quantityStr);
    if (!isNaN(quantity) && quantity >= 0) {
      let quantityInBaseUnit = quantity;
      if (currentUnit === 'cl') {
          quantityInBaseUnit = quantity * 10;
      }
      const calculatedCarbs = (quantityInBaseUnit / 100) * item.food.carbs_per_100g_net;
      setCarbsStr(calculatedCarbs.toFixed(0));
    } else {
      setCarbsStr('0');
    }
  }, [quantityStr, currentUnit, item.food.carbs_per_100g_net, isCarbsEdited]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantityStr(e.target.value);
    setIsCarbsEdited(false);
  };
  
  const handleCarbsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCarbsStr(e.target.value);
    setIsCarbsEdited(true);
  };

  const handleUnitChange = (newUnit: 'g' | 'ml' | 'cl') => {
    const oldQuantity = parseFloat(quantityStr) || 0;
    
    let baseQuantity = oldQuantity;
    if (currentUnit === 'cl') {
        baseQuantity = oldQuantity * 10;
    }

    let newQuantity = baseQuantity;
    if (newUnit === 'cl') {
        newQuantity = baseQuantity / 10;
    }
    
    setQuantityStr(Number.isFinite(newQuantity) ? newQuantity.toString() : '0');
    setCurrentUnit(newUnit);
    setIsCarbsEdited(false);
  }

  const handleSave = () => {
    const quantity = parseFloat(quantityStr);
    const carbs = parseFloat(carbsStr);
    if (isNaN(quantity) || quantity < 0 || isNaN(carbs) || carbs < 0) {
      toast.error("La quantité et les glucides doivent être des nombres positifs.");
      return;
    }
    
    let finalQuantityInBaseUnit = quantity;
    if (currentUnit === 'cl') {
        finalQuantityInBaseUnit = quantity * 10;
    }

    onSave({
      ...item,
      poids_g: finalQuantityInBaseUnit,
      carbs_g: carbs,
    });
  };
  
  const handleDelete = () => {
    onDelete(item.listId);
  }

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      event.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-4">{item.food.name}</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="food-quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {currentUnit === 'g' ? 'Poids' : 'Volume'}
            </label>
            <div className="mt-1 flex items-center">
              <input type="number" inputMode="decimal" id="food-quantity" value={quantityStr} onChange={handleQuantityChange} onFocus={handleFocus} className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 text-lg"/>
              <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 ml-2 flex-shrink-0">
                {isLiquid ? (
                    <>
                    <button onClick={() => handleUnitChange('g')} className={`px-3 py-3 text-sm rounded-l-lg ${currentUnit === 'g' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>g</button>
                    <button onClick={() => handleUnitChange('ml')} className={`px-3 py-3 text-sm ${currentUnit === 'ml' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>ml</button>
                    <button onClick={() => handleUnitChange('cl')} className={`px-3 py-3 text-sm rounded-r-lg ${currentUnit === 'cl' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>cl</button>
                    </>
                ) : (
                    <span className="px-3 py-3 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg">g</span>
                )}
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="food-carbs" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Glucides (grammes)</label>
            <input type="number" inputMode="decimal" id="food-carbs" value={carbsStr} onChange={handleCarbsChange} onFocus={handleFocus} className="mt-1 w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 text-lg"/>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {isNew ? (
            <>
              <button onClick={onClose} className="w-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 rounded-lg hover:bg-gray-300">Annuler</button>
              <button onClick={handleSave} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">Ajouter</button>
            </>
          ) : (
            <>
              <button onClick={handleDelete} className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700">Supprimer</button>
              <button onClick={handleSave} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">Sauvegarder</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const DoseCalculator: React.FC<DoseCalculatorProps> = ({ setCurrentPage }) => {
  const { patient, foodLibrary, favoriteMeals, addFullBolus, getLastCorrection, addFavoriteMeal, deleteFavoriteMeal } = usePatientStore();
  const [step, setStep] = useState(1);
  const [moment, setMoment] = useState<MealTime>('dejeuner');
  const [glycemie, setGlycemie] = useState('');
  const [cetones, setCetones] = useState('');
  
  const toLocalISOString = (date: Date) => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
    return localISOTime;
  }
  const [eventDateTime, setEventDateTime] = useState(toLocalISOString(new Date()));

  const [repasItems, setRepasItems] = useState<MealItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [calculationResult, setCalculationResult] = useState<DoseCalculationOutput | null>(null);
  const [modalConfig, setModalConfig] = useState<{ item: MealItem; isNew: boolean } | null>(null);
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'favorites'>('search');
  
  const totalCarbs = useMemo(() => repasItems.reduce((sum, item) => sum + item.carbs_g, 0), [repasItems]);

  const filteredFoodLibrary = useMemo(() => {
    if (!searchTerm) return foodLibrary.slice(0, 10);
    return foodLibrary.filter(food => food.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, foodLibrary]);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    setTimeout(() => {
      event.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  const handleNextStep1 = () => {
    if (!glycemie) {
      toast.error('Veuillez entrer votre glycémie.');
      return;
    }
    const glyValue = parseFloat(glycemie.replace(',', '.'));
    if (isNaN(glyValue) || glyValue < 0.3 || glyValue > 5.0) {
      toast.error('Glycémie invalide (doit être entre 0.3 et 5.0 g/L).');
      return;
    }
    setStep(2);
  };
  
  const handleCalculate = async () => {
    if (!patient) return;
    const gly_pre = parseFloat(glycemie.replace(',', '.'));
    const lastCorrection = await getLastCorrection();
    
    const result = calculateDose({
      gly_pre,
      moment,
      carbs_g: totalCarbs,
      patient,
      lastCorrection
    });
    setCalculationResult(result);
    setStep(3);
  };

  const handleConfirm = async () => {
    if (!patient || !calculationResult) return;
    
    const mesure: Omit<Mesure, 'id' | 'patient_id' | 'ts'> = {
      gly: parseFloat(glycemie.replace(',', '.')),
      cetone: cetones ? parseFloat(cetones.replace(',', '.')) : undefined,
      source: 'doigt'
    };
    
    const repas: Omit<Repas, 'id' | 'patient_id' | 'ts'> = {
      moment,
      items: repasItems.map(item => ({
        nom: item.food.name,
        carbs_g: item.carbs_g,
        poids_g: item.poids_g,
      })),
      total_carbs_g: totalCarbs
    };
    
    const injection: Omit<Injection, 'id' | 'patient_id' | 'ts'> = {
      type: 'rapide',
      dose_U: calculationResult.doseTotale,
      calc_details: `Repas: ${calculationResult.doseRepas_U.toFixed(1)}U, Correction: ${calculationResult.addCorr_U}U. Glucides: ${totalCarbs.toFixed(0)}g. Glycémie: ${glycemie} g/L.`
    };
    
    try {
      await addFullBolus({ 
          mesure: mesure as Mesure,
          repas: repas as Repas,
          injection: injection as Injection
      }, new Date(eventDateTime).toISOString());
      toast.success(`Dose de ${calculationResult.doseTotale} U enregistrée !`);
      setCurrentPage('dashboard');
    } catch (error) {
        toast.error("Erreur lors de l'enregistrement.");
        console.error(error);
    }
  };
  
  const handleAddNewFood = (food: Food) => {
    const poids_g = food.common_portion_g || 100;
    const carbs_g = (poids_g / 100) * food.carbs_per_100g_net;
    setModalConfig({
        item: { listId: uuidv4(), food, poids_g, carbs_g },
        isNew: true
    });
  };

  const handleEditFood = (item: MealItem) => {
    setModalConfig({ item, isNew: false });
  };
  
  const handleSaveItem = (itemToSave: MealItem) => {
    const existingIndex = repasItems.findIndex(i => i.listId === itemToSave.listId);
    if (existingIndex > -1) {
      const newRepasItems = [...repasItems];
      newRepasItems[existingIndex] = itemToSave;
      setRepasItems(newRepasItems);
    } else {
      setRepasItems([...repasItems, itemToSave]);
    }
    setModalConfig(null);
  };
  
  const handleDeleteItem = (listId: string) => {
    setRepasItems(repasItems.filter(i => i.listId !== listId));
    setModalConfig(null);
  };
  
  const handleAddQuickItem = (item: MealItem) => {
    setRepasItems(prev => [...prev, item]);
    toast.success(`"${item.food.name}" ajouté au repas.`);
  };

  const handleSaveFavorite = () => {
    const name = prompt("Donnez un nom à ce repas favori :");
    if (name && name.trim() !== "") {
        addFavoriteMeal(name, repasItems);
        toast.success(`Repas "${name}" sauvegardé dans les favoris !`);
    }
  };

  const handleAddFavoriteToMeal = (favMeal: { items: FoodItem[] }) => {
    const itemsToAdd: MealItem[] = favMeal.items.map(favItem => {
        // Find the full food item from the library
        const foodFromLib = foodLibrary.find(f => f.name === favItem.nom);
        // Create a transient food item if not found
        const food: Food = foodFromLib || {
            id: uuidv4(), name: favItem.nom, category: 'Favori',
            carbs_per_100g_net: favItem.poids_g ? (favItem.carbs_g / favItem.poids_g) * 100 : 0,
            unit_type: 'g', source: 'Favori', quality: 'certaine'
        };
        return {
            listId: uuidv4(),
            food: food,
            poids_g: favItem.poids_g || 0,
            carbs_g: favItem.carbs_g,
        };
    });
    setRepasItems(prev => [...prev, ...itemsToAdd]);
    toast.success("Repas favori ajouté !");
  }

  const handleDeleteFavorite = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce repas favori ?")) {
        deleteFavoriteMeal(id);
        toast.success("Favori supprimé.");
    }
  }


  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-center">Étape 1: Mesure</h2>
      <div>
        <label htmlFor="event-time" className="block mb-2 font-semibold">Date et Heure</label>
        <input 
          id="event-time" 
          type="datetime-local" 
          value={eventDateTime} 
          onChange={(e) => setEventDateTime(e.target.value)}
          onFocus={handleFocus}
          className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
        />
      </div>
      <div>
        <label className="block mb-2 font-semibold">Moment du repas</label>
        <select value={moment} onChange={(e) => setMoment(e.target.value as MealTime)} onFocus={handleFocus} className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
          {Object.entries(MEAL_TIMES).map(([key, value]) => (
            <option key={key} value={key}>{value}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="glycemie" className="block mb-2 font-semibold">Glycémie pré-repas (g/L)</label>
        <input id="glycemie" type="number" step="0.01" inputMode="decimal" value={glycemie} onChange={(e) => setGlycemie(e.target.value)} onFocus={handleFocus} placeholder="1.20" className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 text-2xl text-center" />
      </div>
      <div>
        <label htmlFor="cetones" className="block mb-2 font-semibold">Cétones (mmol/L, optionnel)</label>
        <input id="cetones" type="number" step="0.1" inputMode="decimal" value={cetones} onChange={(e) => setCetones(e.target.value)} onFocus={handleFocus} placeholder="0.2" className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 text-2xl text-center" />
      </div>
      <button onClick={handleNextStep1} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">Suivant</button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center">Étape 2: Repas</h2>
      <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-lg text-center flex justify-between items-center">
          <p className="font-bold text-lg text-blue-800 dark:text-blue-200">Total: {totalCarbs.toFixed(0)} g</p>
          {repasItems.length > 0 && (
            <button onClick={handleSaveFavorite} className="flex items-center gap-1 text-sm bg-yellow-400 text-yellow-900 px-3 py-1 rounded-md hover:bg-yellow-500">
                <Star className="w-4 h-4" />
                Sauvegarder
            </button>
          )}
      </div>
      <div>
          <h3 className="font-semibold mb-2">Mon repas:</h3>
          <ul className="space-y-2">
              {repasItems.map((item) => (
                  <li key={item.listId} onClick={() => handleEditFood(item)} className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-3 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      <div>
                        <span className="font-semibold">{item.food.name}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 block">{item.poids_g.toFixed(0)} {item.food.unit_type}</span>
                      </div>
                      <span className="font-bold text-lg">{item.carbs_g.toFixed(0)} g</span>
                  </li>
              ))}
              {repasItems.length === 0 && <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">Commencez par ajouter un aliment.</p>}
          </ul>
      </div>
      <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Ajouter au repas:</h3>
            <button 
                type="button" 
                onClick={() => setIsQuickAddModalOpen(true)}
                className="text-sm bg-gray-200 dark:bg-gray-600 px-3 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700"
            >
                Ajout rapide
            </button>
          </div>
          <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                  <button onClick={() => setActiveTab('search')} className={`${activeTab === 'search' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}>Rechercher</button>
                  <button onClick={() => setActiveTab('favorites')} className={`${activeTab === 'favorites' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}>Favoris</button>
              </nav>
          </div>
          <div className="pt-4 min-h-[200px]">
              {activeTab === 'search' && (
                <div>
                  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onFocus={handleFocus} placeholder="Rechercher (ex: pomme)" className="w-full p-2 mb-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg" />
                  <ul className="space-y-1 max-h-48 overflow-y-auto">
                      {filteredFoodLibrary.map(food => (
                          <li key={food.id} onClick={() => handleAddNewFood(food)} className="p-2 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-md">
                              <span>{food.name}</span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">({(food.carbs_per_100g_net * (food.common_portion_g || 100) / 100).toFixed(0)}g)</span>
                          </li>
                      ))}
                  </ul>
                </div>
              )}
              {activeTab === 'favorites' && (
                  <ul className="space-y-2 max-h-52 overflow-y-auto">
                      {favoriteMeals.map(fav => (
                          <li key={fav.id} className="p-2 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                              <div onClick={() => handleAddFavoriteToMeal(fav)} className="cursor-pointer flex-grow">
                                  <span className="font-semibold">{fav.name}</span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({fav.total_carbs_g.toFixed(0)}g)</span>
                              </div>
                              <button onClick={() => handleDeleteFavorite(fav.id)} className="text-red-500 hover:text-red-700 p-1">
                                  <Trash2 className="w-4 h-4" />
                              </button>
                          </li>
                      ))}
                      {favoriteMeals.length === 0 && <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">Aucun repas favori sauvegardé.</p>}
                  </ul>
              )}
          </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button onClick={() => setStep(1)} className="w-full bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors">Précédent</button>
        <button onClick={handleCalculate} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50" disabled={totalCarbs === 0 && glycemie === ''}>Calculer</button>
      </div>
    </div>
  );

  const ResultAnimation = () => {
    if (!calculationResult || !patient) return null;
    
    const [phase, setPhase] = useState('start');

    useEffect(() => {
        setPhase('start');
        const timers = [
            setTimeout(() => setPhase('cardsVisible'), 100),
            setTimeout(() => setPhase('cardsMoving'), 2500),
            setTimeout(() => setPhase('resultVisible'), 3000),
            setTimeout(() => setPhase('controlsVisible'), 3800),
        ];
        return () => timers.forEach(clearTimeout);
    }, [calculationResult]);

    const phaseClasses = {
        cardContainer: {
            start: 'opacity-0 scale-90',
            cardsVisible: 'opacity-100 scale-100',
            cardsMoving: 'opacity-0 scale-90 translate-y-24',
            resultVisible: 'opacity-0 scale-90 translate-y-24',
            controlsVisible: 'opacity-0 scale-90 translate-y-24',
        },
        resultWindow: {
            start: 'opacity-0 scale-90',
            cardsVisible: 'opacity-0 scale-90',
            cardsMoving: 'opacity-0 scale-90',
            resultVisible: 'opacity-100 scale-100',
            controlsVisible: 'opacity-100 scale-100',
        },
        controls: {
            start: 'opacity-0',
            cardsVisible: 'opacity-0',
            cardsMoving: 'opacity-0',
            resultVisible: 'opacity-0',
            controlsVisible: 'opacity-100',
        }
    };

    return (
        <div className="space-y-4">
            <div className="relative flex flex-col items-center justify-start min-h-[200px]">
                <div className={`absolute top-0 w-full flex items-center justify-center transition-all duration-700 ease-in-out ${phaseClasses.cardContainer[phase as keyof typeof phaseClasses.cardContainer]}`}>
                    <div className="flex items-center justify-around w-full max-w-xs">
                        <div className="flex flex-col items-center text-center w-32 bg-white dark:bg-gray-700 p-3 rounded-lg shadow-lg">
                            <Wheat className="w-8 h-8 text-yellow-500 mb-1" />
                            <p className="font-bold text-xl">{calculationResult.doseRepas_U.toFixed(1)} <span className="text-base">U</span></p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Repas</p>
                        </div>
                        <Plus className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                        <div className="flex flex-col items-center text-center w-32 bg-white dark:bg-gray-700 p-3 rounded-lg shadow-lg">
                            <Droplets className="w-8 h-8 text-blue-500 mb-1" />
                            <p className="font-bold text-xl">{calculationResult.addCorr_U} <span className="text-base">U</span></p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Correction</p>
                        </div>
                    </div>
                </div>
                <div className={`absolute top-0 w-full flex flex-col items-center justify-center transition-all duration-500 ease-in-out delay-200 ${phaseClasses.resultWindow[phase as keyof typeof phaseClasses.resultWindow]}`}>
                    <div className="bg-blue-50 dark:bg-gray-900 border-2 border-blue-500 rounded-xl shadow-2xl p-6 text-center">
                        <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Dose totale</p>
                        <p className="text-7xl font-bold text-blue-600 dark:text-blue-400">{calculationResult.doseTotale.toFixed(0)}</p>
                        <p className="text-4xl font-light text-gray-500 dark:text-gray-400">U</p>
                    </div>
                </div>
            </div>

            <div className={`transition-opacity duration-500 delay-300 ${phaseClasses.controls[phase as keyof typeof phaseClasses.controls]}`}>
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-left text-sm">
                    <h4 className="font-semibold mb-1">Détail du calcul :</h4>
                    <p>Repas ({MEAL_TIMES[moment]}): {totalCarbs.toFixed(0)}g / {patient?.ratios[moment]}g = {calculationResult.doseRepas_U.toFixed(1)} U</p>
                    <p>Correction (Glycémie {glycemie}g/L): +{calculationResult.addCorr_U} U</p>
                    <p className="font-bold mt-1">Total: {calculationResult.doseRepas_U.toFixed(1)} + {calculationResult.addCorr_U} = {(calculationResult.doseRepas_U + calculationResult.addCorr_U).toFixed(1)} U &rarr; {calculationResult.doseTotale} U (arrondi)</p>
                </div>
                {calculationResult.warning && <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 rounded-lg">{calculationResult.warning}</div>}
                <div className="mt-6 space-y-3">
                    <button onClick={handleConfirm} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors">
                        Enregistrer au journal
                    </button>
                    <button onClick={() => setCurrentPage('dashboard')} className="w-full bg-gray-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors">
                        Fermer sans enregistrer
                    </button>
                     <button onClick={() => setStep(2)} className="w-full text-blue-600 dark:text-blue-400 font-semibold py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        Modifier le calcul
                    </button>
                </div>
            </div>
        </div>
    );
  }

  const renderStep3 = () => {
    return (
        <div className="space-y-6 text-center">
            <h2 className="text-xl font-bold">Étape 3: Résultat</h2>
            <ResultAnimation />
        </div>
    );
  };
  
  return (
    <div className="p-4 max-w-lg mx-auto">
      {modalConfig && <FoodItemModal modalConfig={modalConfig} onClose={() => setModalConfig(null)} onSave={handleSaveItem} onDelete={handleDeleteItem} />}
      {isQuickAddModalOpen && <QuickAddItemModal onClose={() => setIsQuickAddModalOpen(false)} onAddItem={handleAddQuickItem} />}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default DoseCalculator;