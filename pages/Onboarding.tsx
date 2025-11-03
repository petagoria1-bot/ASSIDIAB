import React, { useState } from 'react';
import { usePatientStore } from '../store/patientStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const Onboarding: React.FC = () => {
  const { createPatient } = usePatientStore();
  const { currentUser } = useAuthStore();
  const [prenom, setPrenom] = useState('');
  const [naissance, setNaissance] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prenom && naissance && currentUser && typeof currentUser.id === 'number') {
      await createPatient(prenom, naissance, currentUser.id);
      toast.success(`Profil pour ${prenom} créé !`);
    } else {
      toast.error('Veuillez remplir tous les champs ou une erreur de session est survenue.');
    }
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      event.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-sm w-full">
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-2">Bienvenue, {currentUser?.username} !</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">Créons le profil de votre enfant.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prénom de l'enfant</label>
            <input
              type="text"
              id="prenom"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              onFocus={handleFocus}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              placeholder="ex: Léo"
              required
            />
          </div>
          <div>
            <label htmlFor="naissance" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date de naissance</label>
            <input
              type="date"
              id="naissance"
              value={naissance}
              onChange={(e) => setNaissance(e.target.value)}
              onFocus={handleFocus}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
            Commencer
          </button>
        </form>
         <p className="text-xs text-center text-gray-400 mt-4">Les réglages par défaut seront appliqués. Vous pourrez les modifier à tout moment.</p>
      </div>
    </div>
  );
};

export default Onboarding;