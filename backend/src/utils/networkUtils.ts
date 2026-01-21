import { exec } from 'child_process';
import { promisify } from 'util';
import { execSudo } from '../helpers/execHelper.js';
import { networkInterfaces } from 'os';
import { NetworkInterface, NetworkConfig, NetworkConfigIPv6, NetworkStatus } from 'network.js';
import { getDHCPStatus, getDefaultGateway, getDNSServers } from '@/helpers/networkHelper.js';

const execAsync = promisify(exec);

export async function getNetworkInterfaceList(): Promise<string[]> {
    const interfaces = networkInterfaces();
    console.log(interfaces);
    return Object.keys(interfaces).filter(name => {
        const iface = interfaces[name];
        return iface && iface.some(addr => !addr.internal);
    });
}

export async function getAllNIC(): Promise<NetworkInterface[]> {
    const interfaces = networkInterfaces();
    const nicList: NetworkInterface[] = [];

    for (const name of Object.keys(interfaces)) {
        const iface = interfaces[name];
        if (iface) {
            const ipv4 = iface.find(addr => addr.family === 'IPv4' && !addr.internal);
            const ipv6 = iface.find(addr => addr.family === 'IPv6' && !addr.internal);

            if (ipv4 || ipv6) {
                nicList.push({
                    name,
                    ipAddress: ipv4 ? ipv4.address : (ipv6 ? ipv6.address : ''),
                    macAddress: iface[0].mac,
                    netmask: ipv4 ? ipv4.netmask : (ipv6 ? ipv6.netmask : ''),
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
                        status: 'up',
                        speedMbps: 1000
                    }
                });
            }
        }
    }

    return nicList;
}