export interface NetworkConfig {
  dhcpEnabled: boolean;
  gateway: string;
  dnsServers: string[];
}

export interface NetworkConfigIPv6 {
  enabled: boolean;
  address: string;
  prefixLength: number;
  dhcpEnabled: boolean;
  gateway: string;
  dnsServers: string[];
}

export interface NetworkInterface {
  name: string;
  ipAddress: string;
  macAddress: string;
  netmask: string;
  networkConfig: NetworkConfig;
  networkConfigIPv6: NetworkConfigIPv6;
  networkStatus: NetworkStatus;
}


export interface NetworkStatus {
  status: 'up' | 'down';
  speedMbps: number;
}
