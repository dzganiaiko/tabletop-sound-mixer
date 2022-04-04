export {};

declare global {
    interface Window {
        fs: {
            readdirSync: (path: string) => string[],
            writeFileSync: (path: string, data: string) => void,
        },
        path: {
            join: (...paths: string[]) => string,
            basename: (p: string, ext?: string) => string,
        },
        dialog: {
            openDirectoryDialog: (dir?: string) => Promise<string | undefined>
        }
    }
}
