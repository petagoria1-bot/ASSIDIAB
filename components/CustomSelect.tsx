import React, { useState, useRef, useEffect } from 'react';
import ChevronDownIcon from './icons/ChevronDownIcon.tsx';

interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const inputClasses = "w-full p-3 bg-white rounded-input border border-black/10 text-text-title placeholder-placeholder-text focus:outline-none focus:border-jade focus:ring-2 focus:ring-jade/30 transition-all duration-150 text-center text-lg";

  return (
    <div className="relative" ref={selectRef}>
      <button
        type="button"
        className={`${inputClasses} flex items-center justify-center gap-2`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption?.icon}
        <span className="font-semibold">{selectedOption?.label}</span>
        <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 animate-fade-in-fast">
          <ul className="py-1">
            {options.map(option => (
              <li
                key={option.value}
                className="px-4 py-2 hover:bg-slate-100 cursor-pointer flex items-center gap-3"
                onClick={() => handleSelect(option.value)}
              >
                {option.icon}
                <span className="font-semibold text-text-main">{option.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;