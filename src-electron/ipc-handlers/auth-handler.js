const { ipcMain } = require('electron');
const { UserModel } = require('../models/UserModel');
const { StudentModel } = require('../models/StudentModel');
const { InstructorModel } = require('../models/InstructorModel');

ipcMain.handle('login', async (event, credentials) => {
    try {
        const { email, password, username } = credentials;
        
        let user;
        if (email) {
            user = await UserModel.findByEmail(email);
        }
        
        if (!user && username) {
            user = await UserModel.findByUsername(username);
        }

        if (!user && (email || username)) {
            const identifier = email || username;
            if (identifier.includes('@')) {
                user = await UserModel.findByEmail(identifier);
            } else {
                user = await UserModel.findByUsername(identifier);
            }
        }

        if (!user) {
            return { success: false, message: 'Invalid credentials: User not found' };
        }

        const isValid = await UserModel.verifyPassword(user, password);
        if (!isValid) {
            return { success: false, message: 'Invalid credentials: Password mismatch' };
        }

        let roleData = {};
        try {
            if (user.role === 'student') {
                roleData = await StudentModel.findByUserId(user.id);
            } else if (user.role === 'instructor') {
                roleData = await InstructorModel.findByUserId(user.id);
            }
        } catch (roleError) {
            console.warn(`Could not fetch role data for ${user.role}:`, roleError);
        }
        
        const { password: _, ...userWithoutPassword } = user;
        
        return {
            success: true,
            user: userWithoutPassword,
            roleData,
            token: 'electron-local-token' 
        };
    } catch (error) {
        console.error('Login system error:', error);
        return { success: false, message: `Authentication service error: ${error.message}` };
    }
});

ipcMain.handle('get-user-info', async (event, { id }) => {
    try {
        const user = await UserModel.find(id);
        if (!user) return { success: false, message: 'User not found' };
        const { password: _, ...userWithoutPassword } = user;
        return { success: true, data: userWithoutPassword };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('update-user', async (event, data) => {
    try {
        const { id, ...payload } = data;
        const result = await UserModel.update(id, payload);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('update-user-password', async (event, { id, password }) => {
    try {
        await UserModel.updatePassword(id, password);
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('delete-account', async (event, { id, password }) => {
    try {
        const user = await UserModel.find(id);
        if (!user) return { success: false, message: 'User not found' };
        
        const isValid = await UserModel.verifyPassword(user, password);
        if (!isValid) return { success: false, message: 'Invalid password' };

        await UserModel.delete(id);
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('get-all-users', async () => {
    try {
        const users = await UserModel.findAll();
        // Return without passwords
        const safeUsers = users.map(u => {
            const { password, ...rest } = u;
            return rest;
        });
        return { success: true, data: safeUsers };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('add-user', async (event, userData) => {
    try {
        // Basic minimal add-user if not going through student/instructor specific flows
        // Hash password handled in UserModel.create
        const newUser = await UserModel.create(userData);
        const { password, ...rest } = newUser;
        return { success: true, data: rest };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('delete-user', async (event, { id, role }) => {
    try {
        if (role === 'student') {
            await StudentModel.delete(id); // Should cascade or handle user deletion logic inside
        } else if (role === 'instructor') {
            await InstructorModel.delete(id);
        }
        // Fallback or specific user delete
        await UserModel.delete(id);
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
});
