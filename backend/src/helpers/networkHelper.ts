import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

export async function getDHCPStatus(interfaceName: string): Promise<boolean> {
    try {
        const { stdout } = await execAsync(`ip -j -p addr show | jq '.[] | select(.ifname == "${interfaceName}") | {interface: .ifname, dhcp_enabled: (if .["addr-info"] then (.[ "addr-info"] | any(.dynamic == true)) else false end)}'`);
        const parsed = JSON.parse(stdout);
        return parsed.dhcp_enabled;
    } catch (error) {
        console.error(`Error fetching DHCP status for ${interfaceName}:`, error);
        throw new Error("could_not_fetch_dhcp_status");
    }
}

export async function getDefaultGateway(interfaceName: string): Promise<string> {
    try {
        const { stdout } = await execAsync(`ip -j route show dev ${interfaceName} | jq -r '.[] | select(.dst == "default") | .gateway'`);
        const gateway = stdout.trim();
        return gateway || '';
    } catch (error) {
        console.error(`Error fetching default gateway for ${interfaceName}:`, error);
        throw new Error("could_not_fetch_default_gateway");
    }
}

export async function getDNSServers(interfaceName: string): Promise<string[]> {
    try {
        const { stdout } = await execAsync(`resolvectl status ${interfaceName} | awk '/DNS Servers:/ {for(i=3;i<=NF;i++) print $i}' | jq -R . | jq -s '{interface: "${interfaceName}", dns_servers: .}'`);
        const parsed = JSON.parse(stdout);
        const dnsServers: string[] = parsed.dns_servers || [];
        return dnsServers;
    } catch (error) {
        console.error(`Error fetching DNS servers for ${interfaceName}:`, error);
        throw new Error("could_not_fetch_dns_servers");
    }
}

export async function getNICLINKSpeed(interfaceName: string): Promise<number> {
    try {
     const { stdout } = await execAsync(`cat /sys/class/net/${interfaceName}/speed`);
     const splitOutput = stdout.trim().split(': ')
     console.log('Link speed output:', splitOutput)
        return parseInt(splitOutput[1]);
    } catch (error) {
        console.error(`Error fetching link speed for ${interfaceName}:`, error);
        throw new Error("could_not_fetch_link_speed");
    }
}