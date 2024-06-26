// 控制应用生命周期和创建原生浏览器窗口的模组
const { app, BrowserWindow, Menu, MenuItem, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

const NODE_ENV = process.env.NODE_ENV  //新增
// const NODE_ENV = 'development'  // 判断开发或生产模式(建议写成这种,开发模式就可以用,等即将打包了再把这个变量换成打包模式)

let mainWindow

async function fileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile']
  })
  if (!canceled) {
    return fs.readFileSync(filePaths[0], {
      encoding: 'utf-8'
    })
  }
}

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // 加载 index.html
  // mainWindow.loadFile('dist/index.html') // 此处跟electron官网路径不同，需要注意
  mainWindow.loadURL(
    NODE_ENV === 'development'
      ? 'http://localhost:5173'
      : `file://${path.join(__dirname, '../dist/index.html')}`
  ); // 新增
  // 打开开发工具
  if (NODE_ENV === "development") {
    mainWindow.webContents.openDevTools()
  } // 新增

  const menu = new Menu();
  menu.append(new MenuItem({
    label: 'Electron',
    submenu: [
      {
        label: '关于',
        role: 'about',
      },
      {
        type: 'separator',
      },
      {
        label: '关闭',
        accelerator: process.platform === 'darwin' ? 'Alt+Cmd+Q' : 'Alt+Shift+Q',
        click: () => {
          mainWindow.close();
        }
      },
      {
        type: 'separator',
      },
      {
        label: '下载',
        accelerator: process.platform === 'darwin' ? 'Alt+Cmd+D' : 'Alt+Shift+D',
        click: () => {
          mainWindow.webContents.send('SaveGraph');
        }
      },
      {
        type: 'separator',
      },
      {
        label: '加载',
        accelerator: process.platform === 'darwin' ? 'Alt+Cmd+L' : 'Alt+Shift+L',
        click: () => {
          mainWindow.webContents.send('LoadGraph');
        }
      },
    ]
  }))
  menu.append(new MenuItem({
    label: '编辑',
    submenu: [
      {
        label: '新增自定义类',
        click: () => {

        }
      }
    ]
  }))

  Menu.setApplicationMenu(menu)

}



// 这段程序将会在 Electron 结束初始化
// 和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
  ipcMain.handle('dialog:openFile', fileOpen)
  createWindow()
  app.on('activate', function () {
    // 通常在 macOS 上，当点击 dock 中的应用程序图标时，如果没有其他
    // 打开的窗口，那么程序会重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此，通常对程序和它们在
// 任务栏上的图标来说，应当保持活跃状态，直到用户使用 Cmd + Q 退出。
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})


ipcMain.on('saveGraph', (event, arg) => {
  mainWindow.webContents.executeJavaScript(`
    const app = require('electron').remote.app
    const win = require('electron').remote.getCurrentWindow()
    win.webContents.executeJavaScript('app.$refs.homeView.saveGraph()')
  `)
})

ipcMain.on('loadGraph', (event, arg) => {
  mainWindow.webContents.executeJavaScript(`
    const app = require('electron').remote.app
    const win = require('electron').remote.getCurrentWindow()
    win.webContents.executeJavaScript('app.$refs.homeView.loadGraph()')
  `)
})