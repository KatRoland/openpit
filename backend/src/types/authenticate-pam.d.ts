declare module 'authenticate-pam' {
    function authenticate(
        username: string, 
        password: string, 
        callback: (err: string | null) => void
    ): void;
    export = { authenticate };
}