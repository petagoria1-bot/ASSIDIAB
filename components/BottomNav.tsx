import React, { useRef, useEffect, useState } from 'react';
import { Page } from '../types.ts';
import HomeIcon from './icons/HomeIcon.tsx';
import CalculatorIcon from './icons/CalculatorIcon.tsx';
import HistoryIcon from './icons/HistoryIcon.tsx';
import ChartIcon from './icons/ChartIcon.tsx';
import SettingsIcon from './icons/SettingsIcon.tsx';
import useTranslations from '../hooks/useTranslations.ts';

interface BottomNavProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const NavItem = React.forwardRef<HTMLButtonElement, {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}>(({ label, icon, isActive, onClick }, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    className={`relative z-10 flex flex-col items-center justify-center w-full h-14 transition-colors duration-300 ease-fast ${isActive ? 'text-white' : 'text-icon-inactive hover:text-emerald-main'}`}
    aria-label={label}
  >
    <div className="w-8 h-8 flex items-center justify-center">
        {icon}
    </div>
    <span className="text-[11px] mt-0.5 font-semibold">{label}</span>
  </button>
));


const BottomNav: React.FC<BottomNavProps> = ({ currentPage, setCurrentPage }) => {
  const t = useTranslations();
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ opacity: 0 });

  const navItems = React.useMemo(() => [
    { page: 'dashboard', label: t.nav_home, icon: <HomeIcon /> },
    { page: 'glucides', label: t.nav_calculator, icon: <CalculatorIcon /> },
    { page: 'journal', label: t.nav_journal, icon: <HistoryIcon /> },
    { page: 'rapports', label: t.nav_reports, icon: <ChartIcon /> },
    { page: 'settings', label: t.nav_settings, icon: <SettingsIcon /> },
  ], [t]);
  
  itemRefs.current = [];

  useEffect(() => {
    const updateIndicator = () => {
        const pageToFind = currentPage === 'history' ? 'journal' : currentPage;
        const activeIndex = navItems.findIndex(item => item.page === pageToFind);
        const activeItem = itemRefs.current[activeIndex];
        
        if (activeItem) {
          const { offsetLeft, clientWidth } = activeItem;
          setIndicatorStyle({
            opacity: 1,
            left: `${offsetLeft}px`,
            width: `${clientWidth}px`,
          });
        }
    };
    
    // Delay to allow DOM to settle, especially on initial load or resize
    const timeoutId = setTimeout(updateIndicator, 50);
    
    const resizeObserver = new ResizeObserver(() => {
        setTimeout(updateIndicator, 50);
    });
    
    if (navRef.current) {
        resizeObserver.observe(navRef.current);
    }
    
    return () => {
        clearTimeout(timeoutId);
        resizeObserver.disconnect();
    };

  }, [currentPage, navItems]);

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-40">
      <div 
        ref={navRef}
        className="relative flex justify-around items-center h-16 bg-white/70 backdrop-blur-lg rounded-pill shadow-2xl p-1"
      >
        <div 
          className="absolute top-1 h-14 bg-emerald-main rounded-pill transition-all duration-400 ease-[cubic-bezier(0.25,1.5,0.5,1)]"
          style={{ ...indicatorStyle, transitionProperty: 'left, width, opacity' }}
        />
        {navItems.map((item, index) => (
          <NavItem
            key={item.page}
            ref={el => { if (el) itemRefs.current[index] = el; }}
            label={item.label}
            icon={item.icon}
            isActive={currentPage === item.page || (item.page === 'journal' && currentPage === 'history')}
            onClick={() => setCurrentPage(item.page as Page)}
          />
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;