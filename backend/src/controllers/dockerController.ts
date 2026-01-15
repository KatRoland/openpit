
import { listContainers, testFn,toggleContainer  } from '../utils/dockerHelper.js';
import { Request, Response } from 'express';

export const getAllContainers = async (req: Request,res: Response) => {
    const containers =  await listContainers();
    res.status(200).json({ containers });
};

export async function testEP(req: Request, res: Response) {
    const result = await testFn();
    res.status(200).json(result);
}

export const toggleContainerEP = async (req: Request, res: Response) => {
    const { id, action } = req.body;
    const result = await toggleContainer(id, action);
    res.status(200).json(result);
}