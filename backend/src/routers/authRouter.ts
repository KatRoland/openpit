import { Router } from 'express';
import { login, refresh, logout, requestActionToken, handleCreateSystemUser, handleChangeUserGroups } from '../controllers/authController.js';
import { authorize } from '../middleware/auth.js';
import { verifyActionToken } from '../middleware/action.js';


const router = Router();

router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout',authorize, logout);
router.post('/actiontoken',authorize ,requestActionToken);
router.post('/createsystemuser', authorize, verifyActionToken, handleCreateSystemUser);
router.post('/changegroups', authorize, handleChangeUserGroups);

export default router;