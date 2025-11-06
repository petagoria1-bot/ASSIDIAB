

import React, { useState, useEffect } from 'react';

import SunriseIcon from './icons/SunriseIcon.tsx';
import MorningIcon from './icons/MorningIcon.tsx';
import NoonIcon from './icons/NoonIcon.tsx';
import AfternoonIcon from './icons/AfternoonIcon.tsx';
import GoldenHourIcon from './icons/GoldenHourIcon.tsx';
import SunsetIcon from './icons/SunsetIcon.tsx';
import DuskIcon from './icons/DuskIcon.tsx';
import NightIcon from './icons/NightIcon.tsx';

type TimePhase = 'sunrise' | 'morning' | 'noon' | 'afternoon' | 'goldenHour' | 'sunset' | 'dusk' | 'night';

interface PhaseConfig {
    label: string;
    icon: React.FC<{className?: string}>;
}

const phaseConfigs: Record<TimePhase, PhaseConfig> = {
    sunrise: { label: 'Lever du soleil', icon: SunriseIcon },
    morning: { label: 'Matin', icon: MorningIcon },
    noon: { label: 'Midi', icon: NoonIcon },
    afternoon: { label: 'Après-midi', icon: AfternoonIcon },
    goldenHour: { label: 'Heure dorée', icon: GoldenHourIcon },
    sunset: { label: 'Coucher du soleil', icon: SunsetIcon },
    dusk: { label: 'Crépuscule', icon: DuskIcon },
    night: { label: 'Nuit', icon: NightIcon },
};

const getCurrentPhase = (): TimePhase => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 7) return 'sunrise';
    if (hour >= 7 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 14) return 'noon';
    if (hour >= 14 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 20) return 'goldenHour';
    if (hour >= 20 && hour < 21) return 'sunset';
    if (hour >= 21 && hour < 22) return 'dusk';
    return 'night';
};

interface TimeOfDayHeaderProps {
    greeting: string;
}

const TimeOfDayHeader: React.FC<TimeOfDayHeaderProps> = ({ greeting }) => {
    const [phase, setPhase] = useState(getCurrentPhase());

    useEffect(() => {
        const timer = setInterval(() => {
            setPhase(getCurrentPhase());
        }, 60000); // Check every minute
        return () => clearInterval(timer);
    }, []);

    const config = phaseConfigs[phase];
    const Icon = config.icon;

    return (
        <header className="pt-8 pb-4 px-4 text-white">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 flex-shrink-0 animate-fade-in">
                    <Icon className="w-full h-full text-white opacity-90 drop-shadow-lg" />
                </div>
                <div>
                    <h1 className="text-3xl font-display font-bold text-shadow">{greeting}</h1>
                    <p className="text-white/80 font-semibold">{config.label}</p>
                </div>
            </div>
        </header>
    );
};

export default TimeOfDayHeader;