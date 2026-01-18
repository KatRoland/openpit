import { Router } from 'express';
import { getAllDisk, getDiskUsages, getDiskUsageForDisk, initDiskController } from '../controllers/diskController.js';
import { authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authorize, getAllDisk);
router.get('/usage', authorize, getDiskUsages);
router.get('/usage/:diskName', authorize, getDiskUsageForDisk);
router.post('/init', authorize, initDiskController);

export default router;