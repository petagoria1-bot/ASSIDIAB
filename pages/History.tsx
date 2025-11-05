import React, { useMemo, useRef, useEffect, useState } from 'react';
import { usePatientStore } from '../store/patientStore';
import { Mesure, Repas, Injection } from '../types';
import useTranslations from '../hooks/useTranslations';
import TimelineEventCard from '../components/TimelineEventCard';

type TimelineEvent = (Mesure | Repas | Injection | { id: string; ts: string; type: 'activity' | 'note', details: any }) & { eventType: 'mesure' | 'repas' | 'injection' | 'activity' | 'note' };

const useAnimatedEntries = () => {
  const observer = useRef<IntersectionObserver | null>(null);
  const [visibleEntries, setVisibleEntries] = useState<Set<string>>(new Set());

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleEntries((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      {
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1,
      }
    );

    return () => observer.current?.disconnect();
  }, []);

  const observe = (element: HTMLElement | null) => {
    if (element) {
      observer.current?.observe(element);
    }
  };

  return { visibleEntries, observe };
};

const History: React.FC = () => {
  const { mesures, repas, injections } = usePatientStore();
  const t = useTranslations();
  const { visibleEntries, observe } = useAnimatedEntries();

  const allEvents: TimelineEvent[] = useMemo(() => {
    const combined = [
      ...mesures.map(m => ({ ...m, eventType: 'mesure' as const })),
      ...repas.map(r => ({ ...r, eventType: 'repas' as const })),
      ...injections.map(i => ({ ...i, eventType: 'injection' as const })),
      // Mock data for demonstration as per prompt
      { id: 'mock-activity-1', ts: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), eventType: 'activity' as const, details: { duration: 30, type: 'Marche' }},
      { id: 'mock-note-1', ts: new Date(Date.now() - 10 * 3600 * 1000).toISOString(), eventType: 'note' as const, details: { text: "Impression de fatigue après le déjeuner." }},
    ];
    return combined.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
  }, [mesures, repas, injections]);
  
  const groupedEvents = useMemo(() => {
    const groups: { [key: string]: TimelineEvent[] } = {};
    allEvents.forEach(event => {
      const date = new Date(event.ts).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(event);
    });
    return Object.entries(groups);
  }, [allEvents]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return t.history_today;
    if (date.toDateString() === yesterday.toDateString()) return t.history_yesterday;
    
    return date.toLocaleDateString(t.locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <div className="p-4 space-y-4 pb-24 min-h-screen">
      <header className="py-4 text-center">
        <h1 className="text-3xl font-display font-bold text-text-title">{t.history_title}</h1>
      </header>

      {allEvents.length === 0 ? (
        <div className="text-center p-8 bg-white/50 rounded-card mt-10">
            <p className="font-semibold text-text-muted">{t.history_empty}</p>
        </div>
      ) : (
        <div className="relative px-4">
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-turquoise-light/30 rounded-full" />
          {groupedEvents.map(([date, events]) => (
            <div key={date} className="relative mb-8">
              <div id={`date-${date}`} ref={observe} className={`sticky top-4 z-10 flex justify-center py-2 ${visibleEntries.has(`date-${date}`) ? 'animate-timeline-point-pop' : 'opacity-0'}`}>
                <span className="bg-honey-yellow text-text-title font-display font-semibold text-sm px-4 py-1.5 rounded-pill shadow-md border-2 border-white">
                  {formatDate(date)}
                </span>
              </div>

              {events.map((event, index) => {
                const isVisible = visibleEntries.has(event.id);
                const animationClass = index % 2 === 0
                  ? (isVisible ? 'animate-timeline-card-left' : 'opacity-0')
                  : (isVisible ? 'animate-timeline-card-right' : 'opacity-0');
                const animationDelay = `${index * 100}ms`;

                return (
                  <div id={event.id} ref={observe} key={event.id} className="relative my-4">
                     <div className={`absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-turquoise-light transition-transform duration-300 ${isVisible ? 'animate-timeline-point-pop scale-100' : 'scale-0'}`} style={{ transitionDelay: animationDelay }} />
                    <div className={animationClass} style={{ animationDelay }}>
                      <TimelineEventCard event={event} position={index % 2 === 0 ? 'left' : 'right'} />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
