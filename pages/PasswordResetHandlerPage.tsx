import React, { useState, useEffect } from 'react';
import { auth } from '../services/firebase.ts';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import useTranslations from '../hooks/useTranslations.ts';
import toast from 'react-hot-toast';
import DropletLogoIcon from '../components/icons/DropletLogoIcon.tsx';
import LoadingScreen from '../components/LoadingScreen.tsx';
import CheckmarkPopAnimation from '../components/animations/CheckmarkPopAnimation.tsx';
import EyeIcon from '../components/icons/EyeIcon.tsx';
import EyeOffIcon from '../components/icons/EyeOffIcon.tsx';
import ErrorIcon from '../components/icons/ErrorIcon.tsx';
import { useAuthStore } from '../store/authStore.ts';

const PasswordResetHandlerPage: React.FC<{ oobCode: string }> = ({ oobCode }) => {
    const { login } = useAuthStore();
    const [status, setStatus] = useState<'verify' | 'form' | 'success' | 'error'>('verify');
    const [email, setEmail] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const t = useTranslations();

    useEffect(() => {
        const verifyCode = async () => {
            try {
                const userEmail = await verifyPasswordResetCode(auth, oobCode);
                setEmail(userEmail);
                setStatus('form');
            } catch (err) {
                setError(t.auth_resetError);
                setStatus('error');
            }
        };
        verifyCode();
    }, [oobCode, t]);

    useEffect(() => {
        if (status === 'success' && email) {
            const timer = setTimeout(async () => {
                await login(email, newPassword);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [status, email, newPassword, login]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error(t.toast_passwordsDoNotMatch);
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Le mot de passe doit comporter au moins 6 caractères.");
            return;
        }
        setIsSubmitting(true);
        try {
            await confirmPasswordReset(auth, oobCode, newPassword);
            setStatus('success');
        } catch (err) {
            setError(t.auth_resetGenericError);
            setStatus('error');
        }
        setIsSubmitting(false);
    };

    const inputClasses = "w-full p-3 bg-input-bg rounded-input border border-black/10 text-text-title placeholder-placeholder-text focus:outline-none focus:border-emerald-main focus:ring-2 focus:ring-emerald-main/30 transition-all duration-150";

    const renderContent = () => {
        switch (status) {
            case 'verify':
                return <LoadingScreen message="Vérification..." />;
            case 'form':
                return (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h2 className="text-xl font-display font-bold text-center text-text-title mb-4">Choisissez un nouveau mot de passe</h2>
                        <div className="relative">
                            <input type={showPassword ? "text" : "password"} placeholder={t.auth_passwordPlaceholder} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={`${inputClasses} pr-10`} required />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-icon-inactive hover:text-text-title">
                                {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>
                        <div className="relative">
                            <input type={showConfirmPassword ? "text" : "password"} placeholder={t.auth_confirmPasswordPlaceholder} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`${inputClasses} pr-10`} required />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-icon-inactive hover:text-text-title">
                                {showConfirmPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full btn-interactive group flex items-center justify-center text-lg font-bold py-3 px-6 rounded-button bg-emerald-main text-white transition-all duration-300 ease-fast disabled:opacity-60">
                            {isSubmitting ? t.common_loading : t.auth_saveNewPassword}
                        </button>
                    </form>
                );
            case 'success':
                return (
                    <div className="text-center">
                        <CheckmarkPopAnimation className="w-24 h-24 mx-auto"/>
                        <h2 className="text-2xl font-display font-bold text-text-title mt-4">Mot de passe modifié !</h2>
                        <p className="text-sm text-text-muted mt-2">Connexion en cours...</p>
                    </div>
                );
            case 'error':
                 return (
                    <div className="text-center">
                        <ErrorIcon className="w-20 h-20 mx-auto" />
                        <h2 className="text-2xl font-display font-bold text-danger-dark mt-4">Erreur</h2>
                        <p className="text-sm text-text-muted mt-2">{error}</p>
                        <button onClick={() => window.location.href = '/'} className="mt-6 w-full bg-emerald-main text-white font-bold py-3 rounded-button hover:bg-jade-deep-dark transition-colors shadow-sm">{t.auth_backToLogin}</button>
                    </div>
                );
        }
    }

    if (status === 'verify') {
        return <LoadingScreen message="Vérification..." />;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-main-gradient font-sans">
            <div className="w-full max-w-sm mx-auto">
                <div className="text-center mb-6">
                    <DropletLogoIcon className="w-24 h-24 mx-auto" />
                </div>
                <div className="bg-white/[.85] rounded-card p-6 shadow-glass border border-black/5">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default PasswordResetHandlerPage;
