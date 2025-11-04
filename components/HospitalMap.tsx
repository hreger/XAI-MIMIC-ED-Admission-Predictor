import React from 'react';
import type { Bed } from '../types';

interface HospitalMapProps {
    allocatedBed: Bed;
}

// Define the layout of our simple hospital map
const wards = {
    Medical: { x: 10, y: 10, width: 130, height: 80 },
    Surgical: { x: 150, y: 10, width: 130, height: 80 },
    Cardiology: { x: 10, y: 100, width: 130, height: 80 },
    ICU: { x: 150, y: 100, width: 130, height: 80 },
};

// Define room positions within each ward (relative to ward x/y)
const roomPositions: Record<string, { [key: number]: { rx: number; ry: number } }> = {
    Medical: { 101: { rx: 20, ry: 40 }, 102: { rx: 65, ry: 40 }, 103: { rx: 110, ry: 40 } },
    Surgical: { 201: { rx: 20, ry: 40 }, 202: { rx: 65, ry: 40 } },
    Cardiology: { 301: { rx: 20, ry: 40 }, 302: { rx: 65, ry: 40 } },
    ICU: { 401: { rx: 20, ry: 40 } },
};

export const HospitalMap: React.FC<HospitalMapProps> = ({ allocatedBed }) => {
    const { ward, room } = allocatedBed;
    const targetWard = wards[ward as keyof typeof wards];
    const targetRoomPos = roomPositions[ward]?.[room];
    const patientLocation = targetWard && targetRoomPos ? {
        cx: targetWard.x + targetRoomPos.rx,
        cy: targetWard.y + targetRoomPos.ry
    } : null;

    return (
        <div className="bg-gray-100 p-2 rounded-md">
            <svg viewBox="0 0 290 210" className="w-full h-auto">
                <defs>
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.2" />
                    </filter>
                </defs>

                {/* Draw all wards */}
                {Object.entries(wards).map(([wardName, pos]) => (
                    <g key={wardName}>
                        <rect
                            x={pos.x}
                            y={pos.y}
                            width={pos.width}
                            height={pos.height}
                            rx="5"
                            fill={wardName === ward ? '#0891b2' : '#d1d5db'} // Highlight active ward
                            stroke={wardName === ward ? '#06b6d4' : '#9ca3af'}
                            strokeWidth="1"
                            filter="url(#shadow)"
                        />
                        <text
                            x={pos.x + pos.width / 2}
                            y={pos.y + 20}
                            textAnchor="middle"
                            fontSize="14"
                            fontWeight="bold"
                            fill={wardName === ward ? '#ffffff' : '#4b5563'}
                        >
                            {wardName}
                        </text>
                    </g>
                ))}

                {/* Patient Location Marker */}
                {patientLocation && (
                    <g>
                         <circle
                            cx={patientLocation.cx}
                            cy={patientLocation.cy}
                            r="10"
                            fill="white"
                            stroke="#06b6d4"
                            strokeWidth="2"
                        >
                            <animate 
                                attributeName="r"
                                from="10"
                                to="15"
                                dur="1.5s"
                                begin="0s"
                                repeatCount="indefinite"
                            />
                            <animate 
                                attributeName="opacity"
                                from="1"
                                to="0"
                                dur="1.5s"
                                begin="0s"
                                repeatCount="indefinite"
                            />
                        </circle>
                        <circle
                            cx={patientLocation.cx}
                            cy={patientLocation.cy}
                            r="6"
                            fill="#06b6d4"
                        />
                        <text
                            x={patientLocation.cx}
                            y={patientLocation.cy - 18}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="bold"
                            fill="#0e7490"
                        >
                            Room {room}
                        </text>
                    </g>
                )}

                 {/* Entrance */}
                <text x="145" y="205" textAnchor="middle" fontSize="12" fill="#4b5563">
                    ↓ Main Entrance / ED
                </text>
            </svg>
        </div>
    );
};
