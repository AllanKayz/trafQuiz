const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const { User, Quiz, Result, Instructor, Package, Specialization, Certification } = require('./database');
const { autoUpdater } = require('electron-updater');
const bcrypt = require('bcrypt');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // load the dist folder from Angular
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/browser/index.html`),
      protocol: 'file:',
      slashes: true
    })
  );

  win.on('closed', () => {
    win = null;
  });
}

ipcMain.handle('get-users', async () => {
  return await User.findAll();
});

ipcMain.handle('add-user', async (event, user) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(user.password, saltRounds);
  const newUser = { ...user, password: hashedPassword };
  return await User.create(newUser);
});

ipcMain.handle('get-quizzes', async () => {
  return await Quiz.findAll();
});

ipcMain.handle('add-quiz', async (event, quiz) => {
  return await Quiz.create(quiz);
});

ipcMain.handle('get-results', async () => {
  return await Result.findAll();
});

ipcMain.handle('add-result', async (event, result) => {
  return await Result.create(result);
});

ipcMain.handle('get-instructors', async () => {
  return await Instructor.findAll();
});

ipcMain.handle('add-instructor', async (event, instructor) => {
  return await Instructor.create(instructor);
});

ipcMain.handle('get-packages', async () => {
  return await Package.findAll();
});

ipcMain.handle('add-package', async (event, pkg) => {
  return await Package.create(pkg);
});

ipcMain.handle('get-specializations', async () => {
  return await Specialization.findAll();
});

ipcMain.handle('add-specialization', async (event, specialization) => {
  return await Specialization.create(specialization);
});

ipcMain.handle('get-certifications', async () => {
  return await Certification.findAll();
});

ipcMain.handle('add-certification', async (event, certification) => {
  return await Certification.create(certification);
});

// Update handlers
ipcMain.handle('update-user', async (event, user) => {
  return await User.update(user, { where: { id: user.id } });
});

ipcMain.handle('update-quiz', async (event, quiz) => {
  return await Quiz.update(quiz, { where: { id: quiz.id } });
});

ipcMain.handle('update-instructor', async (event, instructor) => {
  return await Instructor.update(instructor, { where: { id: instructor.id } });
});

ipcMain.handle('update-specialization', async (event, specialization) => {
  return await Specialization.update(specialization, { where: { id: specialization.id } });
});

ipcMain.handle('update-certification', async (event, certification) => {
  return await Certification.update(certification, { where: { id: certification.id } });
});

// Delete handlers
ipcMain.handle('delete-user', async (event, userId) => {
  return await User.destroy({ where: { id: userId } });
});

ipcMain.handle('delete-quiz', async (event, quizId) => {
  return await Quiz.destroy({ where: { id: quizId } });
});

ipcMain.handle('delete-instructor', async (event, instructorId) => {
  return await Instructor.destroy({ where: { id: instructorId } });
});

// Exam handlers
ipcMain.handle('fetch-exam', async (event, token) => {
  const quizzes = await Quiz.findAll();
  return quizzes;
});

ipcMain.handle('fetch-exam-duration', async () => {
  // This will need to be implemented based on how exam duration is stored in the database
  return 300;
});

ipcMain.handle('set-exam-timeframe', async (event, time) => {
  // This will need to be implemented based on how exam duration is stored in the database
  return { success: true, message: 'Exam timeframe updated successfully', new_time: time.time };
});

ipcMain.handle('sync', async () => {
  try {
    // Replace with your actual API endpoint
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();

    // Here you would typically compare the remote data with the local database
    // and merge the changes. For now, we'll just log the data.
    console.log('Fetched data:', data);

    return { success: true, message: 'Data synced successfully' };
  } catch (error) {
    console.error('Error syncing data', error);
    return { success: false, message: 'Error syncing data' };
  }
});

ipcMain.handle('login', async (event, credentials) => {
  const user = await User.findOne({ where: { username: credentials.username } });
  if (user) {
    const match = await bcrypt.compare(credentials.password, user.password);
    if (match) {
      return user;
    }
  }
  return null;
});


app.on('ready', () => {
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
