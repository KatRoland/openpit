import { Router } from 'express';
import { getSystemStats  } from '../controllers/monitorController.js';
import { authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authorize, getSystemStats);

export default router;