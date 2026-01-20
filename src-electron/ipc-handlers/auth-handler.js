const { ipcMain } = require('electron');
const UserModel = require('../models/UserModel');
const StudentModel = require('../models/StudentModel');
const InstructorModel = require('../models/InstructorModel');

ipcMain.handle('login', async (event, credentials) => {
    try {
        const { email, password, username } = credentials;
        
        // Find user by email or username
        let user;
        if (email) {
            user = await UserModel.findByEmail(email);
        }
        
        // If not found by email or if username was explicitly provided, try username
        if (!user && username) {
            user = await UserModel.findByUsername(username);
        }

        // Final fallback: if we have a generic 'identifier' that could be either (sometimes frontend just sends one)
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

        // Get additional role data
        let roleData = {};
        try {
            if (user.role === 'student') {
                roleData = await StudentModel.findByUserId(user.id);
            } else if (user.role === 'instructor') {
                if (InstructorModel.findByUserId) {
                    roleData = await InstructorModel.findByUserId(user.id);
                }
            }
        } catch (roleError) {
            console.warn(`Could not fetch role data for ${user.role}:`, roleError);
            // Non-fatal error for login
        }
        
        // Return user info sans password
        const { password: _, ...userWithoutPassword } = user;
        
        return {
            success: true,
            user: userWithoutPassword,
            roleData,
            token: 'electron-local-token' 
        };
    } catch (error) {
        console.error('Login system error:', error);
        return { success: false, message: 'Authentication service error. Please contact administrator.' };
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

ipcMain.handle('forgot-password', async (event, { username }) => {
    try {
        const user = await UserModel.findByUsername(username) || await UserModel.findByEmail(username);
        if (!user) return { success: false, message: 'User not found' };
        return { success: true, message: 'Password reset instructions sent (Simulated)' };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('reset-password', async (event, { username, password }) => {
    try {
        const user = await UserModel.findByUsername(username) || await UserModel.findByEmail(username);
        if (!user) return { success: false, message: 'User not found' };
        await UserModel.updatePassword(user.id, password);
        return { success: true, message: 'Password reset successfully' };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

