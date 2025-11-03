
import React from 'react';
import type { TextFeatureImportance } from '../types';
import { Card } from './ui/Card';

interface TextExplanationProps {
    note: string;
    explanation: TextFeatureImportance[];
}

export const TextExplanation: React.FC<TextExplanationProps> = ({ note, explanation }) => {
    
    const maxImportance = Math.max(...explanation.map(item => Math.abs(item.importance)), 0.001);

    const getWordColor = (word: string, isPunctuation: boolean): React.CSSProperties => {
        if (isPunctuation) return {};
        
        const expl = explanation.find(e => e.word.toLowerCase() === word.toLowerCase());
        if (!expl) return {};

        const opacity = Math.min(Math.abs(expl.importance) / maxImportance * 2, 1);
        const color = expl.importance > 0 ? `rgba(248, 113, 113, ${opacity})` : `rgba(74, 222, 128, ${opacity})`;

        return {
            backgroundColor: color,
            padding: '2px 0px',
            borderRadius: '3px',
            display: 'inline',
        };
    };

    const wordsAndPunctuation = note.split(/(\s+|[.,;!?])/).filter(Boolean);

    return (
        <Card title="Triage Note Explanation (LIME)">
            <div className="p-6 text-gray-300 leading-relaxed text-left">
                {wordsAndPunctuation.map((token, index) => {
                     const isPunctuation = /[.,;!?]/.test(token);
                     return (
                        <span key={index} style={getWordColor(token, isPunctuation)}>
                            {token}
                        </span>
                     );
                })}
            </div>
        </Card>
    );
};
