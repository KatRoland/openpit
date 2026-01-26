import { Router } from 'express';
import { getNICList, handleGetAllNIC, handleApplyNetworkConfig } from '@/controllers/networkController.js';
import { authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authorize, getNICList);
router.get('/all', authorize, handleGetAllNIC);

router.post('/config/apply', authorize, handleApplyNetworkConfig);

export default router;