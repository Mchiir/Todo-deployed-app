import mongoose, { Document, Schema } from 'mongoose';

export interface ITodo extends Document {
    id?: string // optional field
    user_email: string
    title: string
    progress: number
    date: Date
}

const todoSchema = new Schema<ITodo>({
    id: { type: String, required: false },
    user_email: { type: String, required: true },
    title: { type: String, required: true },
    progress: { type: Number, required: true },
    date: { type: Date, required: true }
});

export default mongoose.model<ITodo>('Todo', todoSchema);