import { config } from '../utils/config.js';
import { getNetworkInterfaceList, getAllNIC, applyNetworkConfig } from '../utils/networkUtils.js';
import { NetworkInterface } from 'network.js';


export const getNICList = async (req: any, res: any) => {
    res.status(200).json({ nics: await getNetworkInterfaceList() });
};

export const handleGetAllNIC = async (req: any, res: any) => {
    const nics = await getAllNIC();
    res.status(200).json({ nics });
}

export const handleApplyNetworkConfig = async (req: any, res: any) => {
    const config = req.body as NetworkInterface;
    try {
        await applyNetworkConfig(config);
        res.status(200).json({ message: "Network configuration applied successfully." });
    } catch (error) {
        res.status(500).json({ error: "Failed to apply network configuration." });
    }
}