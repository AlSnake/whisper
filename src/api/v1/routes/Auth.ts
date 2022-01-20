import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateLogin } from '../validation/auth';

const router = Router();

router.post('/auth/login', validateLogin(), AuthController.postLogin);

export default router;
