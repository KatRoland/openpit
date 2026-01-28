import { Router } from 'express';
import { 
    handleShareFolder,
    handleUnShareFolder,
    getSharedFolders
} from '../controllers/sambaControllers.js';
import { authorize } from '../middleware/auth.js';
import { verifyActionToken } from '../middleware/action.js';

const router = Router();

router.get('/list', authorize, getSharedFolders);

router.post('/share', authorize, handleShareFolder);
router.post('/unshare', authorize, handleUnShareFolder);


export default router;