
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts';
import type { StructuredFeatureImportance } from '../types';
import { Card } from './ui/Card';

interface StructuredExplanationProps {
    data: StructuredFeatureImportance[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-800 p-2 border border-gray-600 rounded text-sm">
                <p className="label">{`${label} : ${payload[0].payload.value}`}</p>
                <p className="intro">{`SHAP Value : ${payload[0].value.toFixed(4)}`}</p>
            </div>
        );
    }
    return null;
};

export const StructuredExplanation: React.FC<StructuredExplanationProps> = ({ data }) => {
    const sortedData = [...data].sort((a, b) => Math.abs(b.importance) - Math.abs(a.importance));
    
    return (
        <Card title="Structured Data Explanation (SHAP)">
            <div className="p-4 h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={sortedData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                    >
                        <XAxis type="number" stroke="#9ca3af" />
                        <YAxis dataKey="feature" type="category" stroke="#9ca3af" width={100} tick={{ fill: '#d1d5db' }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
                        <Legend wrapperStyle={{ color: '#d1d5db' }} />
                        <Bar name="Contribution to Admission" dataKey="importance" >
                           {sortedData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.importance > 0 ? '#f87171' /* red */ : '#4ade80' /* green */} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                 <div className="flex justify-center space-x-4 text-xs text-gray-400 mt-2">
                    <div className="flex items-center"><span className="w-3 h-3 bg-red-400 rounded-full mr-1.5"></span>Increases Admission Risk</div>
                    <div className="flex items-center"><span className="w-3 h-3 bg-green-400 rounded-full mr-1.5"></span>Decreases Admission Risk</div>
                </div>
            </div>
        </Card>
    );
};
