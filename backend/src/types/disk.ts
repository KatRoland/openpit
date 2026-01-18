export interface BlockDevice {
    name: string;
    size: string | number;
    fsused?: number | null;
    fstype: string | null;
    mountpoint: string | null;
    model: string | null;
    type: string;
    rota: boolean;
    children?: BlockDevice[];
}

export interface DiskUsageInfo {
    filesystem: string;
    size: string;
    used: string;
    avail: string;
    usePercent: string;
    mountedOn?: string;
}

export interface ChildrenStatus {
    name: string;
    fileSystem: string | null;
    status: string;
}