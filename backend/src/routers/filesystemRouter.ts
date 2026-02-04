import { Router } from 'express';
import { 
    getMountableFileSystems, 
    handleMountFileSystem, 
    handleUnmountFileSystem, 
    handleFormatFileSystem, 
    handleDeleteFileSystem ,
    getFolderContents
} from '../controllers/filesystemController.js';
import { authorize, authorizeSudo } from '../middleware/auth.js';
import { verifyActionToken } from '../middleware/action.js';

const router = Router();


router.get('/mountables', authorize, getMountableFileSystems);

router.post('/contents', authorize, getFolderContents);

router.post('/mount', authorize, handleMountFileSystem);
router.post('/unmount', authorize, handleUnmountFileSystem);
router.post('/format', authorizeSudo, verifyActionToken, handleFormatFileSystem);
router.delete('/delete', authorizeSudo, verifyActionToken, handleDeleteFileSystem);

export default router;