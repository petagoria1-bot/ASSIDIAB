import React, { useEffect } from 'react';
import { usePatientStore } from '../store/patientStore';
import useTranslations from '../hooks/useTranslations';
import { Page } from '../types';
import Card from '../components/Card';
import InboxIcon from '../components/icons/InboxIcon';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';

interface InboxProps {
  setCurrentPage: (page: Page) => void;
}

const Inbox: React.FC<InboxProps> = ({ setCurrentPage }) => {
  const { messages, markMessagesAsRead } = usePatientStore();
  const t = useTranslations();

  useEffect(() => {
    // Mark messages as read when component mounts
    markMessagesAsRead();
  }, [markMessagesAsRead]);

  return (
    <div className="p-4 space-y-4 pb-24">
      <header className="py-4 text-center relative flex items-center justify-center">
        <button 
          onClick={() => setCurrentPage('dashboard')} 
          className="absolute left-0 text-white p-2 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Retour au tableau de bord"
        >
          <ArrowLeftIcon />
        </button>
        <h1 className="text-3xl font-display font-bold text-white text-shadow">{t.inbox_title}</h1>
      </header>

      {messages.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <InboxIcon className="w-20 h-20 text-slate-300 mx-auto" />
            <p className="mt-4 text-text-muted font-semibold">{t.inbox_empty}</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <div key={message.id} className={`p-4 rounded-card border-l-4 transition-opacity duration-500 ${!message.read ? 'bg-white shadow-lg border-emerald-main' : 'bg-white/70 border-slate-300 opacity-80'}`}>
              <div className="flex justify-between items-start text-xs text-text-muted mb-2">
                <p className="font-bold">{message.fromEmail}</p>
                <p>{new Date(message.ts).toLocaleString(t.locale, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <p className="text-text-main">{message.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inbox;
