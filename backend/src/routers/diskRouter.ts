import { Router } from 'express';
import { getAllDisk, getDiskUsages, getDiskUsageForDisk, initDiskController, getDiskStatus, getMountableFileSystems, handleMountFileSystem, handleUnmountFileSystem, handleFormatFileSystem } from '../controllers/diskController.js';
import { authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authorize, getAllDisk);
router.get('/usage', authorize, getDiskUsages);
router.get('/usage/:diskName', authorize, getDiskUsageForDisk);
router.get('/status', authorize, (req, res) => {
    res.status(400).json({ error: "disk_name_required" });
});
router.get('/status/:diskName', authorize, getDiskStatus);
router.get('/mountables', authorize, getMountableFileSystems);


router.post('/init', authorize, initDiskController);
router.post('/mount', authorize, handleMountFileSystem);
router.post('/unmount', authorize, handleUnmountFileSystem);
router.post('/format', authorize, handleFormatFileSystem);


export default router;