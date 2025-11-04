// FIX: Removed self-referential import that was causing name conflicts with local declarations.
// The file was attempting to import types defined within this same file.

export interface PatientData {
    age: number;
    gender: 'Male' | 'Female' | 'Other' | '';
    race: 'White' | 'Black' | 'Asian' | 'Hispanic' | 'Other' | '';
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
    importance: number;
    value: string | number;
}

export interface TextFeatureImportance {
    word: string;
    importance: number;
}

export interface FairnessMetric {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
}

export interface FairnessMetrics {
    Gender: Record<string, FairnessMetric>;
    Race: Record<string, FairnessMetric>;
}

export interface Counterfactual {
    feature: keyof PatientData;
    originalValue: string | number;
    suggestedValue: string | number;
    narrative: string;
}

export interface PredictionResult {
    admissionProbability: number;
    prediction: 'Admit' | 'Discharge';
    estimatedTimeToAdmission: string;
    suggestedWard: string;
    structuredExplanation: StructuredFeatureImportance[];
    textExplanation: TextFeatureImportance[];
    fairnessAudit: FairnessMetrics;
    counterfactuals: Counterfactual[];
}

export interface Bed {
    id: string;
    ward: string;
    room: number;
    bedNumber: number;
    status: 'Available' | 'Taken' | 'Cleaning';
}

export interface AdmissionTokenData {
    patientData: PatientData;
    predictionResult: PredictionResult;
    allocatedBed: Bed;
    patientId: string;
    admissionDate: string;
}
