import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import User, { IUser } from '../models/User.js';
import { asyncWrapper } from '../middlewares/asyncWrapper.js';

export const signup = asyncWrapper(async (req: Request, res: Response) => {
    console.log('signup router')
    const { email, password } = req.body as IUser;

    if (!email || ! password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        const token = jwt.sign({ email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        return res.status(201).json({ message: 'User already exists', email: existingUser.email, token: token });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    res.status(201).json({ email, token });
});

export const login = asyncWrapper(async (req: Request, res: Response) => {
    const { email, password } = req.body as IUser;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const success = await bcrypt.compare(password, user.password);
    if (success) {
        const token = jwt.sign({ email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        res.json({ email: user.email, token });
    } else {
        res.status(401).json({ detail: 'Login failed' });
    }
});

export const validateToken = asyncWrapper(async (req: Request, res: Response) => {
    const { token } = req.body as { token: string };

    if (!token) {
        return res.status(401).json({ message: 'Token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { email: string };
        res.status(200).json({ message: 'Token is valid', email: decoded.email });
    } catch (err: any) {
        if (err.name === 'TokenExpiredError') {
            res.status(401).json({ message: 'Token has expired' });
        } else {
            res.status(401).json({ message: 'Token is invalid', error: err.message });
        }
    }
});