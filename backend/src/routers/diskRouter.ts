import { Router } from 'express';
import { getAllDisk, getDiskUsages, getDiskUsageForDisk } from '../controllers/diskController.js';
import { authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authorize, getAllDisk);
router.get('/usage', authorize, getDiskUsages);
router.get('/usage/:diskName', authorize, getDiskUsageForDisk);


export default router;