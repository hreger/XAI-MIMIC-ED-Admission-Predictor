import type { Bed } from './types';

export const mockBeds: Bed[] = [
    // Medical Ward
    { id: 'MED-101-1', ward: 'Medical', room: 101, bedNumber: 1, status: 'Available' },
    { id: 'MED-101-2', ward: 'Medical', room: 101, bedNumber: 2, status: 'Taken' },
    { id: 'MED-102-1', ward: 'Medical', room: 102, bedNumber: 1, status: 'Available' },
    { id: 'MED-102-2', ward: 'Medical', room: 102, bedNumber: 2, status: 'Available' },
    { id: 'MED-103-1', ward: 'Medical', room: 103, bedNumber: 1, status: 'Taken' },
    
    // Surgical Ward
    { id: 'SUR-201-1', ward: 'Surgical', room: 201, bedNumber: 1, status: 'Available' },
    { id: 'SUR-201-2', ward: 'Surgical', room: 201, bedNumber: 2, status: 'Available' },
    { id: 'SUR-202-1', ward: 'Surgical', room: 202, bedNumber: 1, status: 'Taken' },
    { id: 'SUR-202-2', ward: 'Surgical', room: 202, bedNumber: 2, status: 'Available' },

    // Cardiology Ward
    { id: 'CAR-301-1', ward: 'Cardiology', room: 301, bedNumber: 1, status: 'Taken' },
    { id: 'CAR-301-2', ward: 'Cardiology', room: 301, bedNumber: 2, status: 'Available' },
    { id: 'CAR-302-1', ward: 'Cardiology', room: 302, bedNumber: 1, status: 'Available' },

    // ICU
    { id: 'ICU-401-1', ward: 'ICU', room: 401, bedNumber: 1, status: 'Available' },
    { id: 'ICU-401-2', ward: 'ICU', room: 401, bedNumber: 2, status: 'Taken' },
];
