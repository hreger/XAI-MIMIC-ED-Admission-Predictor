import { GoogleGenAI, Type } from "@google/genai";
import type { PatientData, PredictionResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fairnessMetricSchema = {
    type: Type.OBJECT,
    properties: {
        accuracy: { type: Type.NUMBER },
        precision: { type: Type.NUMBER },
        recall: { type: Type.NUMBER },
        f1_score: { type: Type.NUMBER },
    },
    required: ["accuracy", "precision", "recall", "f1_score"],
};

const predictionSchema = {
    type: Type.OBJECT,
    properties: {
        admissionProbability: {
            type: Type.NUMBER,
            description: "A value between 0.0 and 1.0 representing the probability of hospital admission.",
        },
        prediction: {
            type: Type.STRING,
            enum: ["Admit", "Discharge"],
            description: "The binary prediction for the patient.",
        },
        estimatedTimeToAdmission: {
            type: Type.STRING,
            description: "An estimated time for admission if prediction is 'Admit', e.g., '60-120 minutes'. Should be an empty string if prediction is 'Discharge'.",
        },
        suggestedWard: {
            type: Type.STRING,
            description: "The suggested hospital ward for admission (e.g., 'Cardiology', 'Medical', 'ICU') if the prediction is 'Admit'. Should be an empty string if prediction is 'Discharge'."
        },
        structuredExplanation: {
            type: Type.ARRAY,
            description: "SHAP-like explanation for structured data features.",
            items: {
                type: Type.OBJECT,
                properties: {
                    feature: { type: Type.STRING, description: "The name of the patient data feature (e.g., 'heartRate')." },
                    value: { type: Type.STRING, description: "The value of the feature for the current patient." },
                    importance: { type: Type.NUMBER, description: "The SHAP value indicating the feature's contribution to the prediction. Positive values push the prediction towards admission, negative values push it towards discharge." },
                },
                required: ["feature", "value", "importance"],
            },
        },
        textExplanation: {
            type: Type.ARRAY,
            description: "LIME-like explanation for the triage note. Identifies words that influence the prediction.",
            items: {
                type: Type.OBJECT,
                properties: {
                    word: { type: Type.STRING, description: "A word or token from the triage note." },
                    importance: { type: Type.NUMBER, description: "A value indicating the word's contribution. Positive values push towards admission, negative towards discharge." },
                },
                required: ["word", "importance"],
            },
        },
        fairnessAudit: {
            type: Type.OBJECT,
            description: "A fairness audit of the model's performance across demographic subgroups.",
            properties: {
                Gender: {
                    type: Type.OBJECT,
                    properties: {
                        Male: fairnessMetricSchema,
                        Female: fairnessMetricSchema,
                        Other: fairnessMetricSchema,
                    },
                },
                Race: {
                    type: Type.OBJECT,
                    properties: {
                        White: fairnessMetricSchema,
                        Black: fairnessMetricSchema,
                        Asian: fairnessMetricSchema,
                        Hispanic: fairnessMetricSchema,
                        Other: fairnessMetricSchema,
                    },
                },
            },
        },
        counterfactuals: {
            type: Type.ARRAY,
            description: "Counterfactual explanations suggesting minimal changes to flip the prediction to 'Discharge'. Should be an empty array if prediction is already 'Discharge'.",
            items: {
                type: Type.OBJECT,
                properties: {
                    feature: { type: Type.STRING, description: "The feature to change (must be a key from PatientData)." },
                    originalValue: { type: Type.STRING, description: "The original value of the feature." },
                    suggestedValue: { type: Type.STRING, description: "The suggested new value for the feature." },
                    narrative: { type: Type.STRING, description: "A brief narrative explaining why this change is suggested." },
                },
                required: ["feature", "originalValue", "suggestedValue", "narrative"],
            },
        },
    },
    required: [
        "admissionProbability",
        "prediction",
        "estimatedTimeToAdmission",
        "suggestedWard",
        "structuredExplanation",
        "textExplanation",
        "fairnessAudit",
        "counterfactuals",
    ],
};

const createPrompt = (patientData: PatientData): string => {
    return `
      Analyze the following Emergency Department patient data to predict the likelihood of hospital admission.
      Provide a comprehensive analysis in JSON format according to the provided schema.

      Patient Data:
      - Age: ${patientData.age}
      - Gender: ${patientData.gender}
      - Race: ${patientData.race}
      - Heart Rate: ${patientData.heartRate} bpm
      - Respiratory Rate: ${patientData.respiratoryRate} breaths/min
      - Systolic BP: ${patientData.systolicBP} mmHg
      - Diastolic BP: ${patientData.diastolicBP} mmHg
      - O2 Saturation: ${patientData.oxygenSaturation}%
      - Temperature: ${patientData.temperature}°C
      - Triage Note: "${patientData.triageNote}"

      Instructions:
      1.  **Prediction**: Calculate an 'admissionProbability' (0.0-1.0) and make a binary 'prediction' ('Admit' or 'Discharge').
      2.  **Ward Suggestion**: If predicting 'Admit', suggest the most appropriate 'suggestedWard' (e.g., Cardiology, Medical, Surgical, ICU).
      3.  **Explanations**:
          -   **Structured (SHAP-like)**: For each structured feature, provide its value and an 'importance' score. Positive scores increase admission probability.
          -   **Text (LIME-like)**: For the triage note, identify key words and provide an 'importance' score for each.
      4.  **Fairness Audit**: Simulate fairness metrics (accuracy, precision, recall, F1-score) for the model's performance across Gender and Race subgroups.
      5.  **Counterfactuals**: If the prediction is 'Admit', suggest 2-3 minimal changes to the patient's data that could flip the prediction to 'Discharge'. Provide a short 'narrative' for each. If 'Discharge', return an empty array.
    `;
};

export const getAdmissionPrediction = async (patientData: PatientData): Promise<PredictionResult> => {
    try {
        const prompt = createPrompt(patientData);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: predictionSchema,
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        if (!result.prediction || !result.structuredExplanation) {
            throw new Error("Invalid response structure from API.");
        }

        return result as PredictionResult;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get prediction from the AI model. Please check the console for more details.");
    }
};
