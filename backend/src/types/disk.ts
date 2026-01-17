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

