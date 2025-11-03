import React, { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { MealItem, Food } from '../types';

interface QuickAddItemModalProps {
  onClose: () => void;
  onAddItem: (item: MealItem) => void;
}

const UnitButton = ({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-3 py-2 text-sm font-semibold transition-colors rounded-md ${
            isActive
                ? 'bg-teal-600 text-white shadow'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
        }`}
    >
        {label}
    </button>
);

const QuickAddItemModal: React.FC<QuickAddItemModalProps> = ({ onClose, onAddItem }) => {
    const [name, setName] = useState('');
    const [refCarbs, setRefCarbs] = useState('');
    const [refWeight, setRefWeight] = useState('100');
    const [refUnit, setRefUnit] = useState<'g' | 'ml'>('g');
    const [portionWeight, setPortionWeight] = useState('');
    const [portionUnit, setPortionUnit] = useState<'g' | 'ml' | 'cl' | 'l'>('g');

    useEffect(() => {
        if (refUnit === 'g') {
            setPortionUnit('g');
        } else if (portionUnit === 'g') {
            setPortionUnit('ml');
        }
    }, [refUnit, portionUnit]);

    const calculatedCarbs = useMemo(() => {
        const carbsNum = parseFloat(refCarbs.replace(',', '.'));
        const refWeightNum = parseFloat(refWeight.replace(',', '.'));
        const portionWeightNum = parseFloat(portionWeight.replace(',', '.'));

        if ([carbsNum, refWeightNum, portionWeightNum].some(isNaN) || refWeightNum === 0) {
            return null;
        }
        
        let portionInBaseUnit = portionWeightNum;
        if (refUnit === 'ml') {
            if (portionUnit === 'cl') portionInBaseUnit *= 10;
            if (portionUnit === 'l') portionInBaseUnit *= 1000;
        }
        
        return (carbsNum / refWeightNum) * portionInBaseUnit;
    }, [refCarbs, refWeight, portionWeight, refUnit, portionUnit]);

    const handleAddItem = () => {
        if (!name.trim()) {
            toast.error("Veuillez entrer un nom pour l'aliment.");
            return;
        }
        if (calculatedCarbs === null || calculatedCarbs < 0) {
            toast.error('Veuillez entrer des valeurs numériques valides et positives.');
            return;
        }

        const refCarbsNum = parseFloat(refCarbs.replace(',', '.'));
        const refWeightNum = parseFloat(refWeight.replace(',', '.'));
        
        let portionInBaseUnit = parseFloat(portionWeight.replace(',', '.'));
        if (refUnit === 'ml') {
            if (portionUnit === 'cl') portionInBaseUnit *= 10;
            if (portionUnit === 'l') portionInBaseUnit *= 1000;
        }
        
        const carbsPer100g = (refCarbsNum / refWeightNum) * 100;

        const transientFood: Food = {
            id: uuidv4(),
            name: name.trim(),
            category: 'Ajout rapide',
            carbs_per_100g_net: carbsPer100g,
            unit_type: refUnit,
            source: 'Ajout rapide',
            quality: 'certaine',
        };

        const newItem: MealItem = {
            listId: uuidv4(),
            food: transientFood,
            poids_g: portionInBaseUnit,
            carbs_g: calculatedCarbs,
        };

        onAddItem(newItem);
        onClose();
    };

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
        setTimeout(() => {
            event.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-5 text-center">Ajout rapide d'un aliment</h3>
                <div className="space-y-5">
                    <div>
                        <label htmlFor="quick-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom de l'aliment</label>
                        <input type="text" id="quick-name" value={name} onChange={(e) => setName(e.target.value)} onFocus={handleFocus} className="mt-1 w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600" placeholder="ex: Gâteau marbré"/>
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Infos nutritionnelles (étiquette)</p>
                        <div className="flex items-center space-x-2">
                            <input type="number" inputMode="decimal" value={refCarbs} onChange={(e) => setRefCarbs(e.target.value)} onFocus={handleFocus} className="w-full p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 text-center" placeholder="25"/>
                            <span className="text-gray-600 dark:text-gray-400 text-sm">g pour</span>
                            <input type="number" inputMode="decimal" value={refWeight} onChange={(e) => setRefWeight(e.target.value)} onFocus={handleFocus} className="w-24 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 text-center" placeholder="100"/>
                             <div className="flex flex-col space-y-1">
                                <UnitButton label="g" isActive={refUnit === 'g'} onClick={() => setRefUnit('g')} />
                                <UnitButton label="ml" isActive={refUnit === 'ml'} onClick={() => setRefUnit('ml')} />
                            </div>
                        </div>
                    </div>
                    
                     <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ma portion</p>
                        <div className="flex items-center space-x-2">
                            <input type="number" inputMode="decimal" value={portionWeight} onChange={(e) => setPortionWeight(e.target.value)} onFocus={handleFocus} className="w-full p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 text-center" placeholder="40"/>
                            <div className="flex space-x-1">
                                {refUnit === 'g' ? (
                                    <UnitButton label="g" isActive={true} onClick={() => {}} />
                                ) : (
                                    <>
                                        <UnitButton label="ml" isActive={portionUnit === 'ml'} onClick={() => setPortionUnit('ml')} />
                                        <UnitButton label="cl" isActive={portionUnit === 'cl'} onClick={() => setPortionUnit('cl')} />
                                        <UnitButton label="L" isActive={portionUnit === 'l'} onClick={() => setPortionUnit('l')} />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {calculatedCarbs !== null && (
                        <div className="p-3 bg-teal-100 dark:bg-teal-900/50 rounded-lg text-center transition-all">
                            <p className="text-sm text-teal-800 dark:text-teal-300">Total Glucides</p>
                            <p className="font-bold text-2xl text-teal-800 dark:text-teal-200">{calculatedCarbs.toFixed(1)} g</p>
                        </div>
                    )}
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                    <button onClick={onClose} className="w-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-all">Annuler</button>
                    <button onClick={handleAddItem} disabled={!calculatedCarbs || calculatedCarbs < 0} className="w-full bg-teal-600 text-white font-bold py-3 rounded-lg hover:bg-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">Ajouter</button>
                </div>
            </div>
        </div>
    );
};

export default QuickAddItemModal;