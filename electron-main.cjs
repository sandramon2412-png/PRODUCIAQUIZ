const { app, BrowserWindow, ipcMain, desktopCapturer, screen, globalShortcut, nativeImage } = require('electron');
const path = require('path');

// SINGLE INSTANCE LOCK - prevents opening multiple windows
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
    transparent: true,
    resizable: false,
    skipTaskbar: false,
    alwaysOnTop: false,
    hasShadow: false,
    show: false, // Don't show until ready
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'electron-preload.cjs'),
    },
  });

  // Show window only when content is ready (prevents blank flash)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Load the app
  const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, './dist/index.html')}`;
  mainWindow.loadURL(startUrl);

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// If user tries to open a second instance, focus the existing window
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
  mainWindow.setAlwaysOnTop(!current);
  return !current;
});

ipcMain.handle('close-app', () => {
  app.quit();
});

// App lifecycle
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
