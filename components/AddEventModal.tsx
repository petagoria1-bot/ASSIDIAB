import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { Event, EventType } from '../types.ts';
// FIX: Changed import to be a relative path and added file extension for proper module resolution.
import useTranslations from '../hooks/useTranslations.ts';

interface AddEventModalProps {
  onClose: () => void;
  onConfirm: (eventData: Omit<Event, 'id' | 'patient_id' | 'status'>) => void;
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
  const t = useTranslations();

  const handleConfirm = () => {
    if (!title.trim()) {
      toast.error(t.toast_titleRequired);
      return;
    }
    if (!eventDateTime) {
        toast.error(t.toast_datetimeRequired);
        return;
    }

    onConfirm({
        ts: new Date(eventDateTime).toISOString(),
        type: eventType,
        title: title.trim(),
        description: description.trim() || undefined,
    });
  };

  const inputClasses = "w-full p-3 bg-input-bg rounded-input border border-black/10 text-text-title placeholder-placeholder-text focus:outline-none focus:border-jade focus:ring-2 focus:ring-jade/30 transition-all duration-150";

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-off-white rounded-card shadow-2xl p-6 w-full max-w-sm border border-slate-200/75 animate-fade-in-lift" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-display font-semibold text-text-title mb-4 text-center">{t.addEvent_title}</h3>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <button onClick={() => setEventType('rdv')} className={`flex-1 py-2 rounded-pill text-sm font-semibold transition-colors ${eventType === 'rdv' ? 'bg-jade text-white' : 'bg-input-bg text-text-main'}`}>
              {t.addEvent_appointment}
            </button>
            <button onClick={() => setEventType('note')} className={`flex-1 py-2 rounded-pill text-sm font-semibold transition-colors ${eventType === 'note' ? 'bg-jade text-white' : 'bg-input-bg text-text-main'}`}>
              {t.addEvent_note}
            </button>
          </div>
          
          <div>
            <label htmlFor="event-title" className="block text-sm font-medium text-text-muted mb-1">{eventType === 'rdv' ? t.addEvent_doctorLabel : t.addEvent_eventTitleLabel}</label>
            <input
              type="text"
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClasses}
              placeholder={eventType === 'rdv' ? t.addEvent_doctorPlaceholder : t.addEvent_eventTitlePlaceholder}
            />
          </div>

          <div>
            <label htmlFor="event-datetime" className="block text-sm font-medium text-text-muted mb-1">{t.common_datetime}</label>
            <input
              type="datetime-local"
              id="event-datetime"
              value={eventDateTime}
              onChange={(e) => setEventDateTime(e.target.value)}
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="event-description" className="block text-sm font-medium text-text-muted mb-1">{t.addEvent_additionalInfoLabel}</label>
            <textarea
              id="event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClasses}
              rows={3}
              placeholder={eventType === 'rdv' ? t.addEvent_additionalInfoPlaceholder : t.addEvent_descriptionPlaceholder}
            />
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={onClose} className="w-full bg-white text-text-muted font-bold py-3 rounded-button border border-slate-300 hover:bg-slate-50 transition-colors">{t.common_cancel}</button>
          <button onClick={handleConfirm} className="w-full bg-jade text-white font-bold py-3 rounded-button hover:bg-opacity-90 transition-colors shadow-sm">{t.common_confirm}</button>
        </div>
      </div>
    </div>
  );
  
  return createPortal(modalContent, document.body);
};

export default AddEventModal;
