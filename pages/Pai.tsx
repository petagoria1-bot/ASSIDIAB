import React from 'react';
import { usePatientStore } from '../store/patientStore';

const Pai: React.FC = () => {
    const { patient } = usePatientStore();

    if (!patient) {
        return <div className="p-4 text-center">Aucun patient configuré.</div>;
    }

    const calculateAge = (birthDate: string) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };
    
    return (
        <div className="p-4 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">PAI Simplifié</h1>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg" id="pai-content">
                <h2 className="text-xl font-bold text-center mb-4">Projet d'Accueil Individualisé - Diabète Type 1</h2>
                
                <section className="mb-4">
                    <h3 className="font-bold border-b pb-1 mb-2">Informations sur l'enfant</h3>
                    <p><strong>Prénom:</strong> {patient.prenom}</p>
                    <p><strong>Date de naissance:</strong> {new Date(patient.naissance).toLocaleDateString('fr-FR')}</p>
                    <p><strong>Âge:</strong> {calculateAge(patient.naissance)} ans</p>
                </section>

                <section className="mb-4">
                    <h3 className="font-bold border-b pb-1 mb-2">Objectifs de glycémie</h3>
                    <p>La cible de glycémie est entre <strong>{patient.cibles.gly_min} g/L</strong> et <strong>{patient.cibles.gly_max} g/L</strong>.</p>
                </section>

                <section className="mb-4">
                    <h3 className="font-bold border-b pb-1 mb-2">Conduite à tenir - Hypoglycémie (&lt; 0.70 g/L)</h3>
                    <ol className="list-decimal list-inside space-y-1">
                        <li>Donner immédiatement 15g de sucre rapide (3 morceaux de sucre ou un jus de fruit).</li>
                        <li>Attendre 15 minutes.</li>
                        <li>Re-contrôler la glycémie. Si toujours basse, redonner 15g de sucre.</li>
                        <li>Prévenir les parents.</li>
                    </ol>
                </section>

                <section className="mb-4">
                    <h3 className="font-bold border-b pb-1 mb-2">Conduite à tenir - Hyperglycémie (&gt; 2.50 g/L)</h3>
                    <ol className="list-decimal list-inside space-y-1">
                        <li>Faire boire de l'eau.</li>
                        <li>Laisser l'enfant aller aux toilettes autant que nécessaire.</li>
                        <li>Contrôler les cétones si un appareil est disponible.</li>
                        <li>Prévenir les parents pour une éventuelle dose de correction d'insuline.</li>
                    </ol>
                </section>
                
                {patient.notes_pai && (
                    <section className="mb-4">
                        <h3 className="font-bold border-b pb-1 mb-2">Notes importantes</h3>
                        <p className="whitespace-pre-wrap">{patient.notes_pai}</p>
                    </section>
                )}

                 <section>
                    <h3 className="font-bold border-b pb-1 mb-2">Contacts d'urgence</h3>
                    {patient.contacts && patient.contacts.length > 0 ? (
                        patient.contacts.map(contact => (
                            <p key={contact.id}><strong>{contact.lien} ({contact.nom}):</strong> <a href={`tel:${contact.tel}`} className="text-blue-600">{contact.tel}</a></p>
                        ))
                    ) : (
                        <p className="text-gray-500">Aucun contact configuré. Veuillez les ajouter dans les Réglages.</p>
                    )}
                </section>
            </div>
            <button 
                onClick={() => window.print()}
                className="mt-6 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
                Imprimer le PAI
            </button>
        </div>
    );
};

export default Pai;