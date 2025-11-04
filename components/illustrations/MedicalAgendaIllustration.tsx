
import React from 'react';

const MedicalAgendaIllustration: React.FC = () => (
  <div className="relative w-24 h-24 mx-auto my-2">
    <svg viewBox="0 0 100 100" className="absolute inset-0">
      {/* Calendar */}
      <g transform="translate(10, 20)">
        <rect x="0" y="0" width="80" height="70" rx="12" fill="#F9FAFB" />
        <rect x="0" y="0" width="80" height="20" rx="12" fill="#E5E7EB" />
        <circle cx="20" cy="35" r="5" fill="#C5B7FF" />
        <circle cx="40" cy="35" r="5" fill="#C5B7FF" />
        <circle cx="60" cy="35" r="5" fill="#FF7E67" />
        <circle cx="20" cy="55" r="5" fill="#E5E7EB" />
      </g>
       {/* Clock */}
      <g transform="translate(60, 5)">
        <circle cx="15" cy="15" r="15" fill="#A7F3D0" />
        <line x1="15" y1="15" x2="15" y2="5" stroke="#00A86B" strokeWidth="2" strokeLinecap="round" />
        <line x1="15" y1="15" x2="22" y2="20" stroke="#00A86B" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  </div>
);

export default MedicalAgendaIllustration;
