import { Router, Request, Response } from 'express';
import { parseExpense } from '../services/aiService';
import { createExpense, getAllExpenses, deleteExpense } from '../database/db';

const router = Router();

// POST /api/expenses - Add new expense
router.post('/', async (req: Request, res: Response) => {
  try {
    const { input } = req.body;

    if (!input || typeof input !== 'string' || input.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Input text is required',
      });
    }

    // Parse with AI
    const parsed = await parseExpense(input.trim());

    if (!parsed) {
      return res.status(400).json({
        success: false,
        error: 'Could not parse expense. Please include an amount.',
      });
    }

    // Save to database
    const expense = createExpense({
      amount: parsed.amount,
      currency: parsed.currency,
      category: parsed.category,
      description: parsed.description,
      merchant: parsed.merchant,
      original_input: input.trim(),
    });

    return res.status(201).json({
      success: true,
      expense,
    });
  } catch (error) {
    console.error('POST /api/expenses error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// GET /api/expenses - Get all expenses
router.get('/', (_req: Request, res: Response) => {
  try {
    const expenses = getAllExpenses();
    return res.status(200).json({
      success: true,
      expenses,
    });
  } catch (error) {
    console.error('GET /api/expenses error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// DELETE /api/expenses/:id - Delete expense
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid expense ID',
      });
    }

    const deleted = deleteExpense(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    console.error('DELETE /api/expenses error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
