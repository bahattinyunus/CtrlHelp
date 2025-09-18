const { app, BrowserWindow } = require('electron');
const path = require('path');

// Uyumluluk için GPU hızlandırmayı kapat ve loglamayı aç
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('enable-logging');

function createWindow(){
  const win = new BrowserWindow({
    width: 1100,
    height: 760,
    backgroundColor: '#0b0f17',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      backgroundThrottling: false,
      webgl: true
    }
  });
  win.setMenuBarVisibility(false);
  // Geliştirme için kardeş klasördeki CtrlHelpTR içeriğini yükle
  win.loadFile(path.join(__dirname, '..', 'CtrlHelpTR', 'index.html'));

  // Teşhis amaçlı günlüğe alma
  win.webContents.on('did-finish-load', ()=>{
    console.log('[electron] did-finish-load');
  });
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL)=>{
    console.error('[electron] did-fail-load', { errorCode, errorDescription, validatedURL });
  });
  win.webContents.on('render-process-gone', (event, details)=>{
    console.error('[electron] render-process-gone', details);
  });
  win.webContents.on('console-message', (event, level, message, line, sourceId)=>{
    console.log(`[renderer:${level}]`, message, sourceId ? `at ${sourceId}:${line}` : '');
  });
  // win.webContents.openDevTools({ mode: 'detach' });
}

app.whenReady().then(()=>{
  createWindow();
  app.on('activate', ()=>{
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', ()=>{
  if (process.platform !== 'darwin') app.quit();
});


