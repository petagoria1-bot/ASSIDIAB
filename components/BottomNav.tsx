import React from 'react';
import { Page } from '../types';
import useTranslations from '../hooks/useTranslations';
import HomeIcon from './icons/HomeIcon';
import CalculatorIcon from './icons/CalculatorIcon';
import EmergencyIcon from './icons/EmergencyIcon';
import SettingsIcon from './icons/SettingsIcon';
import JournalIcon from './icons/JournalIcon';

interface BottomNavProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentPage, setCurrentPage }) => {
  const t = useTranslations();
  const navItems = [
    { page: 'dashboard' as Page, label: t.nav_home, icon: HomeIcon },
    { page: 'journal' as Page, label: t.nav_journal, icon: JournalIcon },
    { page: 'glucides' as Page, label: t.nav_calculator, icon: CalculatorIcon },
    { page: 'emergency' as Page, label: t.nav_emergency, icon: EmergencyIcon },
    { page: 'settings' as Page, label: t.nav_settings, icon: SettingsIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/60 backdrop-blur-xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)] border-t border-black/5">
      <div className="flex justify-around items-center h-20 max-w-lg mx-auto pb-4">
        {navItems.map((item) => {
          const isActive = currentPage === item.page;
          return (
            <button
              key={item.page}
              onClick={() => setCurrentPage(item.page)}
              className={`flex flex-col items-center justify-center w-full transition-all duration-300 transform
                ${isActive ? 'text-jade-deep font-bold' : 'text-icon-inactive hover:text-jade-deep'}`
              }
              aria-current={isActive ? 'page' : undefined}
            >
              <div className={isActive ? 'animate-icon-active' : ''}>
                <item.icon className={`transition-all duration-300 ${isActive ? 'text-emerald-main' : ''}`}/>
              </div>
              <span className={`text-xs mt-1 font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;