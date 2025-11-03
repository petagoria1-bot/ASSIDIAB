import React, { useState } from 'react';

const Emergency: React.FC = () => {
    const [view, setView] = useState<'menu' | 'hypo' | 'ketones'>('menu');

    const renderMenu = () => (
        <>
            <h1 className="text-3xl font-bold text-center text-red-600 dark:text-red-400">Mode Urgence</h1>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-8">Que se passe-t-il ?</p>
            <div className="space-y-4">
                <button onClick={() => setView('hypo')} className="w-full bg-yellow-500 text-white font-bold py-4 px-6 rounded-lg text-lg shadow-md hover:bg-yellow-600 transition-colors">
                    Hypoglycémie
                </button>
                <button onClick={() => setView('ketones')} className="w-full bg-purple-500 text-white font-bold py-4 px-6 rounded-lg text-lg shadow-md hover:bg-purple-600 transition-colors">
                    Cétones Élevées
                </button>
            </div>
        </>
    );

    const renderProtocol = (
        title: string, 
        bgColor: string,
        steps: { title: string, text: string }[]
    ) => (
        <div>
            <button onClick={() => setView('menu')} className="text-teal-600 dark:text-teal-400 mb-4">&larr; Retour</button>
            <h2 className={`text-2xl font-bold text-center text-white p-4 rounded-t-lg ${bgColor}`}>{title}</h2>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-b-lg shadow-md space-y-4">
                {steps.map((step, index) => (
                    <div key={index}>
                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{`${index + 1}. ${step.title}`}</h3>
                        <p className="text-gray-600 dark:text-gray-300">{step.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
    
    return (
        <div className="p-4 max-w-lg mx-auto">
            {view === 'menu' && renderMenu()}
            {view === 'hypo' && renderProtocol('Protocole Hypoglycémie', 'bg-yellow-500', [
                { title: 'Donner 15g de sucre rapide', text: 'Ex: 3 morceaux de sucre, 1 briquette de jus de fruits, 1 cuillère à soupe de miel.' },
                { title: 'Attendre 15 minutes', text: 'Ne rien donner d\'autre pendant ce temps.' },
                { title: 'Contrôler la glycémie', text: 'Si elle est toujours basse (< 0.70 g/L), redonner 15g de sucre.' },
                { title: 'Quand c\'est remonté', text: 'Donner une collation avec des sucres lents (ex: pain, biscuit) si le repas est dans plus d\'une heure.' },
            ])}
            {view === 'ketones' && renderProtocol('Protocole Cétones Élevées (≥ 0.6 mmol/L)', 'bg-purple-500', [
                { title: 'Hydrater', text: 'Faire boire de l\'eau abondamment, par petites gorgées.' },
                { title: 'Correction Insuline', text: 'Faire une correction d\'insuline rapide selon le protocole défini avec le médecin.' },
                { title: 'Surveiller', text: 'Contrôler la glycémie et les cétones toutes les 2 heures.' },
                { title: 'Quand appeler ?', text: 'Appeler le médecin si les cétones ne baissent pas, si vomissements, ou si l\'état général se dégrade.' },
            ])}
        </div>
    );
}

export default Emergency;