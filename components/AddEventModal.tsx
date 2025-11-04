import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Event, EventType } from '../types';

interface AddEventModalProps {
  onClose: () => void;
  onConfirm: (eventData: Omit<Event, 'id' | 'patient_id'>) => void;
}

const toLocalISOString = (date: Date) => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
    return localISOTime;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ onClose, onConfirm }) => {
  const [eventType, setEventType] = useState<EventType>('rdv');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDateTime, setEventDateTime] = useState(toLocalISOString(new Date()));
  
  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Le titre est requis.');
      return;
    }
    if (!eventDateTime) {
      toast.error('Veuillez spécifier une date et une heure.');
      return;
    }
    
    const eventData = {
        ts: new Date(eventDateTime).toISOString(),
        type: eventType,
        title: title.trim(),
        description: description.trim(),
    };
    onConfirm(eventData);
  };

  const inputClasses = "w-full p-3 bg-input-bg rounded-input border border-black/10 text-text-title placeholder-placeholder-text focus:outline-none focus:border-emerald-main focus:ring-2 focus:ring-emerald-main/30 transition-all duration-150";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-off-white rounded-card shadow-2xl p-6 w-full max-w-sm border border-slate-200/75 animate-fade-in-lift" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-display font-semibold text-text-title mb-4 text-center">Ajouter à l'agenda</h3>
        
        <div className="space-y-4">
            <div className="flex gap-2 p-1 bg-input-bg rounded-pill">
                <button onClick={() => setEventType('rdv')} className={`flex-1 py-2 rounded-pill text-sm font-semibold transition-colors ${eventType === 'rdv' ? 'bg-white text-text-title shadow-sm' : 'text-text-muted'}`}>
                  Rendez-vous
                </button>
                <button onClick={() => setEventType('note')} className={`flex-1 py-2 rounded-pill text-sm font-semibold transition-colors ${eventType === 'note' ? 'bg-white text-text-title shadow-sm' : 'text-text-muted'}`}>
                  Note / Rappel
                </button>
            </div>

            <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Date et Heure</label>
                <input
                    type="datetime-local"
                    value={eventDateTime}
                    onChange={(e) => setEventDateTime(e.target.value)}
                    className={inputClasses}
                />
            </div>
          
            <div>
                <label className="block text-sm font-medium text-text-muted mb-1">
                    {eventType === 'rdv' ? 'Médecin / Spécialité' : "Titre de l'événement"}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClasses}
                  placeholder={eventType === 'rdv' ? "Ex: Dr. Martin, Diabétologue" : "Ex: Changer le cathéter"}
                />
            </div>
          
            <div>
                <label className="block text-sm font-medium text-text-muted mb-1">
                    {eventType === 'rdv' ? 'Informations complémentaires' : "Description"}
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={inputClasses}
                    rows={3}
                    placeholder={eventType === 'rdv' ? "Lieu, questions à poser..." : "Détails supplémentaires..."}
                />
            </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={onClose} className="w-full bg-white text-text-muted font-bold py-3 rounded-button border border-slate-300 hover:bg-slate-50 transition-colors">Annuler</button>
          <button onClick={handleSave} className="w-full bg-emerald-main text-white font-bold py-3 rounded-button hover:bg-jade-deep-dark transition-colors shadow-sm">Enregistrer</button>
        </div>
      </div>
    </div>
  );
};

export default AddEventModal;