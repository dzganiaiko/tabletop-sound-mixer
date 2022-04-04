import { dialog } from "electron";

export async function openDialogForDirectory(dir?: string): Promise<string | undefined> {
    const result = await dialog.showOpenDialog({
        defaultPath: dir,
        properties: ['openDirectory']
    });
    if (!result || result.filePaths.length == 0) {
        return undefined;
    }
    return result.filePaths.at(0);
}
