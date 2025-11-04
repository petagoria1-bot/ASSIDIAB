import React, { useMemo } from 'react';

type CarbLevel = 'low' | 'medium' | 'high';

const getCarbLevel = (carbs: number): CarbLevel => {
    if (carbs <= 15) return 'low';
    if (carbs <= 40) return 'medium';
    return 'high';
};

interface MiniCarbIndicatorProps {
    carbs_g: number;
}

const MiniCarbIndicator: React.FC<MiniCarbIndicatorProps> = ({ carbs_g }) => {
    const level = useMemo(() => getCarbLevel(carbs_g), [carbs_g]);
    
    const styles = {
        low: 'bg-gradient-to-br from-carb-low to-carb-low-dark text-white',
        medium: 'bg-gradient-to-br from-carb-medium to-carb-medium-dark text-white',
        high: 'bg-gradient-to-br from-carb-high to-carb-high-dark text-white',
    };
    
    const currentStyle = styles[level];
    
    return (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${currentStyle} shadow-sm flex-shrink-0`}>
           {carbs_g.toFixed(0)}g
        </div>
    );
};

export default MiniCarbIndicator;