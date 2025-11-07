import React, { useState } from 'react';
import { usePatientStore } from '../store/patientStore.ts';
// FIX: Changed import to be a relative path and added file extension for proper module resolution.
import useTranslations from '../hooks/useTranslations.ts';
import Card from '../components/Card.tsx';
import PhoneIcon from '../components/icons/PhoneIcon.tsx';

type Protocol = 'hypo' | 'hyper' | 'acetone';

const Emergency: React.FC = () => {
  const { patient } = usePatientStore();
  const t = useTranslations();
  const [activeProtocol, setActiveProtocol] = useState<Protocol>('hypo');

  if (!patient) return null;

  const protocols = {
    hypo: t.emergencyProtocols.hypo,
    hyper: t.emergencyProtocols.hyper,
    acetone: t.emergencyProtocols.acetone
  };

  const currentProtocol = protocols[activeProtocol];
  
  const getStepText = (stepKey: string) => {
    const step = (currentProtocol as any)[stepKey];
    if (typeof step === 'function') {
      switch (stepKey) {
        case 'step1':
          if (activeProtocol === 'hypo') return step(patient.cibles.gly_min);
          if (activeProtocol === 'hyper') return step(patient.cibles.gly_max);
          break;
        case 'step3':
          if (activeProtocol === 'hyper') return step(patient.correctionDelayHours);
          break;
        default:
          break;
      }
    }
    return step as string;
  };

  const stepKeys = Object.keys(currentProtocol).filter(key => key.startsWith('step'));

  return (
    <div className="p-4 space-y-4 pb-24">
      <header className="py-4 text-center">
        <h1 className="text-3xl font-display font-bold text-white text-shadow">{t.emergency_title}</h1>
      </header>

      <Card>
        <h2 className="text-xl font-display font-semibold text-text-title mb-4 text-center">{t.emergency_contactsTitle}</h2>
        <div className="space-y-5">
            <div>
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">{t.emergency_generalServices}</h3>
                <div className="grid grid-cols-2 gap-3">
                    <a href="tel:15" className="btn-interactive flex flex-col items-center justify-center p-4 bg-danger text-white rounded-button font-bold shadow-lg hover:bg-danger-dark transition-all transform hover:-translate-y-1">
                        <PhoneIcon className="w-7 h-7 mb-1"/>
                        <span>{t.emergency_samu}</span>
                        <span className="text-lg font-display">(15)</span>
                    </a>
                    <a href="tel:112" className="btn-interactive flex flex-col items-center justify-center p-4 bg-info text-white rounded-button font-bold shadow-lg hover:bg-info-dark transition-all transform hover:-translate-y-1">
                        <PhoneIcon className="w-7 h-7 mb-1"/>
                        <span>{t.emergency_european}</span>
                        <span className="text-lg font-display">(112)</span>
                    </a>
                </div>
            </div>

            <div>
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">{t.emergency_personalContacts}</h3>
                {patient.contacts.length > 0 ? (
                <div className="space-y-2">
                    {patient.contacts.map(contact => (
                    <div key={contact.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200/80 shadow-sm">
                        <div>
                            <p className="font-semibold text-text-title">{contact.lien}</p>
                            <p className="text-sm text-text-muted">{contact.nom}</p>
                        </div>
                        <a href={`tel:${contact.tel}`} className="btn-interactive font-bold bg-emerald-main text-white flex items-center gap-2 py-2 px-4 rounded-button hover:bg-jade-deep-dark transition-colors shadow">
                            <PhoneIcon className="w-5 h-5" />
                            <span>{contact.tel}</span>
                        </a>
                    </div>
                    ))}
                </div>
                ) : (
                <p className="text-text-muted text-center text-sm p-4 bg-slate-50 rounded-lg">{t.emergency_noContacts}</p>
                )}
            </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setActiveProtocol('hypo')}
          className={`p-3 rounded-lg text-center transition-all ${activeProtocol === 'hypo' ? 'bg-amber-400 text-white shadow-lg' : 'bg-white/80'}`}
        >
          <p className="font-bold">{t.emergency_hypoButton}</p>
          <p className="text-xs">{t.emergency_hypoSubtitle}</p>
        </button>
        <button
          onClick={() => setActiveProtocol('hyper')}
          className={`p-3 rounded-lg text-center transition-all ${activeProtocol === 'hyper' ? 'bg-rose-500 text-white shadow-lg' : 'bg-white/80'}`}
        >
          <p className="font-bold">{t.emergency_hyperButton}</p>
          <p className="text-xs">{t.emergency_hyperSubtitle}</p>
        </button>
        <button
          onClick={() => setActiveProtocol('acetone')}
          className={`p-3 rounded-lg text-center transition-all ${activeProtocol === 'acetone' ? 'bg-purple-500 text-white shadow-lg' : 'bg-white/80'}`}
        >
          <p className="font-bold">{t.emergency_ketoneButton}</p>
          <p className="text-xs">{t.emergency_ketoneSubtitle}</p>
        </button>
      </div>

      <Card className="animate-fade-in">
        <h2 className="text-xl font-bold text-center text-text-title mb-4">{currentProtocol.title}</h2>
        <div className="space-y-4">
          {stepKeys.map((key, index) => (
            <div key={key} className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-main text-white flex items-center justify-center font-bold me-3">{index + 1}</div>
              <p className="text-text-main">{getStepText(key)}</p>
            </div>
          ))}
        </div>
      </Card>

       <Card>
        <h2 className="text-lg font-semibold text-text-title mb-3">{t.emergency_patientTitle}</h2>
        <p><span className="font-semibold">{t.common_name}:</span> {patient.prenom}</p>
        <p><span className="font-semibold">{t.common_birthDate}:</span> {new Date(patient.naissance).toLocaleDateString(t.locale)}</p>
      </Card>
      
    </div>
  );
};

export default Emergency;