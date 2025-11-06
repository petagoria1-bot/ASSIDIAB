import { DoseCalculationInput, DoseCalculationOutput, Injection } from '../types.ts';

// Helper to round to 1 decimal place
const roundToOneDecimal = (num: number): number => {
    return Math.round(num * 10) / 10;
}

export function calculateDose(input: DoseCalculationInput): DoseCalculationOutput {
  const { gly_pre, moment, carbs_g, patient, lastCorrection } = input;
  let warning: string | undefined;

  // 1. Calculate meal dose
  let doseRepas_U = 0;
  if (carbs_g > 0 && patient.ratios[moment] > 0) {
    doseRepas_U = carbs_g / patient.ratios[moment];
  }

  // 2. Calculate correction dose
  let addCorr_U = 0;
  // Sort rules from lowest max to highest
  const sortedCorrections = [...patient.corrections].sort((a, b) => a.max - b.max);

  // A more direct implementation of the correction logic from the prompt:
  // Find the first rule where `gly_pre` is less than its `max` value.
  const applicableRule = sortedCorrections.find(rule => gly_pre <= rule.max);
  if (applicableRule) {
      addCorr_U = applicableRule.addU;
  } else {
      // If no rule matches (e.g., glycemia is higher than all max values), use the last rule.
      // Assuming the last rule has max: Infinity
      addCorr_U = sortedCorrections[sortedCorrections.length-1]?.addU || 0;
  }
  
  if (gly_pre <= patient.cibles.gly_min) {
     addCorr_U = 0; // No correction if hypo or low
  }


  // 3. Safety check for re-correction
  if (lastCorrection && addCorr_U > 0) {
    const lastCorrectionTime = new Date(lastCorrection.ts).getTime();
    const now = new Date().getTime();
    const hoursSince = (now - lastCorrectionTime) / (1000 * 60 * 60);
    if (hoursSince < patient.correctionDelayHours) {
      addCorr_U = 0;
      warning = `Correction non appliquée car une autre a été faite il y a moins de ${patient.correctionDelayHours} heures.`;
    }
  }

  // 4. Calculate total and round
  // The total dose is rounded to the nearest full unit.
  const doseTotale_raw = doseRepas_U + addCorr_U;
  const doseTotale = Math.round(doseTotale_raw);
  
  // Also round the components for display purposes
  const finalDoseRepas_U = roundToOneDecimal(doseRepas_U);
  
  return {
    doseRepas_U: finalDoseRepas_U,
    addCorr_U,
    doseTotale,
    warning
  };
}