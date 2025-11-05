import React from 'react';

interface NurturePlantAnimationProps {
  progress: number; // 0 to 1
  className?: string;
}

const NurturePlantAnimation: React.FC<NurturePlantAnimationProps> = ({ progress, className }) => {
  const sproutOpacity = progress >= 0 ? 1 : 0;
  const stemHeight = progress > 0.2 ? (progress - 0.2) / 0.8 * 60 : 0;
  const leaf1Opacity = progress > 0.3 ? (progress - 0.3) * 5 : 0;
  const leaf2Opacity = progress > 0.5 ? (progress - 0.5) * 5 : 0;
  const budOpacity = progress > 0.7 ? (progress - 0.7) * 5 : 0;
  const budScale = progress > 0.7 ? 0.8 + (progress - 0.7) * 0.66 : 0;
  const flowerOpacity = progress >= 1 ? 1 : 0;

  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Pot */}
      <path d="M25 90 H 75 L 80 70 H 20 Z" fill="#FF7E67"/>
      <rect x="22" y="65" width="56" height="8" rx="4" fill="#E57373"/>
      
      {/* Soil */}
      <ellipse cx="50" cy="70" rx="30" ry="5" fill="#795548"/>
      
      {/* Plant */}
      <g style={{ transition: 'all 0.8s cubic-bezier(0.25, 1, 0.5, 1)' }}>
        {/* Sprout */}
        <path d="M50 70 C 55 60, 45 60, 50 50" stroke="#A7F3D0" strokeWidth="6" strokeLinecap="round" fill="none" style={{ opacity: sproutOpacity, transition: 'opacity 0.5s' }}/>
        
        {/* Stem */}
        <line x1="50" y1="70" x2="50" y2={70 - stemHeight} stroke="#00A86B" strokeWidth="6" strokeLinecap="round" style={{ transition: 'all 0.8s cubic-bezier(0.6, -0.28, 0.735, 0.045)' }}/>
        
        {/* Leaves */}
        <path d="M50 50 C 30 50, 40 35, 50 35" stroke="#00A86B" strokeWidth="5" strokeLinecap="round" fill="#A7F3D0" style={{ opacity: leaf1Opacity, transformOrigin: '50px 50px', transform: 'scale(0.9)', transition: 'opacity 0.5s' }}/>
        <path d="M50 45 C 70 45, 60 30, 50 30" stroke="#00A86B" strokeWidth="5" strokeLinecap="round" fill="#A7F3D0" style={{ opacity: leaf2Opacity, transformOrigin: '50px 45px', transform: 'scale(0.9)', transition: 'opacity 0.5s' }}/>
        
        {/* Bud/Flower */}
        <g style={{ opacity: budOpacity, transform: `scale(${budScale})`, transformOrigin: '50px 15px', transition: 'all 0.5s' }}>
          <circle cx="50" cy="15" r="10" fill="#FCD34D" style={{ opacity: flowerOpacity, transition: 'opacity 0.5s 0.2s' }}/>
          <circle cx="50" cy="15" r="5" fill="#795548" style={{ opacity: flowerOpacity, transition: 'opacity 0.5s 0.3s' }}/>

          <path d="M50 15 C 40 5, 60 5, 50 15" fill="#FFFFFF" style={{ opacity: flowerOpacity, transformOrigin: '50px 15px', transition: 'all 0.5s 0.2s' }}/>
          <path d="M50 15 C 60 25, 40 25, 50 15" fill="#FFFFFF" style={{ opacity: flowerOpacity, transformOrigin: '50px 15px', transition: 'all 0.5s 0.2s' }}/>
          <path d="M50 15 C 40 25, 40 5, 50 15" fill="#FFFFFF" style={{ opacity: flowerOpacity, transformOrigin: '50px 15px', transition: 'all 0.5s 0.2s' }}/>
          <path d="M50 15 C 60 5, 60 25, 50 15" fill="#FFFFFF" style={{ opacity: flowerOpacity, transformOrigin: '50px 15px', transition: 'all 0.5s 0.2s' }}/>
           <circle cx="50" cy="15" r="10" fill="#FEE2E2" style={{ opacity: 1 - flowerOpacity, transition: 'opacity 0.5s' }}/>
        </g>
      </g>
    </svg>
  );
};

export default NurturePlantAnimation;