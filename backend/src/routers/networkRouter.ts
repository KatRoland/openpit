import { Router } from 'express';
import { getNICList, handleGetAllNIC } from '@/controllers/networkController.js';
import { authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authorize, getNICList);
router.get('/all', authorize, handleGetAllNIC);

export default router;