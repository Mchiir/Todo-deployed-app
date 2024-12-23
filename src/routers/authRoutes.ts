import { Router } from 'express';
import * as authController from '@controllers/authController';

const router = Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/validate-token', authController.validateToken);

export default router;