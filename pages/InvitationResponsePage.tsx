import React, { useState, useEffect } from 'react';
import { usePatientStore } from '../store/patientStore.ts';
import { useAuthStore } from '../store/authStore.ts';
import useTranslations from '../hooks/useTranslations.ts';
import { CircleMember } from '../types.ts';
import Card from '../components/Card.tsx';
import LoadingScreen from '../components/LoadingScreen.tsx';

const InvitationResponsePage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { userProfile } = useAuthStore();
    const { getPendingInvitations, respondToInvitation } = usePatientStore();
    const [invitations, setInvitations] = useState<CircleMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const t = useTranslations();

    useEffect(() => {
        const fetchInvites = async () => {
            if (userProfile?.uid) {
                setIsLoading(true);
                const pendingInvites = await getPendingInvitations(userProfile.uid);
                setInvitations(pendingInvites);
                setIsLoading(false);
            } else {
                setIsLoading(false);
            }
        };
        fetchInvites();
    }, [userProfile, getPendingInvitations]);

    const handleResponse = async (invitation: CircleMember, response: 'accepted' | 'refused') => {
        if (!userProfile) return;
        await respondToInvitation(invitation, response);
        setInvitations(invites => invites.filter(i => i.id !== invitation.id));
    };

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (invitations.length > 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-main-gradient">
                {invitations.map(invite => (
                    <Card key={invite.id} className="w-full max-w-sm animate-card-open mb-4">
                        <h2 className="text-xl font-display font-bold text-center text-text-title">Invitation</h2>
                        <p className="text-center text-text-muted mt-2"
                           dangerouslySetInnerHTML={{ __html: t.invitation_subtitle(invite.patientName, t.roles[invite.role as keyof typeof t.roles] as string).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                        />
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button onClick={() => handleResponse(invite, 'refused')} className="w-full bg-white text-danger font-bold py-3 rounded-button border border-slate-300 hover:bg-slate-50">{t.common_cancel}</button>
                            <button onClick={() => handleResponse(invite, 'accepted')} className="w-full bg-jade text-white font-bold py-3 rounded-button hover:opacity-90">{t.common_confirm}</button>
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    return <>{children}</>;
};

export default InvitationResponsePage;
