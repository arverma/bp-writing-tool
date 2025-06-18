const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const os = require('os');

let mainWindow;
let pythonProcess;

// Logging setup
const logPath = path.join(os.homedir(), 'BPolice-main.log');
fs.writeFileSync(logPath, ''); // Clear the log file at app start
function log(msg) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`);
}

// Start Python Flask server as a background process
function startPythonServer() {
  return new Promise((resolve, reject) => {
    const isPackaged = app.isPackaged;
    const basePath = isPackaged ? process.resourcesPath : __dirname;
    const pythonScript = path.join(basePath, 'python', 'app.py');
    const venvPython = path.join(basePath, 'python', 'venv', 'bin', 'python3');
    const pythonExecutable = fs.existsSync(venvPython) ? venvPython : 'python3';

    log(`Starting Python backend: ${pythonExecutable} ${pythonScript}`);
    pythonProcess = spawn(pythonExecutable, [pythonScript], {
      cwd: path.join(basePath, 'python'),
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let resolved = false;
    pythonProcess.stdout.on('data', (data) => {
      const msg = data.toString();
      log(`[Flask stdout] ${msg.trim()}`);
      if (!resolved && msg.includes('Running on')) {
        resolved = true;
        log('Flask server started.');
        resolve();
      }
    });
    pythonProcess.stderr.on('data', (data) => {
      log(`[Flask stderr] ${data.toString().trim()}`);
    });
    pythonProcess.on('error', (err) => {
      log(`[Flask error] ${err}`);
      if (!resolved) {
        reject(err);
      }
    });
    pythonProcess.on('exit', (code) => {
      log(`[Flask exited] code ${code}`);
    });
    // Fallback: resolve after 2 seconds if not already
    setTimeout(() => { if (!resolved) { log('Flask fallback resolve.'); resolve(); } }, 2000);
  });
}

// Create the main window
function createWindow() {
  log('Creating main window.');
  mainWindow = new BrowserWindow({
    width: 800,
    height: 700,
    minWidth: 600,
    minHeight: 500,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    titleBarStyle: 'hiddenInset', // macOS style
    show: false
  });

  // Load the app
  mainWindow.loadFile('renderer/index.html');

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Development: open DevTools
  // if (process.argv.includes('--dev')) {
  //   mainWindow.webContents.openDevTools();
  // }
}

// Helper function to make HTTP requests
function makeHttpRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result);
        } catch (error) {
          log(`[HTTP parse error] ${error}`);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      log(`[HTTP error] ${error}`);
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// App event handlers
app.whenReady().then(async () => {
  log('App starting...');
  try {
    await startPythonServer();
    createWindow();
  } catch (error) {
    log(`[Startup error] ${error}`);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  log('All windows closed.');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  log('App activated.');
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  log('App quitting.');
  if (pythonProcess) {
    pythonProcess.kill();
    log('Killed Python process.');
  }
});

// IPC handlers for communication with renderer
ipcMain.handle('transliterate', async (event, word) => {
  try {
    const options = {
      hostname: '127.0.0.1',
      port: 5001,
      path: '/transliterate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': JSON.stringify({ word }).length
      }
    };
    const data = { word };
    const result = await makeHttpRequest(options, data);
    log(`[Transliterate] word: ${word} result: ${JSON.stringify(result)}`);
    return result;
  } catch (error) {
    log(`[Transliterate error] ${error}`);
    return { suggestions: [word] };
  }
}); 