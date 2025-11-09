import React, { useState, useEffect } from 'react';
import { usePatientStore } from '../store/patientStore.ts';
import useTranslations from '../hooks/useTranslations.ts';
import AuthPage from './AuthPage.tsx';
import LoadingScreen from '../components/LoadingScreen.tsx';
import UsersIcon from '../components/icons/UsersIcon.tsx';
import DropletLogoIcon from '../components/icons/DropletLogoIcon.tsx';

interface InvitationAcceptancePageProps {
  inviteId: string;
}

const InvitationAcceptancePage: React.FC<InvitationAcceptancePageProps> = ({ inviteId }) => {
  const { getInvitationDetails } = usePatientStore();
  const t = useTranslations();

  const [invitation, setInvitation] = useState<{ patientName: string; role: string; email: string; } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const details = await getInvitationDetails(inviteId);
        if (details) {
          setInvitation(details);
        } else {
          setError(t.invitation_invalid);
        }
      } catch (err) {
        setError(t.invitation_invalid);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvitation();
  }, [inviteId, getInvitationDetails, t]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show AuthPage but with a custom header
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-main-gradient font-sans">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-6">
          <DropletLogoIcon className="w-24 h-24 mx-auto" />
          
          {error ? (
              <h1 className="text-2xl font-display font-bold text-white mt-4">{error}</h1>
          ) : invitation ? (
            <>
                <h1 className="text-2xl font-display font-bold text-white mt-4">{t.invitation_title(invitation.patientName)}</h1>
                <p 
                    className="text-white/80 mt-2"
                    dangerouslySetInnerHTML={{ __html: t.invitation_subtitle(invitation.patientName, t.roles[invitation.role as keyof typeof t.roles] as string).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                />
                <p className="font-semibold text-white mt-4">{t.invitation_createAccount_prompt}</p>
            </>
          ) : null}

        </div>
        
        {!error && (
            <div className="animate-card-open">
                 <AuthPage />
            </div>
        )}

      </div>
    </div>
  );
};

export default InvitationAcceptancePage;
