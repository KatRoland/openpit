import { Router } from 'express';
import { login, refresh, logout, requestActionToken, handleCreateSystemUser } from '../controllers/authController.js';
import { authorize } from '../middleware/auth.js';
import { verifyActionToken } from '../middleware/action.js';


const router = Router();

router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout',authorize, logout);
router.post('/actiontoken',authorize ,requestActionToken);
router.post('/createsystemuser', authorize, verifyActionToken, handleCreateSystemUser);

export default router;