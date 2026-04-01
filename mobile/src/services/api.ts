import { Expense } from '../types';

// Change this to your machine's IP when testing on physical device
// For simulator: http://localhost:3000
// For physical device: http://YOUR_IP:3000 (e.g., http://192.168.1.5:3000)
const BASE_URL = 'http://192.168.1.105:3000';

const TIMEOUT_MS = 10000;

function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}

export async function addExpense(input: string): Promise<Expense> {
  const response = await fetchWithTimeout(`${BASE_URL}/api/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to add expense');
  }

  return data.expense;
}

export async function getExpenses(): Promise<Expense[]> {
  const response = await fetchWithTimeout(`${BASE_URL}/api/expenses`);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch expenses');
  }

  return data.expenses;
}

export async function deleteExpense(id: number): Promise<void> {
  const response = await fetchWithTimeout(`${BASE_URL}/api/expenses/${id}`, {
    method: 'DELETE',
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to delete expense');
  }
}
