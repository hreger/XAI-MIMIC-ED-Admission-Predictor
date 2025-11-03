
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { PatientData } from '../types';
import { PatientSchema, type ValidatedPatientData } from '../schemas/patientSchema';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface PatientInputProps {
    onPredict: (data: ValidatedPatientData) => void;
    isLoading: boolean;
}

const defaultValues: PatientData = {
    age: 55,
    gender: 'Male',
    race: 'White',
    heartRate: 110,
    respiratoryRate: 22,
    systolicBP: 95,
    diastolicBP: 60,
    oxygenSaturation: 94,
    temperature: 38.5,
    triageNote: '55 y/o male presents with sudden onset of severe chest pain radiating to his left arm. Patient is diaphoretic and short of breath. Reports feeling of "impending doom". History of hypertension.',
};

export const PatientInput: React.FC<PatientInputProps> = ({ onPredict, isLoading }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ValidatedPatientData>({
        resolver: zodResolver(PatientSchema),
        defaultValues,
    });

    const onSubmit = handleSubmit((data) => {
        onPredict(data);
    });

    return (
        <Card title="Patient Information" isSticky={true}>
            <form onSubmit={onSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                            Age
                        </label>
                        <input
                            type="number"
                            {...register('age', { valueAsNumber: true })}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        />
                        {errors.age && (
                            <p className="text-red-400 text-sm">{errors.age.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                            Gender
                        </label>
                        <select
                            {...register('gender')}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors.gender && (
                            <p className="text-red-400 text-sm">{errors.gender.message}</p>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        Race
                    </label>
                    <select
                        {...register('race')}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    >
                        <option value="White">White</option>
                        <option value="Black">Black</option>
                        <option value="Asian">Asian</option>
                        <option value="Hispanic">Hispanic</option>
                        <option value="Other">Other</option>
                    </select>
                    {errors.race && (
                        <p className="text-red-400 text-sm">{errors.race.message}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {[
                        { key: 'heartRate', label: 'Heart Rate (bpm)' },
                        { key: 'respiratoryRate', label: 'Respiratory Rate (breaths/min)' },
                        { key: 'systolicBP', label: 'Systolic BP (mmHg)' },
                        { key: 'diastolicBP', label: 'Diastolic BP (mmHg)' },
                        { key: 'oxygenSaturation', label: 'Oxygen Saturation (%)' },
                        { key: 'temperature', label: 'Temperature (°C)' },
                    ].map(({ key, label }) => (
                        <div key={key} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">
                                {label}
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                {...register(key as keyof ValidatedPatientData, {
                                    valueAsNumber: true,
                                })}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            />
                            {errors[key as keyof ValidatedPatientData] && (
                                <p className="text-red-400 text-sm">
                                    {errors[key as keyof ValidatedPatientData]?.message}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                        Triage Note
                    </label>
                    <textarea
                        {...register('triageNote')}
                        rows={4}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                    {errors.triageNote && (
                        <p className="text-red-400 text-sm">{errors.triageNote.message}</p>
                    )}
                </div>

                <div className="flex justify-between">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => reset(defaultValues)}
                        disabled={isLoading}
                    >
                        Reset
                    </Button>
                    <Button type="submit" isLoading={isLoading}>
                        Predict Admission
                    </Button>
                </div>
            </form>
        </Card>
    );
};
