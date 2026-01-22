import { exec } from 'child_process';
import { promisify } from 'util';
import { execSudo } from '../helpers/execHelper.js';
import { networkInterfaces } from 'os';
import { NetworkInterface, NetworkConfig, NetworkConfigIPv6, NetworkStatus } from 'network.js';
import { getDHCPStatus, getDefaultGateway, getDNSServers, getNICLINKSpeed, getNICLINKState } from '@/helpers/networkHelper.js';
import { promises as fs } from 'fs';

const execAsync = promisify(exec);

export async function getNetworkInterfaceList(): Promise<string[]> {
    try {
        const interfaces = await fs.readdir('/sys/class/net');
        return interfaces.filter(name => name !== 'lo');
    } catch (error) {
        console.error("Failed to read interfaces:", error);
        return [];
    }
}

export async function getAllNIC(): Promise<NetworkInterface[]> {
    const allNames = await getNetworkInterfaceList(); 
    const osInterfaces = networkInterfaces();
    const nicList: NetworkInterface[] = [];

    for (const name of allNames) {
        const ifaceInfo = osInterfaces[name] || [];
        
        const ipv4 = ifaceInfo.find(addr => addr.family === 'IPv4' && !addr.internal);
        const ipv6 = ifaceInfo.find(addr => addr.family === 'IPv6' && !addr.internal);

        const macAddress = ifaceInfo.length > 0 ? ifaceInfo[0].mac : '00:00:00:00:00:00';

        const status = await getNICLINKState(name);

        var speed = -1;
        if(status === "up") {
            speed = await getNICLINKSpeed(name);
        }

        nicList.push({
            name,
            ipAddress: ipv4 ? ipv4.address : '',
            macAddress: macAddress,
            netmask: ipv4 ? ipv4.netmask : '',
            networkConfig: {
                dhcpEnabled: await getDHCPStatus(name),
                gateway: await getDefaultGateway(name),
                dnsServers: await getDNSServers(name)
            },
            networkConfigIPv6: {
                enabled: !!ipv6,
                address: ipv6 ? ipv6.address : '',
                prefixLength: 64,
                dhcpEnabled: true,
                gateway: '',
                dnsServers: []
            },
            networkStatus: {
                status: status,
                speedMbps: speed > 0 ? speed : 0 
            }
        });
    }

    return nicList;
}