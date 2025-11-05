import React from 'react';

const SnackIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className={className} width="64" height="64">
        <g stroke="#1E293B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.9,47.1l22-14.7c1-0.7,2.2-0.7,3.2,0l2.3,1.5" fill="#FCD34D"/>
            <path d="M12.9,47.1l-2.2-12.8c-0.3-1.6,1.2-3,2.8-2.7l22.3,3.7" fill="#FBBF24"/>
            <path d="M12.9,47.1H38" fill="none"/>
            <path d="M20,38c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S21.1,38,20,38z" fill="white" stroke="none"/>
            <path d="M28,42c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S29.1,42,28,42z" fill="white" stroke="none"/>
            <path d="M24,44c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S25.1,44,24,44z" fill="white" stroke="none"/>
            <path d="M54,48H38c-1.1,0-2-0.9-2-2V26c0-1.1,0.9-2,2-2h16c1.1,0,2,0.9,2,2v20C56,47.1,55.1,48,54,48z" fill="#DBEAFE"/>
            <rect x="38" y="30" width="16" height="16" fill="#F59E0B" stroke="none"/>
            <path d="M52,24v-4c0-1.1-0.9-2-2-2h-2" fill="none" stroke="#EF4444"/>
        </g>
    </svg>
);

export default SnackIcon;