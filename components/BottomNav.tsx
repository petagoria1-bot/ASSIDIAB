import React from 'react';
import { Page } from '../types.ts';
import HomeIcon from './icons/HomeIcon.tsx';
import CalculatorIcon from './icons/CalculatorIcon.tsx';
import JournalIcon from './icons/JournalIcon.tsx';
import EmergencyIcon from './icons/EmergencyIcon.tsx';
import UserIcon from './icons/UserIcon.tsx';
import useTranslations from '../hooks/useTranslations.ts';

interface BottomNavProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`relative z-10 flex flex-col items-center justify-center w-full h-14 transition-all duration-300 ease-fast ${isActive ? 'text-jade -translate-y-1' : 'text-icon-inactive hover:text-jade'}`}
    aria-label={label}
    aria-current={isActive ? 'page' : undefined}
  >
    {isActive && <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full animate-nav-halo-pulse" />}
    <div className="w-8 h-8 flex items-center justify-center">
        {icon}
    </div>
    <span className="text-[11px] mt-0.5 font-semibold">{label}</span>
  </button>
);


const BottomNav: React.FC<BottomNavProps> = ({ currentPage, setCurrentPage }) => {
  const t = useTranslations();

  const navItems = React.useMemo(() => [
    { page: 'dashboard', label: t.nav_home, icon: <HomeIcon /> },
    { page: 'journal', label: t.nav_journal, icon: <JournalIcon /> },
    { page: 'glucides', label: t.nav_calculator, icon: <CalculatorIcon /> },
    { page: 'emergency', label: t.nav_emergency, icon: <EmergencyIcon /> },
    { page: 'settings', label: t.settings_profile, icon: <UserIcon /> },
  ], [t]);
  
  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-40">
      <div 
        className="relative flex justify-around items-center h-16 bg-white/80 backdrop-blur-lg rounded-pill shadow-2xl p-1"
      >
        {navItems.map((item) => (
          <NavItem
            key={item.page}
            label={item.label}
            icon={item.icon}
            isActive={currentPage === item.page}
            onClick={() => setCurrentPage(item.page as Page)}
          />
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;