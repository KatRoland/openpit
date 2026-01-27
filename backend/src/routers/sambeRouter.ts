import { Router } from 'express';
import { 
    handleShareFolder
} from '../controllers/sambaControllers.js';
import { authorize } from '../middleware/auth.js';
import { verifyActionToken } from '../middleware/action.js';

const router = Router();


router.post('/share', authorize, handleShareFolder);

export default router;