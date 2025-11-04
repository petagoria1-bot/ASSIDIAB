// Conversion factor from g/L to mmol/L for glucose
// 1 g/L = 1000 mg/dL. Molar mass of glucose is ~180.16 g/mol.
// (1000 mg/dL) / (18.016 mg/mmol) = 55.5 mmol/L.
// For 1 g/L: (1 g/L) / (180.16 g/mol) * 1000 = 5.55 mmol/L.
export const G_L_TO_MMOL_L = 5.55;

/**
 * Converts a glucose value from g/L to mmol/L and rounds to one decimal place.
 * @param gl - Glucose value in g/L.
 * @returns Glucose value in mmol/L, or 0 if input is invalid.
 */
export const toMmolL = (gl: number | undefined | null): number => {
    if (gl === undefined || gl === null || isNaN(gl)) return 0;
    return Math.round((gl * G_L_TO_MMOL_L) * 10) / 10;
};

/**
 * Converts a glucose value from mmol/L to g/L.
 * @param mmolL - Glucose value in mmol/L.
 * @returns Glucose value in g/L, or 0 if input is invalid.
 */
export const toGL = (mmolL: number | undefined | null): number => {
    if (mmolL === undefined || mmolL === null || isNaN(mmolL)) return 0;
    return mmolL / G_L_TO_MMOL_L;
};
