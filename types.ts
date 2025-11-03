
export interface PatientData {
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    race: 'White' | 'Black' | 'Asian' | 'Hispanic' | 'Other';
    heartRate: number;
    respiratoryRate: number;
    systolicBP: number;
    diastolicBP: number;
    oxygenSaturation: number;
    temperature: number;
    triageNote: string;
}

export interface StructuredFeatureImportance {
    feature: string;
    value: number | string;
    importance: number; // SHAP value
}

export interface TextFeatureImportance {
    word: string;
    importance: number; // LIME value
}

export interface FairnessMetric {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
}

export interface FairnessMetrics {
    [group: string]: {
        [subgroup: string]: FairnessMetric;
    };
}

export interface PredictionResponse {
    admissionProbability: number;
    prediction: 'Admit' | 'Discharge';
    triageNote: string;
    structuredFeatureImportance: StructuredFeatureImportance[];
    textFeatureImportance: TextFeatureImportance[];
    fairnessMetrics: FairnessMetrics;
}
