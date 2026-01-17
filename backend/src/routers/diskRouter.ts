import { Router } from 'express';
import { getAllDisk, getDiskUsages } from '../controllers/diskController.js';
import { authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authorize, getAllDisk);
router.get('/usage', authorize, getDiskUsages);


export default router;