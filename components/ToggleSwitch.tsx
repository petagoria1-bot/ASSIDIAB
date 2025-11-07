import React from 'react';

interface ToggleSwitchProps {
  isOn: boolean;
  onToggle: () => void;
  ariaLabel: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isOn, onToggle, ariaLabel }) => {
  return (
    <button
      role="switch"
      aria-checked={isOn}
      aria-label={ariaLabel}
      onClick={onToggle}
      className={`relative inline-flex items-center h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jade ${
        isOn ? 'bg-jade' : 'bg-slate-300'
      }`}
    >
      <span
        aria-hidden="true"
        className={`inline-block w-5 h-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out ${
          isOn ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-1 rtl:-translate-x-1'
        }`}
      />
    </button>
  );
};

export default ToggleSwitch;