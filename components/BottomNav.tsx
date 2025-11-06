import React from 'react';
import { Page } from '../types';
import HomeIcon from './icons/HomeIcon';
import CalculatorIcon from './icons/CalculatorIcon';
import JournalIcon from './icons/JournalIcon';
import ChartIcon from './icons/ChartIcon';
import SettingsIcon from './icons/SettingsIcon';
import InboxIcon from './icons/InboxIcon';
import { usePatientStore } from '../store/patientStore';
import useTranslations from '../hooks/useTranslations';


interface BottomNavProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  badgeCount?: number;
}> = ({ label, icon, isActive, onClick, badgeCount }) => (
  <button
    onClick={onClick}
    className={`relative flex flex-col items-center justify-center w-full transition-all duration-200 ease-in-out ${isActive ? 'text-emerald-main' : 'text-icon-inactive'}`}
    aria-label={label}
  >
    <div className={`transition-transform duration-200 ${isActive ? 'scale-110 -translate-y-1' : ''}`}>
      {icon}
      {badgeCount && badgeCount > 0 && (
         <span className="absolute -top-1 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white text-[10px] font-bold ring-2 ring-white">
          {badgeCount > 9 ? '9+' : badgeCount}
        </span>
      )}
    </div>
    <span className={`text-xs font-semibold mt-1 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ currentPage, setCurrentPage }) => {
  const { unreadMessagesCount } = usePatientStore();
  const t = useTranslations();
  
  const navItems = [
    { page: 'dashboard', label: t.nav_home, icon: <HomeIcon /> },
    { page: 'glucides', label: t.nav_calculator, icon: <CalculatorIcon /> },
    { page: 'journal', label: t.nav_journal, icon: <JournalIcon /> },
    { page: 'inbox', label: t.nav_inbox, icon: <InboxIcon />, badge: unreadMessagesCount },
    { page: 'settings', label: t.nav_settings, icon: <SettingsIcon /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md shadow-inner-top z-40">
      <div className="flex justify-around items-start h-full max-w-lg mx-auto px-2 pt-2">
        {navItems.map(item => (
          <NavItem
            key={item.page}
            label={item.label}
            icon={item.icon}
            isActive={currentPage === item.page}
            onClick={() => setCurrentPage(item.page as Page)}
            badgeCount={item.badge}
          />
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
