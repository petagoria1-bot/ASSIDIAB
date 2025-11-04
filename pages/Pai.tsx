import React from 'react';
import { usePatientStore } from '../store/patientStore';
import Card from '../components/Card';
import { MEAL_TIMES } from '../constants';

const Pai: React.FC = () => {
    const { patient } = usePatientStore();

    if (!patient) {
        return <div className="p-4"><p>Chargement des données du patient...</p></div>;
    }

    return (
        <div className="p-4 space-y-4">
            <header className="mb-4 text-center">
                <h1 className="text-3xl font-display font-bold text-neutral-title dark:text-dark-title">PAI de {patient.prenom}</h1>
                <p className="text-neutral-subtext dark:text-dark-subtext">Protocole d'Accueil Individualisé</p>
            </header>

            <Card>
                <h2 className="text-xl font-semibold text-neutral-title dark:text-dark-title mb-3">Informations Générales</h2>
                <div className="space-y-1">
                    <p><strong>Nom:</strong> {patient.prenom}</p>
                    <p><strong>Date de naissance:</strong> {new Date(patient.naissance).toLocaleDateString('fr-FR')}</p>
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-semibold text-neutral-title dark:text-dark-title mb-3">Objectifs Glycémiques</h2>
                <p>Cible: <strong>{patient.cibles.gly_min.toFixed(2)} - {patient.cibles.gly_max.toFixed(2)} g/L</strong></p>
            </Card>

            <Card>
                <h2 className="text-xl font-semibold text-neutral-title dark:text-dark-title mb-3">Ratios Insuline/Glucides</h2>
                <p className="text-sm text-neutral-subtext dark:text-dark-subtext mb-2">Pour 1 unité d'insuline rapide</p>
                <div className="grid grid-cols-2 gap-2">
                    {Object.entries(patient.ratios).map(([key, value]) => (
                        <div key={key} className="bg-neutral-bg dark:bg-dark-bg/50 p-2 rounded-lg text-center">
                            <p className="text-xs font-medium">{MEAL_TIMES[key as keyof typeof MEAL_TIMES]}</p>
                            <p className="font-bold">{value} g</p>
                        </div>
                    ))}
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-semibold text-neutral-title dark:text-dark-title mb-3">Schéma de Correction</h2>
                <p className="text-sm text-neutral-subtext dark:text-dark-subtext mb-2">Unités à ajouter en fonction de la glycémie</p>
                <ul className="list-disc list-inside space-y-1">
                    {patient.corrections.sort((a, b) => a.max - b.max).map((rule, index) => (
                         <li key={index}>
                            {index === 0 ? `Si ≤ ${rule.max.toFixed(2)} g/L` : `Si > ${patient.corrections[index-1].max.toFixed(2)} et ≤ ${rule.max.toFixed(2)} g/L`}:
                            <strong> +{rule.addU} U</strong>
                         </li>
                    ))}
                </ul>
                <p className="text-xs text-neutral-subtext dark:text-dark-subtext mt-3">Ne pas recoriger avant <strong>{patient.correctionDelayHours} heures</strong>.</p>
            </Card>
            
            <Card>
                <h2 className="text-xl font-semibold text-neutral-title dark:text-dark-title mb-3">Notes</h2>
                <p className="text-neutral-body dark:text-dark-body whitespace-pre-wrap">{patient.notes_pai || "Aucune note."}</p>
            </Card>

        </div>
    );
};

export default Pai;
