import React, { useMemo } from 'react';
// FIX: Changed import to be a relative path and added file extension for proper module resolution.
import useTranslations from '../hooks/useTranslations.ts';
import { Food } from '../types.ts';

interface CarbIndicatorProps {
    carbs_per_100g: number;
    unit: 'g' | 'ml';
}

type CarbLevel = 'low' | 'medium' | 'high';

const getCarbLevel = (carbs: number): CarbLevel => {
    if (carbs <= 10) return 'low';
    if (carbs <= 25) return 'medium';
    return 'high';
};

const CarbIndicator: React.FC<CarbIndicatorProps> = ({ carbs_per_100g, unit }) => {
    const t = useTranslations();
    const level = useMemo(() => getCarbLevel(carbs_per_100g), [carbs_per_100g]);
    
    const styles = {
        low: {
            gradient: 'from-carb-low to-carb-low-dark',
            borderColor: 'border-carb-low-dark',
            shadowColor: 'shadow-carb-low-dark',
            text: t.carbIndicator_level_low,
        },
        medium: {
            gradient: 'from-carb-medium to-carb-medium-dark',
            borderColor: 'border-carb-medium-dark',
            shadowColor: 'shadow-carb-medium-dark',
            text: t.carbIndicator_level_medium,
        },
        high: {
            gradient: 'from-carb-high to-carb-high-dark',
            borderColor: 'border-carb-high-dark',
            shadowColor: 'shadow-carb-high-dark',
            text: t.carbIndicator_level_high,
        }
    };
    
    const currentStyle = styles[level];
    
    const borderStyle = {
        boxShadow: `0 0 0 1px white, 0 0 0 3px var(--tw-shadow-color)`
    };

    return (
        <div
          className={`p-3 rounded-xl text-white bg-gradient-to-br ${currentStyle.gradient} ${currentStyle.shadowColor} transition-all`}
          style={borderStyle}
        >
          <div className="text-center">
            <p className="font-display font-bold text-3xl tracking-tight">{carbs_per_100g.toFixed(0)}g</p>
            <p className="text-xs opacity-80 -mt-1">{t.foodLibrary_per100(unit)}</p>
            <p className={`mt-1 text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 inline-block`}>
                {currentStyle.text}
            </p>
          </div>
        </div>
    );
};

export default CarbIndicator;