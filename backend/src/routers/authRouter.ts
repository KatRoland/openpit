import { Router } from 'express';
import { login, refresh, logout, requestActionToken } from '../controllers/authController.js';
import { authorize } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout',authorize, logout);
router.post('/actiontoken',authorize ,requestActionToken);

export default router;