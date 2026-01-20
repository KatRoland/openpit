import { Router } from 'express';
import { 
    getMountableFileSystems, 
    handleMountFileSystem, 
    handleUnmountFileSystem, 
    handleFormatFileSystem, 
    handleDeleteFileSystem 
} from '../controllers/filesystemController.js';
import { authorize } from '../middleware/auth.js';
import { verifyActionToken } from '../middleware/action.js';

const router = Router();


router.get('/mountables', authorize, getMountableFileSystems);

router.post('/mount', authorize, handleMountFileSystem);
router.post('/unmount', authorize, handleUnmountFileSystem);
router.post('/format', authorize, verifyActionToken, handleFormatFileSystem);
router.delete('/delete', authorize, verifyActionToken, handleDeleteFileSystem);

export default router;