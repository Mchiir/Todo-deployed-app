const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    id: { type: String, required: true },
    user_email: { type: String, required: true },
    title: { type: String, required: true },
    progress: { type: Number, required: true },
    date: { type: Date, required: true },
});

module.exports = mongoose.model('Todo', todoSchema);