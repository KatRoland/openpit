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
        return parseInt(splitOutput[0]);
    } catch (error) {
        console.error(`Error fetching link speed for ${interfaceName}:`, error);
        throw new Error("could_not_fetch_link_speed");
    }
}

export async function getNICLINKState(interfaceName: string): Promise<"up" | "down">  {
    try {
     const { stdout } = await execAsync(`cat /sys/class/net/${interfaceName}/operstate`);
     const trimmed = stdout.trim();
     console.log('Link state output:', trimmed)
     if(trimmed == "up" || trimmed == "down") {
         return trimmed;
     } else {
        return "down"
     }
    } catch (error) {
        console.error(`Error fetching link state for ${interfaceName}:`, error);
        throw new Error("could_not_fetch_link_state");
    }
}

export function getCIDR(ip: string): number{
    const firstOctet = parseInt(ip.split('.')[0]);

    if (isNaN(firstOctet)) throw new Error("invalid_ip_address");

    if (firstOctet >= 1 && firstOctet <= 126) {
        return 8; 
    } 
    else if (firstOctet >= 128 && firstOctet <= 191) {
        return 16;
    } 
    else if (firstOctet >= 192 && firstOctet <= 223) {
        return 24;
    } 
    else if (firstOctet >= 224) {
        return 32;
    } 
    else {
        throw new Error("ip_address_out_of_range");
    }
}

export function getNetmask(prefix: number): string {
    if (prefix < 0 || prefix > 32) {
        throw new Error("invalid_prefix_length");
    }

    let mask = (0xFFFFFFFF << (32 - prefix)) >>> 0;

    return [
        (mask >>> 24) & 0xFF,
        (mask >>> 16) & 0xFF,
        (mask >>> 8) & 0xFF,
        mask & 0xFF
    ].join('.');
}

export function validateIPAddress(ip: string): boolean {
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
}