import { Router } from 'express';
import { getAllDisk} from '../controllers/diskController.js';
import { authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authorize, getAllDisk);


export default router;