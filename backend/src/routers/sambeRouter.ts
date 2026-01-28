import { Router } from 'express';
import { 
    handleShareFolder,
    handleUnShareFolder,
    handleCreateNewShare,
    getSharedFolders,
    getSharedFoldersByPartition
} from '../controllers/sambaControllers.js';
import { authorize } from '../middleware/auth.js';
import { verifyActionToken } from '../middleware/action.js';

const router = Router();

router.get('/list', authorize, getSharedFolders);
router.get('/list/:partition', authorize, getSharedFoldersByPartition);

router.post('/share', authorize, handleShareFolder);
router.post('/unshare', authorize, handleUnShareFolder);
router.post('/create', authorize, handleCreateNewShare);

export default router;