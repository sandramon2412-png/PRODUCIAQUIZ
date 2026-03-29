const { app, BrowserWindow, ipcMain, desktopCapturer, screen, globalShortcut, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;
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
    alwaysOnTop: true,
    hasShadow: true,
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'electron-preload.js'),
    },
  });

  // Load the app
  const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, './dist/index.html')}`;
  mainWindow.loadURL(startUrl);

  // Navigate to /lloyd route once loaded
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      if (!window.location.hash.includes('lloyd') && !window.location.pathname.includes('lloyd')) {
        window.location.hash = '/lloyd';
      }
    `);
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers

// Toggle compact/expanded mode
ipcMain.handle('toggle-compact', () => {
  if (!mainWindow) return;

  const [x, y] = mainWindow.getPosition();

  if (isCompact) {
    // Expand
    mainWindow.setSize(EXPANDED_WIDTH, EXPANDED_HEIGHT);
    mainWindow.setPosition(x, y - (EXPANDED_HEIGHT - COMPACT_HEIGHT));
    isCompact = false;
  } else {
    // Compact
    mainWindow.setSize(COMPACT_WIDTH, COMPACT_HEIGHT);
    mainWindow.setPosition(x, y + (EXPANDED_HEIGHT - COMPACT_HEIGHT));
    isCompact = true;
  }

  return isCompact;
});

// Get compact state
ipcMain.handle('get-compact-state', () => isCompact);

// Capture screenshot
ipcMain.handle('capture-screenshot', async () => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 },
    });

    if (sources.length === 0) return null;

    const screenshot = sources[0].thumbnail;
    return screenshot.toDataURL().split(',')[1]; // Return base64
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    return null;
  }
});

// Minimize to tray
ipcMain.handle('minimize-to-tray', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

// Toggle always on top
ipcMain.handle('toggle-always-on-top', () => {
  if (!mainWindow) return;
  const current = mainWindow.isAlwaysOnTop();
  mainWindow.setAlwaysOnTop(!current);
  return !current;
});

// Close app
ipcMain.handle('close-app', () => {
  app.quit();
});

// App lifecycle
app.whenReady().then(() => {
  createWindow();

  // Global shortcut to toggle visibility
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
