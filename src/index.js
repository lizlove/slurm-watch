/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   ____ __   __  __ ___   __  ___  _      __ ___  ______ _____ __ __
  / __// /  / / / // _ \ /  |/  / | | /| / // _ |/_  __// ___// // /
 _\ \ / /__/ /_/ // , _// /|_/ /  | |/ |/ // __ | / /  / /__ / _  /
/___//____/\____//_/|_|/_/  /_/   |__/|__//_/ |_|/_/   \___//_//_/

⚡Slurm Watch⚡: This is an application built with Electron Forge.
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/* eslint-disable import/no-extraneous-dependencies */
const { app, BrowserWindow } = require('electron');
const path = require('path');

require('dotenv').config({ path: 'variables.env' });

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
/* eslint-disable global-require */
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    fullscreen: true,
    background: '#FFF',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  // TODO: Remove for production.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
