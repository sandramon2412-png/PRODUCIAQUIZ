const { app, BrowserWindow, ipcMain, desktopCapturer, screen, globalShortcut, nativeImage } = require('electron');
const path = require('path');

// SINGLE INSTANCE LOCK
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {

let mainWindow = null;
let isCompact = false;

const EXPANDED_WIDTH = 420;
const EXPANDED_HEIGHT = 650;
const COMPACT_WIDTH = 420;
const COMPACT_HEIGHT = 52;

function createWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: EXPANDED_WIDTH,
    height: EXPANDED_HEIGHT,
    x: screenWidth - EXPANDED_WIDTH - 20,
    y: screenHeight - EXPANDED_HEIGHT - 20,
    frame: false,
    transparent: false,
    resizable: false,
    skipTaskbar: false,
    alwaysOnTop: true,
    hasShadow: true,
    show: false,
    backgroundColor: '#0d0d0d',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'electron-preload.cjs'),
    },
  });

  mainWindow.setAlwaysOnTop(true, 'screen-saver');

  mainWindow.on('blur', () => {
    if (mainWindow && mainWindow.isAlwaysOnTop()) {
      mainWindow.setAlwaysOnTop(false);
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Try loading from local files
  const localUrl = `file://${path.join(__dirname, './dist/index.html')}`;
  const devUrl = process.env.ELECTRON_START_URL;

  const urlToLoad = devUrl || localUrl;

  mainWindow.loadURL(urlToLoad).catch((err) => {
    console.error('Failed to load URL:', err);
    // Show error page so user sees something instead of blank
    mainWindow.loadURL(`data:text/html,<html><body style="background:#0d0d0d;color:white;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><div style="text-align:center"><h2>Lloyd Assistant</h2><p>Error al cargar. Reinicia la app.</p></div></body></html>`);
  });

  // Log any page errors for debugging
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Page failed to load:', errorCode, errorDescription);
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (!mainWindow.isVisible()) mainWindow.show();
    mainWindow.focus();
  }
});

// IPC Handlers
ipcMain.handle('toggle-compact', () => {
  if (!mainWindow) return;
  const [x, y] = mainWindow.getPosition();
  if (isCompact) {
    mainWindow.setSize(EXPANDED_WIDTH, EXPANDED_HEIGHT);
    mainWindow.setPosition(x, y - (EXPANDED_HEIGHT - COMPACT_HEIGHT));
    isCompact = false;
  } else {
    mainWindow.setSize(COMPACT_WIDTH, COMPACT_HEIGHT);
    mainWindow.setPosition(x, y + (EXPANDED_HEIGHT - COMPACT_HEIGHT));
    isCompact = true;
  }
  return isCompact;
});

ipcMain.handle('get-compact-state', () => isCompact);

ipcMain.handle('capture-screenshot', async () => {
  try {
    if (mainWindow) mainWindow.hide();
    await new Promise(resolve => setTimeout(resolve, 200));
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 },
    });
    if (mainWindow) mainWindow.show();
    if (sources.length === 0) return null;
    return sources[0].thumbnail.toDataURL().split(',')[1];
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    if (mainWindow) mainWindow.show();
    return null;
  }
});

ipcMain.handle('minimize-to-tray', () => {
  if (mainWindow) mainWindow.hide();
});

ipcMain.handle('toggle-always-on-top', () => {
  if (!mainWindow) return false;
  const current = mainWindow.isAlwaysOnTop();
  if (current) {
    mainWindow.setAlwaysOnTop(false);
  } else {
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
  }
  return !current;
});

ipcMain.handle('close-app', () => {
  app.quit();
});

app.whenReady().then(() => {
  createWindow();

  globalShortcut.register('CommandOrControl+Shift+L', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

} // end of single instance lock
