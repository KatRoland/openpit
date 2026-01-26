import { config } from '../utils/config.js';
import { getNetworkInterfaceList, getAllNIC, getNICByName, applyNetworkConfig } from '../utils/networkUtils.js';
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
        res.status(200).json({ message: "network_configuration_apply_success" });
    } catch (error) {
        res.status(500).json({ error: "failed_to_apply_network_config" });
    }
}

export const handleGetNICByName = async (req: any, res: any) => {
    const name = req.params.name;
    try {
        const nic = await getNICByName(name);
        if (nic) {
            res.status(200).json(nic);
        } else {
            res.status(404).json({ error: "network_interface_not_found" });
        }
    } catch (error) {
        res.status(500).json({ error: "failed_to_fetch_network_interface" });
    }
}