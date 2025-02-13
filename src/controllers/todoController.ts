import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Todo from '../models/Todo.js';

// Define parameter type for userEmail
interface UserEmailParams {
  userEmail: string;
}

// Define parameter type for id
interface IdParams {
  id: string;
}

export const getTodos = async (req: Request<UserEmailParams>, res: Response): Promise<void> => {
  try {
    const { userEmail } = req.params;
    const todos = await Todo.find({ user_email: userEmail });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
};

export const createTodo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_email, title, progress, date } = req.body;
    if (!user_email || !title || !progress || !date) {
      res.status(400).json({ error: 'All fields are required: user_email, title, progress, date.' });
    }
    const id = uuidv4();
    const newTodo = new Todo({ id, user_email, title, progress, date });
    await newTodo.save();
    res.json(newTodo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create todo' });
  }
};

export const updateTodo = async (req: Request<IdParams>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { user_email, title, progress, date } = req.body;

    const updatedTodo = await Todo.findOneAndUpdate(
      { id },
      { user_email, title, progress, date },
      { new: true }
    );

    if (!updatedTodo) {
      res.status(404).json({ error: 'Todo not found' });
    }

    res.json({ success: 'Todo updated successfully', updatedTodo });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
};

export const deleteTodo = async (req: Request<IdParams>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deletedTodo = await Todo.findOneAndDelete({ id });

    if (!deletedTodo) {
      res.status(404).json({ error: 'Todo not found' });
    }

    res.json({ success: 'Todo deleted successfully', deletedTodo });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
};

