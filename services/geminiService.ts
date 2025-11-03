
import { GoogleGenAI, Type } from "@google/genai";
import type { PatientData, PredictionResponse } from '../types';

// FIX: Correctly initialize the GoogleGenAI client using the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


const responseSchema = {
    type: Type.OBJECT,
    properties: {
        admissionProbability: { type: Type.NUMBER, description: "A value between 0 and 1." },
        prediction: { type: Type.STRING, enum: ["Admit", "Discharge"] },
        triageNote: { type: Type.STRING, description: "The original triage note provided." },
        structuredFeatureImportance: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    feature: { type: Type.STRING },
                    value: { type: Type.STRING }, // Use string to accommodate all values
                    importance: { type: Type.NUMBER, description: "SHAP value, can be positive or negative." },
                },
                required: ["feature", "value", "importance"],
            },
        },
        textFeatureImportance: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    word: { type: Type.STRING },
                    importance: { type: Type.NUMBER, description: "LIME value, can be positive or negative." },
                },
                required: ["word", "importance"],
            },
        },
        fairnessMetrics: {
            type: Type.OBJECT,
            properties: {
                Gender: {
                    type: Type.OBJECT,
                    properties: {
                        Male: {
                             type: Type.OBJECT, properties: {
                                accuracy: { type: Type.NUMBER },
                                precision: { type: Type.NUMBER },
                                recall: { type: Type.NUMBER },
                                f1_score: { type: Type.NUMBER },
                             }
                        },
                        Female: {
                             type: Type.OBJECT, properties: {
                                accuracy: { type: Type.NUMBER },
                                precision: { type: Type.NUMBER },
                                recall: { type: Type.NUMBER },
                                f1_score: { type: Type.NUMBER },
                             }
                        },
                    },
                },
                Race: {
                    type: Type.OBJECT,
                    properties: {
                        White: {
                            type: Type.OBJECT, properties: {
                                accuracy: { type: Type.NUMBER },
                                precision: { type: Type.NUMBER },
                                recall: { type: Type.NUMBER },
                                f1_score: { type: Type.NUMBER },
                            }
                        },
                        Black: {
                            type: Type.OBJECT, properties: {
                                accuracy: { type: Type.NUMBER },
                                precision: { type: Type.NUMBER },
                                recall: { type: Type.NUMBER },
                                f1_score: { type: Type.NUMBER },
                            }
                        },
                        Asian: {
                           type: Type.OBJECT, properties: {
                                accuracy: { type: Type.NUMBER },
                                precision: { type: Type.NUMBER },
                                recall: { type: Type.NUMBER },
                                f1_score: { type: Type.NUMBER },
                            }
                        },
                        Hispanic: {
                            type: Type.OBJECT, properties: {
                                accuracy: { type: Type.NUMBER },
                                precision: { type: Type.NUMBER },
                                recall: { type: Type.NUMBER },
                                f1_score: { type: Type.NUMBER },
                            }
                        },
                    },
                },
            },
        },
    },
    required: [
        "admissionProbability",
        "prediction",
        "triageNote",
        "structuredFeatureImportance",
        "textFeatureImportance",
        "fairnessMetrics",
    ],
};


export const getEDPrediction = async (patientData: PatientData): Promise<PredictionResponse> => {

    const systemInstruction = `You are a sophisticated, multimodal, explainable AI model (ClinicalBERT + XGBoost) designed to predict Emergency Department (ED) admission based on MIMIC-IV data.
    Your task is to analyze the provided structured data and unstructured triage note to make a prediction.
    You MUST provide explanations for your prediction in the form of SHAP values for structured features and LIME-style word importances for the text.
    You MUST also provide simulated fairness audit metrics for different demographic groups.
    The output MUST be a valid JSON object that strictly adheres to the provided schema. Do not include any markdown formatting like \`\`\`json.`;

    const prompt = `
    Analyze the following patient data and predict the likelihood of ED admission.

    **Structured Data:**
    - Age: ${patientData.age}
    - Gender: ${patientData.gender}
    - Race: ${patientData.race}
    - Heart Rate: ${patientData.heartRate} bpm
    - Respiratory Rate: ${patientData.respiratoryRate} breaths/min
    - Systolic BP: ${patientData.systolicBP} mmHg
    - Diastolic BP: ${patientData.diastolicBP} mmHg
    - O2 Saturation: ${patientData.oxygenSaturation}%
    - Temperature: ${patientData.temperature}°C

    **Unstructured Triage Note:**
    "${patientData.triageNote}"

    Based on this information, generate a complete JSON response including:
    1.  'admissionProbability': A float between 0 and 1.
    2.  'prediction': 'Admit' or 'Discharge'.
    3.  'triageNote': The original triage note.
    4.  'structuredFeatureImportance': An array of objects with SHAP values. High absolute values are more important. Positive values push towards admission, negative towards discharge.
    5.  'textFeatureImportance': An array of objects with LIME values for key words in the triage note. Positive values push towards admission, negative towards discharge.
    6.  'fairnessMetrics': A nested object with simulated fairness metrics (accuracy, precision, recall, f1_score) for Gender and Race subgroups.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
                temperature: 0.5,
            },
        });

        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText) as PredictionResponse;
        
        // Gemini might not return the note, so we ensure it's there.
        parsedData.triageNote = patientData.triageNote;
        
        return parsedData;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get prediction from the AI model. The model may be overloaded or the input is invalid.");
    }
};
