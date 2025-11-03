import { z } from 'zod';

export const PatientSchema = z.object({
    age: z.number()
        .int()
        .min(0, 'Age must be a positive number')
        .max(120, 'Age must be less than 120'),
    
    gender: z.enum(['Male', 'Female', 'Other'], {
        errorMap: () => ({ message: 'Please select a valid gender' })
    }),

    race: z.enum(['White', 'Black', 'Asian', 'Hispanic', 'Other'], {
        errorMap: () => ({ message: 'Please select a valid race' })
    }),

    heartRate: z.number()
        .min(30, 'Heart rate must be at least 30 bpm')
        .max(250, 'Heart rate must be less than 250 bpm'),

    respiratoryRate: z.number()
        .min(4, 'Respiratory rate must be at least 4 breaths/min')
        .max(60, 'Respiratory rate must be less than 60 breaths/min'),

    systolicBP: z.number()
        .min(50, 'Systolic BP must be at least 50 mmHg')
        .max(250, 'Systolic BP must be less than 250 mmHg'),

    diastolicBP: z.number()
        .min(20, 'Diastolic BP must be at least 20 mmHg')
        .max(150, 'Diastolic BP must be less than 150 mmHg'),

    oxygenSaturation: z.number()
        .min(50, 'Oxygen saturation must be at least 50%')
        .max(100, 'Oxygen saturation cannot exceed 100%'),

    temperature: z.number()
        .min(30, 'Temperature must be at least 30°C')
        .max(45, 'Temperature must be less than 45°C'),

    triageNote: z.string()
        .min(10, 'Triage note must be at least 10 characters')
        .max(1000, 'Triage note must not exceed 1000 characters')
});

export type ValidatedPatientData = z.infer<typeof PatientSchema>;

export const validatePatientData = (data: unknown) => {
    return PatientSchema.parse(data);
};

export const validatePatientDataPartial = (data: unknown) => {
    return PatientSchema.partial().parse(data);
};