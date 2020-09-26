/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */
const {app, Menu, shell, BrowserWindow, protocol, clipboard, dialog, ipcMain} = require('electron');
process.env.electronPath = app.getAppPath();
function isDev() {
  return process.argv[2] == '--dev';
}
let debugMode = true;
if (isDev()) { // Dev mode from Makefile
  process.env.serveMode = "dev"; // Prod OR debug
} else {
  process.env.serveMode = "prod"; // Prod OR debug
  debugMode = false;
}
process.env.liveDebugMode = false; // Special flag for live server debug.
const url = require('url');
const path = require('path');
const nfs = require('fs');
const npjoin = require('path').join;
const BASE_DIR = __dirname;
let versions, es6Path, electronPath, mainIndex;
if (process.env.serveMode == 'dev') {
  versions = require('./version');
  es6Path = npjoin(__dirname, 'build/electron-app/app');  // ES6 module loader with custom protocol
  electronPath = npjoin(__dirname, 'build/electron-app');
  mainIndex = 'build/electron-app/app/index.html';
} else {
  versions = require('./app/version');
  es6Path = npjoin(__dirname, 'app');  // ES6 module loader with custom protocol
  electronPath = npjoin(__dirname);
  mainIndex = 'app/index.html';
}

let windowWidth = 1280;
let windowHeight = 970;
protocol.registerSchemesAsPrivileged([
  {scheme: 'es6', privileges: {standard: true, secure: true, bypassCSP: true}}
]);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let mainContent;
let devtools;
let mainURL;

app.once('ready', function() {
  let template;
  if (process.platform === 'darwin') {
    template = [
      {
        label: 'Backend.AI',
        submenu: [
          {
            label: 'About Backend.AI Console',
            click: function() {
              mainContent.executeJavaScript('let event = new CustomEvent("backend-ai-show-splash", {"detail": ""});' +
                '    document.dispatchEvent(event);');
            }
          },
          {
            type: 'separator'
          },
          {
            label: 'Services',
            submenu: []
          },
          {
            type: 'separator'
          },
          {
            label: 'Hide Backend.AI Console',
            accelerator: 'Command+H',
            selector: 'hide:'
          },
          {
            label: 'Hide Others',
            accelerator: 'Command+Shift+H',
            selector: 'hideOtherApplications:'
          },
          {
            label: 'Show All',
            selector: 'unhideAllApplications:'
          },
          {
            type: 'separator'
          },
          {
            label: 'Quit',
            accelerator: 'Command+Q',
            click: function() {
              app.quit();
            }
          },
        ]
      },
      {
        label: 'Edit',
        submenu: [
          {
            label: 'Undo',
            accelerator: 'Command+Z',
            selector: 'undo:'
          },
          {
            label: 'Redo',
            accelerator: 'Shift+Command+Z',
            selector: 'redo:'
          },
          {
            type: 'separator'
          },
          {
            label: 'Cut',
            accelerator: 'Command+X',
            selector: 'cut:'
          },
          {
            label: 'Copy',
            accelerator: 'Command+C',
            selector: 'copy:'
          },
          {
            label: 'Paste',
            accelerator: 'Command+V',
            selector: 'paste:'
          },
          {
            label: 'Select All',
            accelerator: 'Command+A',
            selector: 'selectAll:'
          },
        ]
      },
      {
        label: 'View',
        submenu: [
          {
            label: 'Zoom In',
            accelerator: 'Command+=',
            role: 'zoomin'
          },
          {
            label: 'Zoom Out',
            accelerator: 'Command+-',
            role: 'zoomout'
          },
          {
            label: 'Actual Size',
            accelerator: 'Command+0',
            role: 'resetzoom'
          },
          {
            label: 'Toggle Full Screen',
            accelerator: 'Ctrl+Command+F',
            click: function() {
              const focusedWindow = BrowserWindow.getFocusedWindow();
              if (focusedWindow) {
                focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
              }
            }
          },
        ]
      },
      {
        label: 'Window',
        submenu: [
          {
            label: 'Minimize',
            accelerator: 'Command+M',
            selector: 'performMiniaturize:'
          },
          {
            label: 'Close',
            accelerator: 'Command+W',
            selector: 'performClose:'
          },
          {
            type: 'separator'
          },
          {
            label: 'Bring All to Front',
            selector: 'arrangeInFront:'
          },
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Online Manual',
            click: function() {
              shell.openExternal('https://console.docs.backend.ai/');
            }
          },
          {
            label: 'Backend.AI Project Site',
            click: function() {
              shell.openExternal('https://www.backend.ai/');
            }
          }
        ]
      }
    ];
  } else {
    template = [
      {
        label: '&File',
        submenu: [
          {
            label: 'Refresh App',
            accelerator: 'CmdOrCtrl+R',
            click: function() {
              mainWindow.loadURL(url.format({ // Load HTML into new Window
                pathname: path.join(mainIndex),
                protocol: 'file',
                slashes: true
              }));
              console.log('Re-connected to proxy: ' + proxyUrl);
            }
          },
          {
            type: 'separator'
          },
          {
            label: '&Close',
            accelerator: 'Ctrl+W',
            click: function() {
              const focusedWindow = BrowserWindow.getFocusedWindow();
              if (focusedWindow) {
                focusedWindow.close();
              }
            }
          },
        ]
      },
      {
        label: '&View',
        submenu: [
          {
            label: 'Zoom In',
            accelerator: 'CmdOrCtrl+=',
            role: 'zoomin'
          },
          {
            label: 'Zoom Out',
            accelerator: 'CmdOrCtrl+-',
            role: 'zoomout'
          },
          {
            label: 'Actual Size',
            accelerator: 'CmdOrCtrl+0',
            role: 'resetzoom'
          },
          {
            label: 'Toggle &Full Screen',
            accelerator: 'F11',
            role: 'togglefullscreen'
          },
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Online Manual',
            click: function() {
              shell.openExternal('https://console.docs.backend.ai/');
            }
          },
          {
            label: 'Backend.AI Project Site',
            click: function() {
              shell.openExternal('https://www.backend.ai/');
            }
          }
        ]
      }
    ];
  }

  const appmenu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(appmenu);
});


