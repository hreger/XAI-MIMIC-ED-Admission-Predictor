
import React, { useState } from 'react';
import type { PatientData } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface PatientInputProps {
    onPredict: (data: PatientData) => void;
    isLoading: boolean;
}

const defaultPatient: PatientData = {
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
    const [patientData, setPatientData] = useState<PatientData>(defaultPatient);

    const handleChange = <K extends keyof PatientData>(key: K, value: PatientData[K]) => {
        setPatientData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onPredict(patientData);
    };

    return (
        <Card title="Patient Information" isSticky={true}>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Age" type="number" value={patientData.age} onChange={e => handleChange('age', parseInt(e.target.value, 10))} />
                    <Select label="Gender" value={patientData.gender} onChange={e => handleChange('gender', e.target.value as PatientData['gender'])}>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                    </Select>
                </div>
                <Select label="Race" value={patientData.race} onChange={e => handleChange('race', e.target.value as PatientData['race'])}>
                    <option>White</option>
                    <option>Black</option>
                    <option>Asian</option>
                    <option>Hispanic</option>
                    <option>Other</option>
                </Select>
                <h3 className="text-lg font-semibold text-cyan-400 pt-2 border-b border-gray-600 pb-2">Vitals</h3>
                <div className="grid grid-cols-2 gap-4">
                    <Input label="HR (bpm)" type="number" value={patientData.heartRate} onChange={e => handleChange('heartRate', parseInt(e.target.value, 10))} />
                    <Input label="RR (breaths/min)" type="number" value={patientData.respiratoryRate} onChange={e => handleChange('respiratoryRate', parseInt(e.target.value, 10))} />
                    <Input label="SBP (mmHg)" type="number" value={patientData.systolicBP} onChange={e => handleChange('systolicBP', parseInt(e.target.value, 10))} />
                    <Input label="DBP (mmHg)" type="number" value={patientData.diastolicBP} onChange={e => handleChange('diastolicBP', parseInt(e.target.value, 10))} />
                    <Input label="O2 Sat (%)" type="number" value={patientData.oxygenSaturation} onChange={e => handleChange('oxygenSaturation', parseInt(e.target.value, 10))} />
                    <Input label="Temp (°C)" type="number" step="0.1" value={patientData.temperature} onChange={e => handleChange('temperature', parseFloat(e.target.value))} />
                </div>
                <h3 className="text-lg font-semibold text-cyan-400 pt-2 border-b border-gray-600 pb-2">Triage Note</h3>
                <Textarea label="Triage Note" rows={6} value={patientData.triageNote} onChange={e => handleChange('triageNote', e.target.value)} />
                <div className="pt-4">
                    <Button type="submit" disabled={isLoading} fullWidth>
                        {isLoading ? 'Analyzing...' : 'Predict Admission'}
                    </Button>
                </div>
            </form>
        </Card>
    );
};

// Helper sub-components for form fields
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300">{label}</label>
        <input {...props} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-white p-2" />
    </div>
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }> = ({ label, children, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300">{label}</label>
        <select {...props} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-white p-2">
            {children}
        </select>
    </div>
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300">{label}</label>
        <textarea {...props} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-white p-2" />
    </div>
);
