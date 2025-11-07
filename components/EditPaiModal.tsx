import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Patient, Cibles, Ratios, CorrectionRule } from '../types.ts';
import useTranslations from '../hooks/useTranslations.ts';
import toast from 'react-hot-toast';
import TrashIcon from './icons/TrashIcon.tsx';

interface EditPaiModalProps {
  onClose: () => void;
  onSave: (updatedPatient: Partial<Patient>) => void;
  patient: Patient;
}

const EditPaiModal: React.FC<EditPaiModalProps> = ({ onClose, onSave, patient }) => {
    const t = useTranslations();
    const [cibles, setCibles] = useState<Cibles>(patient.cibles);
    const [ratios, setRatios] = useState<Ratios>(patient.ratios);
    const [corrections, setCorrections] = useState<CorrectionRule[]>(patient.corrections.sort((a,b) => a.max - b.max));
    const [maxBolus, setMaxBolus] = useState(patient.maxBolus);
    const [correctionDelayHours, setCorrectionDelayHours] = useState(patient.correctionDelayHours);
    const [notesPai, setNotesPai] = useState(patient.notes_pai);

    const handleSave = () => {
        const updatedPatientData: Partial<Patient> = {
            cibles,
            ratios,
            corrections,
            maxBolus,
            correctionDelayHours,
            notes_pai: notesPai,
        };
        onSave(updatedPatientData);
    };

    const handleCorrectionChange = (index: number, field: keyof CorrectionRule, value: number) => {
        const newCorrections = [...corrections];
        newCorrections[index] = { ...newCorrections[index], [field]: value };
        setCorrections(newCorrections);
    };

    const addCorrectionRule = () => {
        const lastMax = corrections[corrections.length - 1]?.max || 3.0;
        setCorrections([...corrections, { max: lastMax + 1, addU: 0 }]);
    };
    
    const removeCorrectionRule = (index: number) => {
        if (corrections.length > 1) {
            setCorrections(corrections.filter((_, i) => i !== index));
        }
    };
    
    const inputClasses = "w-full p-2 bg-input-bg rounded-md border border-black/10 text-text-title placeholder-placeholder-text focus:outline-none focus:border-jade focus:ring-1 focus:ring-jade/30 transition-all duration-150";

    const modalContent = (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-off-white rounded-card shadow-2xl w-full max-w-lg border border-slate-200/75 animate-card-open flex flex-col">
                <div className="p-6">
                    <h3 className="text-xl font-display font-semibold text-text-title mb-4 text-center">{t.settings_data_editPai}</h3>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    {/* Cibles */}
                    <div>
                        <h4 className="font-semibold text-text-title mb-2">{t.pai_glycemicTargets}</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" value={cibles.gly_min} onChange={e => setCibles({...cibles, gly_min: parseFloat(e.target.value)})} className={inputClasses} />
                            <input type="number" value={cibles.gly_max} onChange={e => setCibles({...cibles, gly_max: parseFloat(e.target.value)})} className={inputClasses} />
                        </div>
                    </div>
                    {/* Ratios */}
                    <div>
                        <h4 className="font-semibold text-text-title mb-2">{t.pai_ratios}</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {Object.keys(ratios).filter(k => k !== 'collation').map(moment => (
                                <div key={moment}>
                                    <label className="text-sm text-text-muted">{t.mealTimes[moment as keyof typeof t.mealTimes]}</label>
                                    <input type="number" value={ratios[moment]} onChange={e => setRatios({...ratios, [moment]: parseFloat(e.target.value)})} className={inputClasses} />
                                </div>
                            ))}
                        </div>
                    </div>
                     {/* Corrections */}
                    <div>
                        <h4 className="font-semibold text-text-title mb-2">{t.pai_correctionSchema}</h4>
                        <div className="space-y-2">
                        {corrections.map((rule, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <span className="text-sm">{index === 0 ? '<=' : '>'} {index > 0 ? corrections[index-1].max.toFixed(2) : ''} et &lt;=</span>
                                <input type="number" value={rule.max === Infinity ? '' : rule.max} placeholder="∞" onChange={e => handleCorrectionChange(index, 'max', parseFloat(e.target.value) || Infinity)} className={`${inputClasses} text-center`} />
                                <span>g/L, ajouter</span>
                                <input type="number" value={rule.addU} onChange={e => handleCorrectionChange(index, 'addU', parseInt(e.target.value))} className={`${inputClasses} w-16 text-center`} />
                                <span>U</span>
                                <button onClick={() => removeCorrectionRule(index)} className="text-danger hover:text-danger-dark p-1"><TrashIcon /></button>
                            </div>
                        ))}
                        <button onClick={addCorrectionRule} className="text-sm font-semibold text-jade">+ Ajouter une règle</button>
                        </div>
                    </div>
                    {/* Autres */}
                    <div>
                        <h4 className="font-semibold text-text-title mb-2">Autres réglages</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-text-muted">Bolus max (U)</label>
                                <input type="number" value={maxBolus} onChange={e => setMaxBolus(parseInt(e.target.value))} className={inputClasses} />
                            </div>
                            <div>
                                <label className="text-sm text-text-muted">Délai correction (h)</label>
                                <input type="number" value={correctionDelayHours} onChange={e => setCorrectionDelayHours(parseInt(e.target.value))} className={inputClasses} />
                            </div>
                        </div>
                    </div>
                    {/* Notes */}
                    <div>
                        <h4 className="font-semibold text-text-title mb-2">{t.pai_notes}</h4>
                        <textarea value={notesPai} onChange={e => setNotesPai(e.target.value)} className={inputClasses} rows={3}></textarea>
                    </div>

                </div>
                <div className="mt-auto p-6 bg-slate-50 border-t grid grid-cols-2 gap-3">
                    <button onClick={onClose} className="w-full bg-white text-text-muted font-bold py-3 rounded-button border border-slate-300 hover:bg-slate-50 transition-colors">{t.common_cancel}</button>
                    <button onClick={handleSave} className="w-full bg-jade text-white font-bold py-3 rounded-button hover:bg-opacity-90 transition-colors shadow-sm">{t.common_save}</button>
                </div>
            </div>
        </div>
    );
    
    return createPortal(modalContent, document.body);
};

export default EditPaiModal;