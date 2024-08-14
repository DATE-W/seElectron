const { contextBridge, ipcRenderer, dialog } = require('electron')

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const dependency of ['chrome', 'node', 'electron']) {
        replaceText(`${dependency}-version`, process.versions[dependency])
    }
})

window.ipcRenderer = require('electron').ipcRenderer

contextBridge.exposeInMainWorld('electronAPI', {
    // onUpdateCounter: (callback) => ipcRenderer.on('update-counter', (_event, value) => callback(value))
    onSaveGraph: (callback) => ipcRenderer.on('SaveGraph', (_event, value) => callback(value)),
    onLoadGraph: (callback) => ipcRenderer.on('LoadGraph', (_event, value) => callback(value)),
    onNewClass: (callback) => ipcRenderer.on('NewClass', (_event, value) => callback(value)),
    openFile: () => ipcRenderer.invoke('dialog:openFile'),
    chooseFilePath: () => ipcRenderer.invoke('dialog:openDirectory'),
    openFileExplorer: (folderPath) => ipcRenderer.send('openFileExplorer', folderPath),
    executeCommand: (command) => ipcRenderer.send('executeCommand', command)

})