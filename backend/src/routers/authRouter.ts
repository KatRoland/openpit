import { Router } from 'express';
import { login, refresh, logout, requestActionToken, handleCreateSystemUser, handleChangeUserGroups, handleDeleteSystemUser } from '../controllers/authController.js';
import { authorize, authorizeSudo } from '../middleware/auth.js';
import { verifyActionToken } from '../middleware/action.js';


const router = Router();

router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout',authorize, logout);
router.post('/actiontoken',authorize ,requestActionToken);
router.post('/createsystemuser', authorizeSudo, verifyActionToken, handleCreateSystemUser);
router.post('/changegroups', authorizeSudo, handleChangeUserGroups);
router.post('/deletesystemuser', authorizeSudo, verifyActionToken, handleDeleteSystemUser);

export default router;