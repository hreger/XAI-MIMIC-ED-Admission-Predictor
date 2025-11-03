
import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
// FIX: Import FairnessMetric to explicitly type the metrics object, resolving a type inference issue.
import type { FairnessMetrics, FairnessMetric } from '../types';
import { Card } from './ui/Card';

interface FairnessAuditProps {
    data: FairnessMetrics;
}

type GroupType = 'Gender' | 'Race';

export const FairnessAudit: React.FC<FairnessAuditProps> = ({ data }) => {
    const [selectedGroup, setSelectedGroup] = useState<GroupType>('Gender');

    // FIX: Add explicit type annotation to the map callback parameter to ensure `metrics` is correctly typed as an object.
    const chartData = Object.entries(data[selectedGroup] || {}).map(([subgroup, metrics]: [string, FairnessMetric]) => ({
        name: subgroup,
        ...metrics,
    }));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-800 p-3 border border-gray-600 rounded text-sm shadow-lg">
                    <p className="label font-bold text-white mb-2">{label}</p>
                    {payload.map((p: any, index: number) => (
                         <p key={index} style={{ color: p.color }}>{`${p.name}: ${(p.value * 100).toFixed(1)}%`}</p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <Card title="Fairness Audit">
            <div className="p-6">
                <div className="flex justify-center mb-4">
                    <div className="bg-gray-700 rounded-lg p-1 flex space-x-1">
                        <button 
                            onClick={() => setSelectedGroup('Gender')}
                            className={`px-4 py-1 text-sm font-medium rounded-md ${selectedGroup === 'Gender' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                        >
                            Gender
                        </button>
                        <button 
                            onClick={() => setSelectedGroup('Race')}
                            className={`px-4 py-1 text-sm font-medium rounded-md ${selectedGroup === 'Race' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                        >
                            Race
                        </button>
                    </div>
                </div>

                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                            <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#d1d5db' }} />
                            <YAxis stroke="#9ca3af" tick={{ fill: '#d1d5db' }} tickFormatter={(tick) => `${(tick * 100).toFixed(0)}%`}/>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ color: '#d1d5db', paddingTop: '15px' }} />
                            <Bar dataKey="accuracy" fill="#38bdf8" />
                            <Bar dataKey="precision" fill="#4ade80" />
                            <Bar dataKey="recall" fill="#facc15" />
                            <Bar dataKey="f1_score" name="F1 Score" fill="#f87171" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Card>
    );
};
