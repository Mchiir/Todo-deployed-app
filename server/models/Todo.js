const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.ObjectId, ref : "User",  required: true },
    title: { type: String, required: true },
    progress: { type: Number, required: true },
    date: { type: Date, required: true },
});

module.exports = mongoose.model('Todo', todoSchema);