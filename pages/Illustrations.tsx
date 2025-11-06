

import React from 'react';
import { Page } from '../types.ts';
import useTranslations from '../hooks/useTranslations.ts';
import Card from '../components/Card.tsx';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon.tsx';
import BreakfastSteamAnimation from '../components/animations/BreakfastSteamAnimation.tsx';
import GlucosePulseAnimation from '../components/animations/GlucosePulseAnimation.tsx';
import InsulinPenAnimation from '../components/animations/InsulinPenAnimation.tsx';
import HeartBeatAnimation from '../components/animations/HeartBeatAnimation.tsx';
import CalendarBlinkAnimation from '../components/animations/CalendarBlinkAnimation.tsx';
import CheckmarkPopAnimation from '../components/animations/CheckmarkPopAnimation.tsx';

interface IllustrationsProps {
  setCurrentPage: (page: Page) => void;
}

const Illustrations: React.FC<IllustrationsProps> = ({ setCurrentPage }) => {
  const t = useTranslations();

  const animations = [
    { title: t.animations_steam, component: <BreakfastSteamAnimation className="w-20 h-20" /> },
    { title: t.animations_pulse, component: <GlucosePulseAnimation className="w-20 h-20" /> },
    { title: t.animations_pen, component: <InsulinPenAnimation className="w-20 h-20" /> },
    { title: t.animations_heart, component: <HeartBeatAnimation className="w-20 h-20" /> },
    { title: t.animations_calendar, component: <CalendarBlinkAnimation className="w-20 h-20" /> },
    { title: t.animations_checkmark, component: <CheckmarkPopAnimation className="w-20 h-20" /> },
  ];

  return (
    <div className="p-4 space-y-4 pb-24">
      <header className="py-4 text-center relative flex items-center justify-center">
        <button 
          onClick={() => setCurrentPage('settings')} 
          className="absolute left-0 text-white p-2 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Back to settings"
        >
          <ArrowLeftIcon />
        </button>
        <div>
            <h1 className="text-3xl font-display font-bold text-white text-shadow">{t.animations_title}</h1>
            <p className="text-white/80">{t.animations_subtitle}</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {animations.map((anim, index) => (
          <Card key={index} className="flex flex-col items-center justify-center p-4 aspect-square">
            <div className="flex-grow flex items-center justify-center w-full h-full">
              {anim.component}
            </div>
            <p className="text-sm font-semibold text-text-muted mt-2 text-center">{anim.title}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Illustrations;