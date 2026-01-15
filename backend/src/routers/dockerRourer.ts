import { Router } from 'express';
import { getAllContainers, testEP, toggleContainerEP } from '../controllers/dockerController.js';
import { authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authorize, getAllContainers);
router.post('/test', authorize, testEP);
router.post('/toggle', authorize, toggleContainerEP);

export default router;