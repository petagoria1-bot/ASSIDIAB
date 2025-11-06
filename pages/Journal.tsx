import React, { useMemo, useRef, useEffect, useState } from 'react';
import { usePatientStore } from '../store/patientStore.ts';
import { Mesure, Repas, Injection, Page } from '../types.ts';
import useTranslations from '../hooks/useTranslations.ts';
import TimelineEventCard from '../components/TimelineEventCard.tsx';

type TimelineEvent = (Mesure | Repas | Injection) & { eventType: 'mesure' | 'repas' | 'injection' };

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

const Journal: React.FC<{ setCurrentPage: (page: Page) => void }> = ({ setCurrentPage }) => {
  const { mesures, repas, injections } = usePatientStore();
  const t = useTranslations();
  const { visibleEntries, observe } = useAnimatedEntries();

  const allEvents: TimelineEvent[] = useMemo(() => {
    const combined = [
      ...mesures.map(m => ({ ...m, eventType: 'mesure' as const })),
      ...repas.map(r => ({ ...r, eventType: 'repas' as const })),
      ...injections.map(i => ({ ...i, eventType: 'injection' as const })),
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
    <div className="bg-history-gradient min-h-screen pb-24">
        <header className="sticky top-0 bg-history-gradient/80 backdrop-blur-md py-4 z-20">
            <h1 className="text-3xl font-display font-bold text-text-title text-center">{t.journal_title}</h1>
        </header>

      {allEvents.length === 0 ? (
        <div className="text-center p-8 bg-white/50 rounded-card mt-10 mx-4">
            <p className="font-semibold text-text-muted">{t.history_empty}</p>
        </div>
      ) : (
        <div className="relative px-4 pt-4">
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-emerald-main/20 rounded-full" />
          {groupedEvents.map(([date, events]) => (
            <div key={date} className="relative mb-8">
              <div id={`date-${date}`} ref={observe} className={`sticky top-20 z-10 flex justify-center py-2 ${visibleEntries.has(`date-${date}`) ? 'animate-timeline-point-pop' : 'opacity-0'}`}>
                <span className="bg-white text-text-title font-display font-semibold text-sm px-4 py-1.5 rounded-pill shadow-lg border-2 border-white">
                  {formatDate(date)}
                </span>
              </div>

              {events.map((event, index) => {
                const isVisible = visibleEntries.has(event.id);
                const animationClass = index % 2 === 0
                  ? (isVisible ? 'animate-timeline-card-left' : 'opacity-0')
                  : (isVisible ? 'animate-timeline-card-right' : 'opacity-0');
                const animationDelay = `${index * 80}ms`;

                return (
                  <div id={event.id} ref={observe} key={event.id} className="relative my-4">
                     <div className={`absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-emerald-main transition-transform duration-300 ${isVisible ? 'animate-timeline-point-pop scale-100' : 'scale-0'}`} style={{ transitionDelay: animationDelay }} />
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

export default Journal;
