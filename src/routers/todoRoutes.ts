import { Router } from 'express';
// import * as todoController from '@controllers/todoController.js';
import * as todoController from '../controllers/todoController.js';

const router = Router();

router.get('/todos/:userEmail', todoController.getTodos);
router.post('/todos', todoController.createTodo);
router.put('/todos/:id', todoController.updateTodo);
router.delete('/deleteTodo/:id', todoController.deleteTodo);

export default router;