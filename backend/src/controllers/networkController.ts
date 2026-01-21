import { config } from '../utils/config.js';
import { getNetworkInterfaceList, getAllNIC } from '../utils/networkUtils.js';


export const getNICList = async (req: any, res: any) => {
    res.status(200).json({ nics: await getNetworkInterfaceList() });
};

export const handleGetAllNIC = async (req: any, res: any) => {
    const nics = await getAllNIC();
    res.status(200).json({ nics });
}