import React, { useState, useMemo, useEffect } from 'react';
import type { PatientData, PredictionResult, Bed } from '../types';
import { mockBeds } from '../mockData';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface BedManagementProps {
    patientData: PatientData;
    predictionResult: PredictionResult;
    onBedSelected: (bed: Bed) => void;
    onBack: () => void;
}

const BedIcon: React.FC<{ status: Bed['status'] }> = ({ status }) => {
    const colorClass = {
        Available: 'text-green-400',
        Taken: 'text-red-400',
        Cleaning: 'text-yellow-400',
    }[status];
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${colorClass}`} viewBox="0 0 20 20" fill="currentColor">
            <path d="M18 6.5a.5.5 0 00-.5-.5h-15a.5.5 0 000 1H1V14a1 1 0 001 1h16a1 1 0 001-1V7.5h.5a.5.5 0 00.5-.5zM3 14V8h14v6H3zm1-4.5a.5.5 0 00.5.5h3a.5.5 0 000-1h-3a.5.5 0 00-.5.5z" />
        </svg>
    );
};

export const BedManagement: React.FC<BedManagementProps> = ({ predictionResult, onBedSelected, onBack }) => {
    const { suggestedWard } = predictionResult;
    
    const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
    const [selectedWard, setSelectedWard] = useState<string>(suggestedWard || 'All');
    
    useEffect(() => {
        // When the component loads, default the filter to the suggested ward if available
        setSelectedWard(suggestedWard || 'All');
    }, [suggestedWard]);

    const wards = useMemo(() => ['All', ...Array.from(new Set(mockBeds.map(b => b.ward)))], []);
    
    const filteredBeds = useMemo(() => {
        return selectedWard === 'All' ? mockBeds : mockBeds.filter(b => b.ward === selectedWard);
    }, [selectedWard]);
    
    const selectedBed = mockBeds.find(b => b.id === selectedBedId);

    const handleConfirm = () => {
        if (selectedBed) {
            onBedSelected(selectedBed);
        }
    };

    return (
        <Card title="Bed Allocation">
            <div className="p-6">
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Select a Ward and Bed</h3>
                        <p className="text-sm text-gray-400 mt-1">Patient requires admission. Please allocate an available bed.</p>
                    </div>
                    <div className="flex-shrink-0">
                         <Button onClick={onBack} >&larr; Back to Prediction</Button>
                    </div>
                </div>

                {suggestedWard && (
                    <div className="bg-cyan-900/50 border border-cyan-700 p-4 rounded-lg mb-6 text-center">
                        <p className="font-semibold text-cyan-300">
                            AI Suggestion: Admit to <strong className="text-white">{suggestedWard}</strong> ward.
                        </p>
                    </div>
                )}

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Ward</label>
                    <select
                        value={selectedWard}
                        onChange={(e) => {
                            setSelectedWard(e.target.value);
                            setSelectedBedId(null);
                        }}
                        className="w-full sm:w-64 bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-white p-2"
                    >
                        {wards.map(ward => (
                            <option key={ward} value={ward}>
                                {ward} {ward === suggestedWard && '⭐ (Recommended)'}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredBeds.map(bed => (
                        <button 
                            key={bed.id}
                            disabled={bed.status !== 'Available'}
                            onClick={() => setSelectedBedId(bed.id)}
                            className={`p-4 rounded-lg text-left transition-all duration-200
                                ${bed.status !== 'Available' ? 'bg-gray-700 opacity-50 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600 cursor-pointer'}
                                ${selectedBedId === bed.id ? 'ring-2 ring-cyan-500' : ''}
                            `}
                        >
                            <BedIcon status={bed.status} />
                            <p className="font-bold text-white mt-2">{bed.id}</p>
                            <p className="text-xs text-gray-400">{bed.status}</p>
                        </button>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-700 flex justify-end items-center gap-4">
                   {selectedBed && <p className="text-gray-300">Selected: <span className="font-semibold text-white">{selectedBed.id} ({selectedBed.ward})</span></p>}
                    <Button onClick={handleConfirm} disabled={!selectedBed}>
                        Confirm & Generate Admission Record
                    </Button>
                </div>
            </div>
        </Card>
    );
};
