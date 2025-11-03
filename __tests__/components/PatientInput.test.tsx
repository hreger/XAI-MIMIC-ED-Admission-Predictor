import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PatientInput } from '../../components/PatientInput';

describe('PatientInput', () => {
    const mockOnPredict = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render all form fields', () => {
        render(<PatientInput onPredict={mockOnPredict} isLoading={false} />);

        // Check demographic fields
        expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/race/i)).toBeInTheDocument();

        // Check vital signs fields
        expect(screen.getByLabelText(/heart rate/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/respiratory rate/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/systolic bp/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/diastolic bp/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/oxygen saturation/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/temperature/i)).toBeInTheDocument();

        // Check triage note field
        expect(screen.getByLabelText(/triage note/i)).toBeInTheDocument();
    });

    it('should populate fields with default values', () => {
        render(<PatientInput onPredict={mockOnPredict} isLoading={false} />);

        expect(screen.getByLabelText(/age/i)).toHaveValue(55);
        expect(screen.getByLabelText(/gender/i)).toHaveValue('Male');
        expect(screen.getByLabelText(/race/i)).toHaveValue('White');
        expect(screen.getByLabelText(/heart rate/i)).toHaveValue(110);
        expect(screen.getByLabelText(/respiratory rate/i)).toHaveValue(22);
        expect(screen.getByLabelText(/systolic bp/i)).toHaveValue(95);
        expect(screen.getByLabelText(/diastolic bp/i)).toHaveValue(60);
        expect(screen.getByLabelText(/oxygen saturation/i)).toHaveValue(94);
        expect(screen.getByLabelText(/temperature/i)).toHaveValue(38.5);
    });

    it('should validate required fields', async () => {
        render(<PatientInput onPredict={mockOnPredict} isLoading={false} />);

        // Clear required fields
        const ageInput = screen.getByLabelText(/age/i);
        await userEvent.clear(ageInput);

        // Submit form
        const submitButton = screen.getByText(/predict admission/i);
        await userEvent.click(submitButton);

        // Check for validation error
        await waitFor(() => {
            expect(screen.getByText(/age is required/i)).toBeInTheDocument();
        });

        expect(mockOnPredict).not.toHaveBeenCalled();
    });

    it('should validate numeric fields', async () => {
        render(<PatientInput onPredict={mockOnPredict} isLoading={false} />);

        // Enter invalid age
        const ageInput = screen.getByLabelText(/age/i);
        await userEvent.clear(ageInput);
        await userEvent.type(ageInput, '-1');

        // Submit form
        const submitButton = screen.getByText(/predict admission/i);
        await userEvent.click(submitButton);

        // Check for validation error
        await waitFor(() => {
            expect(screen.getByText(/age must be at least 0/i)).toBeInTheDocument();
        });

        expect(mockOnPredict).not.toHaveBeenCalled();
    });

    it('should submit valid form data', async () => {
        render(<PatientInput onPredict={mockOnPredict} isLoading={false} />);

        // Modify some fields
        await userEvent.type(screen.getByLabelText(/age/i), '60');
        await userEvent.selectOptions(screen.getByLabelText(/gender/i), 'Female');
        await userEvent.type(screen.getByLabelText(/heart rate/i), '80');

        // Submit form
        const submitButton = screen.getByText(/predict admission/i);
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnPredict).toHaveBeenCalledWith(expect.objectContaining({
                age: 60,
                gender: 'Female',
                heartRate: 80,
            }));
        });
    });

    it('should disable form submission when loading', () => {
        render(<PatientInput onPredict={mockOnPredict} isLoading={true} />);

        const submitButton = screen.getByText(/predict admission/i);
        expect(submitButton).toBeDisabled();

        const resetButton = screen.getByText(/reset/i);
        expect(resetButton).toBeDisabled();
    });

    it('should reset form to default values', async () => {
        render(<PatientInput onPredict={mockOnPredict} isLoading={false} />);

        // Modify some fields
        const ageInput = screen.getByLabelText(/age/i);
        await userEvent.clear(ageInput);
        await userEvent.type(ageInput, '60');

        const genderSelect = screen.getByLabelText(/gender/i);
        await userEvent.selectOptions(genderSelect, 'Female');

        // Click reset button
        const resetButton = screen.getByText(/reset/i);
        await userEvent.click(resetButton);

        // Check if fields are reset to default values
        expect(screen.getByLabelText(/age/i)).toHaveValue(55);
        expect(screen.getByLabelText(/gender/i)).toHaveValue('Male');
    });
});