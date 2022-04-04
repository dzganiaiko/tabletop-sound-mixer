import fs from 'fs';
import path from 'path';
import { contextBridge, ipcRenderer } from "electron";

import { Console } from 'console';
const console = new Console(process.stdout, process.stderr);

contextBridge.exposeInMainWorld('fs', {
    readdirSync: fs.readdirSync,
    writeFileSync: fs.writeFileSync,
});

contextBridge.exposeInMainWorld('path', {
    join: path.join,
    basename: path.basename,
});

contextBridge.exposeInMainWorld('dialog', {
    openDirectoryDialog: async (dir?: string) => {
        return ipcRenderer.invoke('openDirectoryDialog', dir);
    }
});
