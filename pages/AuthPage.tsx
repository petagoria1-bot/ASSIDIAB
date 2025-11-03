import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const { login, signup, isLoading } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;

        if (isLogin) {
            await login(username, password);
        } else {
            if (password !== confirmPassword) {
                toast.error("Les mots de passe ne correspondent pas.");
                return;
            }
            if(password.length < 4){
                toast.error("Le mot de passe doit contenir au moins 4 caractères.");
                return;
            }
            await signup(username, password);
        }
    };
    
    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
        setTimeout(() => {
            event.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-sm w-full">
                <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-2">
                    {isLogin ? "Connexion" : "Créer un compte"}
                </h1>
                <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
                    {isLogin ? "Accédez à votre assistant personnel." : "Rejoignez la communauté."}
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pseudo</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onFocus={handleFocus}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                            placeholder="ex: FamilleDupond"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mot de passe</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={handleFocus}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                            required
                        />
                    </div>
                    {!isLogin && (
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirmer le mot de passe</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                onFocus={handleFocus}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                required
                            />
                        </div>
                    )}
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50">
                        {isLoading ? "Chargement..." : (isLogin ? "Se connecter" : "Créer le compte")}
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-teal-600 hover:underline dark:text-teal-400">
                        {isLogin ? "Pas de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;