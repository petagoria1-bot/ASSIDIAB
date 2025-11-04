import React, { useState } from 'react';
import { usePatientStore } from '../store/patientStore';
import Card from '../components/Card';

type EmergencyType = 'hypo' | 'hyper' | 'acetone';

const ProtocolCard: React.FC<{ title: string; colorClass: string; onClose: () => void; children: React.ReactNode }> = ({ title, colorClass, onClose, children }) => (
    <div className="bg-white rounded-card shadow-xl border border-black/10 p-5 animate-fade-in-lift">
        <div className="flex justify-between items-center mb-4">
            <h3 className={`text-2xl font-display font-bold ${colorClass}`}>{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
        <div className="prose prose-sm max-w-none text-text-main">
            {children}
        </div>
    </div>
);


const Emergency: React.FC = () => {
  const { patient } = usePatientStore();
  const [activeProtocol, setActiveProtocol] = useState<EmergencyType | null>(null);

  if (!patient) return null;

  const renderProtocol = () => {
    switch(activeProtocol) {
        case 'hypo':
            return (
                <ProtocolCard title="Protocole Hypoglycémie" colorClass="text-amber-500" onClose={() => setActiveProtocol(null)}>
                    <ol>
                        <li>Si glycémie &lt; <strong>{patient.cibles.gly_min.toFixed(2)} g/L</strong> : donner <strong>15g de sucre rapide</strong> (3 morceaux de sucre, 1 briquette de jus, 1 c.à.s de miel).</li>
                        <li>Contrôler la glycémie <strong>15 minutes</strong> plus tard.</li>
                        <li>Si la glycémie est toujours basse, redonner 15g de sucre rapide.</li>
                        <li>Une fois la glycémie corrigée, donner des glucides lents (pain, biscuit) pour stabiliser.</li>
                        <li><strong>Si la personne est inconsciente ou ne peut pas avaler, ne rien donner par la bouche et appeler immédiatement les secours (15 ou 112).</strong></li>
                    </ol>
                </ProtocolCard>
            );
        case 'hyper':
            return (
                 <ProtocolCard title="Protocole Hyperglycémie" colorClass="text-rose-600" onClose={() => setActiveProtocol(null)}>
                    <ol>
                        <li>Si glycémie &gt; <strong>{patient.cibles.gly_max.toFixed(2)} g/L</strong>, s'assurer que le patient boit beaucoup d'eau.</li>
                        <li>Vérifier la présence de <strong>cétones</strong> dans le sang ou les urines.</li>
                        <li>Si la dernière correction d'insuline date de plus de <strong>{patient.correctionDelayHours} heures</strong>, administrer une dose de correction comme défini dans le PAI.</li>
                        <li>Surveiller la glycémie toutes les 1 à 2 heures.</li>
                        <li><strong>Si la glycémie reste très élevée, que des cétones sont présentes, ou si le patient vomit, contacter immédiatement un médecin ou les urgences.</strong></li>
                    </ol>
                </ProtocolCard>
            );
        case 'acetone':
            return (
                 <ProtocolCard title="Protocole Cétone" colorClass="text-purple-700" onClose={() => setActiveProtocol(null)}>
                    <ol>
                        <li>La présence de cétones est un signe de manque d'insuline et peut être dangereuse (risque d'acidocétose).</li>
                        <li><strong>Boire beaucoup d'eau</strong> est essentiel.</li>
                        <li>Administrer une <strong>dose de correction d'insuline rapide</strong>, même en l'absence de repas, selon le protocole médical.</li>
                        <li>Éviter toute activité physique intense.</li>
                        <li>Contrôler la glycémie et les cétones toutes les heures.</li>
                        <li><strong>Si les cétones sont élevées (&gt; 1.5 mmol/L), si le patient vomit, a mal au ventre ou des difficultés à respirer, appeler immédiatement les secours (15 ou 112).</strong></li>
                    </ol>
                </ProtocolCard>
            );
        default:
            return null;
    }
  }

  const ActionButton: React.FC<{ title: string, subtitle: string, color: string, onClick: () => void }> = ({ title, subtitle, color, onClick}) => (
    <button 
        onClick={onClick} 
        className={`w-full p-4 rounded-card text-white text-left shadow-lg transition-transform transform hover:scale-105 ${color}`}
    >
        <p className="font-display font-bold text-xl">{title}</p>
        <p className="text-sm opacity-90">{subtitle}</p>
    </button>
  );

  return (
    <div className="p-4 space-y-5">
      <header className="mb-4 text-center">
        <h1 className="text-3xl font-display font-bold text-white text-shadow">Protocoles d'Urgence</h1>
      </header>
      
      <div className="grid grid-cols-1 gap-3">
        <ActionButton title="Hypoglycémie" subtitle="Glycémie basse" color="bg-amber-500" onClick={() => setActiveProtocol('hypo')} />
        <ActionButton title="Hyperglycémie" subtitle="Glycémie élevée" color="bg-rose-600" onClick={() => setActiveProtocol('hyper')} />
        <ActionButton title="Cétone" subtitle="Manque d'insuline" color="bg-purple-700" onClick={() => setActiveProtocol('acetone')} />
      </div>

      {activeProtocol && renderProtocol()}
      
      <Card>
        <h2 className="text-xl font-display font-semibold text-text-title mb-2">Patient</h2>
        <p className="text-lg"><span className="font-semibold">Prénom:</span> {patient.prenom}</p>
        <p className="text-lg"><span className="font-semibold">Date de naissance:</span> {new Date(patient.naissance).toLocaleDateString('fr-FR')}</p>
      </Card>
      
      <Card>
        <h2 className="text-xl font-display font-semibold text-text-title mb-2">Contacts d'urgence</h2>
        {patient.contacts.length > 0 ? (
          <div className="space-y-3">
            {patient.contacts.map(contact => (
              <div key={contact.id} className="p-3 bg-input-bg rounded-lg">
                <p className="font-bold">{contact.nom} <span className="text-sm font-normal text-text-muted">({contact.lien})</span></p>
                <a href={`tel:${contact.tel}`} className="text-emerald-main text-lg font-semibold">{contact.tel}</a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-muted">Aucun contact d'urgence ajouté. Veuillez les configurer dans les réglages.</p>
        )}
      </Card>

    </div>
  );
};

export default Emergency;