export function sanitizeString(input:string ): string {
    return input.replace(/[^a-zA-Z0-9_-]/g, '').trim();
}

export function sanitizeIPAddress(ip: string): string {
    return ip.replace(/[^0-9.]/g, '').trim();
}

export function sanitizeMACAddress(mac: string): string {
    return mac.replace(/[^a-fA-F0-9:]/g, '').trim();
}