function createWindow() {
  // Create the browser window.
  devtools = null;

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    title: 'Backend.AI',
    frame: true,
    //titleBarStyle: 'hiddenInset',
    webPreferences: {
      nativeWindowOpen: true,
      nodeIntegration: false,
      devTools: (debugMode === true)
    }
  });
  mainURL = url.format({
    pathname: path.join(mainIndex),
    protocol: 'file',
    slashes: true
  });
  mainWindow.loadURL(mainURL);
  mainContent = mainWindow.webContents;
  if (debugMode === true) {
    devtools = new BrowserWindow();
    mainWindow.webContents.setDevToolsWebContents(devtools.webContents);
    mainWindow.webContents.openDevTools({mode: 'detach'});
  }
  // Emitted when the window is closed.
  mainWindow.on('close', (e) => {
    if (mainWindow) {
      e.preventDefault();
      mainWindow.webContents.send('app-close-window');
    }
  });

  ipcMain.on('app-closed', (_) => {
    if (process.platform !== 'darwin') { // Force close app when it is closed even on macOS.
      // app.quit()
    }
    mainWindow = null;
    mainContent = null;
    devtools = null;
    app.quit();
  });
  mainWindow.on('closed', function() {
    mainWindow = null;
    mainContent = null;
    devtools = null;
  });

  mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
    newPopupWindow(event, url, frameName, disposition, options, additionalFeatures, mainWindow);
  });
}

function newPopupWindow(event, url, frameName, disposition, options, additionalFeatures) {
  event.preventDefault();
  Object.assign(options, {
    frame: true,
    show: false,
    backgroundColor: '#EFEFEF',
    // parent: win,
    titleBarStyle: '',
    width: windowWidth,
    height: windowHeight,
    closable: true
  });
  Object.assign(options.webPreferences, {
    preload: '',
    isBrowserView: false,
    javascript: true
  });
  if (frameName === 'modal') {
    options.modal = true;
  }
  event.newGuest = new BrowserWindow(options);
  event.newGuest.once('ready-to-show', () => {
    event.newGuest.show();
  });
  event.newGuest.loadURL(url);
  event.newGuest.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
    newPopupWindow(event, url, frameName, disposition, options, additionalFeatures);
  });
  event.newGuest.on('close', (e) => {
    const c = BrowserWindow.getFocusedWindow();
    if (c !== null) {
      c.destroy();
    }
  });
}

app.on('ready', () => {
  protocol.interceptFileProtocol('file', (request, callback) => {
    const url = request.url.substr(7); /* all urls start with 'file://' */
    const extension = url.split('.').pop();
    const options = {path: path.normalize(`${BASE_DIR}/${url}`)};
    callback(options);
  }, (err) => {
    if (err) console.error('Failed to register protocol');
  });
  // Force mime-type to javascript
  protocol.registerBufferProtocol('es6', (req, cb) => {
    nfs.readFile(
        npjoin(es6Path, req.url.replace('es6://', '')),
        (e, b) => {
          cb({mimeType: 'text/javascript', data: b});
        }
    );
  });
  createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  if (mainWindow) {
    e.preventDefault();
    mainWindow.webContents.send('app-close-window');
  }
});


app.on('activate', function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
app.on('certificate-error', function(event, webContents, url, error,
    certificate, callback) {
  event.preventDefault();
  callback(true);
});
// Let windows without node integration
app.on('web-contents-created', (event, contents) => {
  contents.on('will-attach-webview', (event, webPreferences, params) => {
    // Strip away preload scripts if unused or verify their location is legitimate
    delete webPreferences.preload;
    delete webPreferences.preloadURL;

    // Disable Node.js integration
    webPreferences.nodeIntegration = false;

    // Verify URL being loaded
    // if (!params.src.startsWith('https://yourapp.com/')) {
    //  event.preventDefault()
    // }
  });
});
