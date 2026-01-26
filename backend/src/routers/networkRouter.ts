import { Router } from 'express';
import { getNICList, handleGetAllNIC, handleApplyNetworkConfig, handleGetNICByName } from '@/controllers/networkController.js';
import { authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authorize, getNICList);
router.get('/all', authorize, handleGetAllNIC);
router.get('/:name', authorize, handleGetNICByName);

router.post('/config/apply', authorize, handleApplyNetworkConfig);

export default router;