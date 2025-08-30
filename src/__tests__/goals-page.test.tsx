/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GoalsPage from '@/app/goals/page';
import type { Goal } from '@/lib/types';

const toastMock = jest.fn();
const loggerErrorMock = jest.fn();

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastMock }),
}));

jest.mock('@/lib/logger', () => ({
  logger: { error: (...args: unknown[]) => loggerErrorMock(...args) },
}));

jest.mock('@/lib/firebase', () => ({ db: {}, initFirebase: jest.fn() }));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
}));

jest.mock('@/components/goals/add-goal-dialog', () => ({
  AddGoalDialog: ({ onSave }: { onSave: (goal: Goal) => void }) => (
    <button onClick={() => onSave({
      id: '',
      name: 'Test',
      targetAmount: 100,
      currentAmount: 0,
      deadline: '2024-01-01',
      importance: 1,
    })}>Add Goal</button>
  ),
}));

jest.mock('@/components/goals/goal-card', () => ({
  GoalCard: ({ goal, onDelete }: { goal: Goal; onDelete: (id: string) => void }) => (
    <div>
      <span>{goal.name}</span>
      <button onClick={() => onDelete(goal.id)}>Delete</button>
    </div>
  ),
}));

import { getDocs, addDoc, deleteDoc } from 'firebase/firestore';

describe('GoalsPage error handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows toast when fetching goals fails', async () => {
    (getDocs as jest.Mock).mockRejectedValue(new Error('fetch error'));
    render(<GoalsPage />);
    await waitFor(() => expect(loggerErrorMock).toHaveBeenCalled());
    expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ title: 'Failed to load goals' }));
    await screen.findByText(/failed to load goals/i);
  });

  it('shows toast when saving a goal fails', async () => {
    (getDocs as jest.Mock).mockResolvedValue({ docs: [] });
    (addDoc as jest.Mock).mockRejectedValue(new Error('save error'));
    render(<GoalsPage />);
    await waitFor(() => expect(screen.getByText('Add Goal')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Add Goal'));
    await waitFor(() => expect(loggerErrorMock).toHaveBeenCalledWith('Error saving goal:', expect.any(Error)));
    expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ title: 'Failed to save goal' }));
  });

  it('shows toast when deleting a goal fails', async () => {
    const goalData = { name: 'Goal', targetAmount: 100, currentAmount: 0, deadline: '2024-01-01', importance: 1 };
    (getDocs as jest.Mock).mockResolvedValue({ docs: [{ id: '1', data: () => goalData }] });
    (deleteDoc as jest.Mock).mockRejectedValue(new Error('delete error'));
    render(<GoalsPage />);
    fireEvent.click(await screen.findByText('Delete'));
    await waitFor(() => expect(loggerErrorMock).toHaveBeenCalledWith('Error deleting goal:', expect.any(Error)));
    expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ title: 'Failed to delete goal' }));
  });
});

