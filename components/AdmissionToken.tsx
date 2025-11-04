import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { AdmissionTokenData } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { HospitalMap } from './HospitalMap';

interface AdmissionTokenProps {
    tokenData: AdmissionTokenData;
    onDone: () => void;
}

const InfoRow: React.FC<{ label: string; value: string | number; className?: string }> = ({ label, value, className = '' }) => (
    <div className={`flex justify-between py-2 border-b border-gray-200 ${className}`}>
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <span className="text-sm font-semibold text-gray-800 text-right">{value}</span>
    </div>
);

export const AdmissionToken: React.FC<AdmissionTokenProps> = ({ tokenData, onDone }) => {
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const { patientData, predictionResult, allocatedBed, patientId, admissionDate } = tokenData;

    const createFormattedText = (): string => {
        return `
=================================
HOSPITAL ADMISSION RECORD
=================================
PATIENT INFORMATION
---------------------------------
Patient ID:   ${patientId}
Age:          ${patientData.age}
Gender:       ${patientData.gender}
Race:         ${patientData.race}

TRIAGE & PREDICTION
---------------------------------
Prediction:       ${predictionResult.prediction} (${(predictionResult.admissionProbability * 100).toFixed(1)}% Prob.)
Est. Time to Admit: ${predictionResult.estimatedTimeToAdmission}
Suggested Ward:   ${predictionResult.suggestedWard}
Triage Note:
${patientData.triageNote}

ADMISSION DETAILS
---------------------------------
Admitted To:  ${allocatedBed.ward}
Bed ID:       ${allocatedBed.id}
Date:         ${admissionDate}
=================================
        `.trim();
    };

    const handleCopyToClipboard = () => {
        const textToCopy = createFormattedText();
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopyStatus('copied');
            setTimeout(() => setCopyStatus('idle'), 2000);
        });
    };
    
    const handleDownloadPdf = async () => {
        setIsDownloading(true);
        const input = document.getElementById('admission-record');
        if (!input) {
            setIsDownloading(false);
            return;
        }

        try {
            const canvas = await html2canvas(input, {
                scale: 2,
                backgroundColor: '#f9fafb',
            });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;

            let imgWidth = pdfWidth - 20; 
            let imgHeight = imgWidth / ratio;
            
            if (imgHeight > pdfHeight - 20) {
                imgHeight = pdfHeight - 20;
                imgWidth = imgHeight * ratio;
            }

            const x = (pdfWidth - imgWidth) / 2;
            const y = (pdfHeight - imgHeight) / 2;

            pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
            pdf.save(`admission-record-${patientId}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Card title="Admission Record Generated">
            <div className="p-4 sm:p-6">
                <div id="admission-record" className="bg-gray-50 text-gray-900 p-4 sm:p-6 rounded-lg shadow-lg max-w-lg mx-auto font-mono">
                    <div className="text-center pb-2 border-b-2 border-gray-400">
                        <h1 className="text-xl font-bold">ED ADMISSION RECORD</h1>
                        <p className="text-xs">CONFIDENTIAL</p>
                    </div>
                    
                    <div className="my-4 space-y-2">
                        <h2 className="font-bold text-gray-600 text-sm">PATIENT DETAILS</h2>
                        <InfoRow label="Patient ID" value={patientId} />
                        <InfoRow label="Age" value={patientData.age} />
                        <InfoRow label="Gender" value={patientData.gender} />
                    </div>

                    <div className="my-4 space-y-2">
                         <h2 className="font-bold text-gray-600 text-sm">AI PREDICTION SUMMARY</h2>
                        <InfoRow label="Prediction" value={`${predictionResult.prediction} (${(predictionResult.admissionProbability * 100).toFixed(1)}% Prob.)`} />
                        <InfoRow label="Est. Time to Admit" value={predictionResult.estimatedTimeToAdmission} />
                        <InfoRow label="AI Suggested Ward" value={predictionResult.suggestedWard} className="bg-cyan-100"/>
                    </div>
                    
                    <div className="my-4 space-y-2">
                        <h2 className="font-bold text-gray-600 text-sm">ALLOCATION</h2>
                        <InfoRow label="Admitted To" value={allocatedBed.ward} />
                        <InfoRow label="Bed ID" value={allocatedBed.id} />
                        <InfoRow label="Admission Time" value={admissionDate} />
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-300">
                        <h2 className="font-bold text-gray-600 text-sm text-center mb-2">HOSPITAL MAP</h2>
                        <HospitalMap allocatedBed={allocatedBed} />
                    </div>
                </div>
                
                <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Button onClick={handleCopyToClipboard}>
                        {copyStatus === 'copied' ? 'Copied to EMR!' : 'Copy for EMR'}
                    </Button>
                    <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                        {isDownloading ? 'Downloading...' : 'Download PDF'}
                    </Button>
                    <Button onClick={onDone}>Finish & New Admission</Button>
                </div>
            </div>
        </Card>
    );
};
