const { ipcMain } = require('electron');
const { UserModel } = require('../models/UserModel');
const { StudentModel } = require('../models/StudentModel');
const { InstructorModel } = require('../models/InstructorModel');
const { broadcastChange } = require('../utils/broadcast');
const { setSession, clearSession, isAdmin } = require('../utils/session');

ipcMain.handle('logout', async () => {
    clearSession();
    return { success: true };
});

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
        
        // Establish main process session for RBAC
        setSession(user);

        return {
            success: true,
            user: userWithoutPassword,
            roleData,
            token: 'electron-local-token' 
        };
    } catch (error) {
        console.error('Login system error:', error);
        return { success: false, message: 'Authentication service error' };
    }
});

ipcMain.handle('get-user-info', async (event, { id }) => {
    try {
        const user = await UserModel.find(id);
        if (!user) return { success: false, message: 'User not found' };
        const { password: _, ...userWithoutPassword } = user;
        return { success: true, data: userWithoutPassword };
    } catch (error) {
        return { success: false, message: 'Internal service error' };
    }
});

ipcMain.handle('update-user', async (event, data) => {
    try {
        const { id, ...payload } = data;
        const { getSession } = require('../utils/session');
        const session = getSession();

        if (!session) return { success: false, message: 'Not logged in' };

        // RBAC: Only admin can update others. Non-admins can only update themselves.
        if (!isAdmin() && session.id !== id) {
            return { success: false, message: 'Unauthorized' };
        }

        // Prevent non-admins from escalating their role
        if (!isAdmin() && payload.role) {
            delete payload.role;
        }

        const result = await UserModel.update(id, payload);
        broadcastChange('users', 'update', result);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, message: 'Internal service error' };
    }
});

ipcMain.handle('update-user-password', async (event, { id, password }) => {
    try {
        const { getSession } = require('../utils/session');
        const session = getSession();
        if (!session) return { success: false, message: 'Not logged in' };
        if (!isAdmin() && session.id !== id) return { success: false, message: 'Unauthorized' };

        await UserModel.updatePassword(id, password);
        return { success: true };
    } catch (error) {
        return { success: false, message: 'Internal service error' };
    }
});

ipcMain.handle('delete-account', async (event, { id, password }) => {
    try {
        const { getSession, isAdmin } = require('../utils/session');
        const session = getSession();
        if (!session) return { success: false, message: 'Not logged in' };

        // Users can only delete their own account unless they are admin
        if (!isAdmin() && session.id !== id) {
            return { success: false, message: 'Unauthorized' };
        }

        const user = await UserModel.find(id);
        if (!user) return { success: false, message: 'User not found' };
        
        const isValid = await UserModel.verifyPassword(user, password);
        if (!isValid) return { success: false, message: 'Invalid password' };

        await UserModel.delete(id);
        broadcastChange('users', 'delete', { id });
        return { success: true };
    } catch (error) {
        return { success: false, message: 'Internal service error' };
    }
});

ipcMain.handle('get-all-users', async () => {
    try {
        if (!isAdmin()) return { success: false, message: 'Unauthorized' };
        const users = await UserModel.findAll();
        // Return without passwords
        // Return mapped users with name and status
        const safeUsers = users.map(u => {
            const { password, ...rest } = u;
            return {
                ...rest,
                name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username,
                status: u.status || 'Active' // Default to Active if not present
            };
        });
        return { success: true, data: safeUsers };
    } catch (error) {
        return { success: false, message: 'Internal service error' };
    }
});

ipcMain.handle('add-user', async (event, userData) => {
    try {
        if (!isAdmin()) return { success: false, message: 'Unauthorized' };
        // Basic minimal add-user if not going through student/instructor specific flows
        // Hash password handled in UserModel.create
        const newUser = await UserModel.create(userData);
        const { password, ...rest } = newUser;
        broadcastChange('users', 'create', rest);
        return { success: true, data: rest };
    } catch (error) {
        return { success: false, message: 'Internal service error' };
    }
});

ipcMain.handle('delete-user', async (event, { id, role }) => {
    try {
        if (!isAdmin()) return { success: false, message: 'Unauthorized' };
        if (role === 'student') {
            await StudentModel.delete(id); // Should cascade or handle user deletion logic inside
        } else if (role === 'instructor') {
            await InstructorModel.delete(id);
        }
        await UserModel.delete(id);
        broadcastChange('users', 'delete', { id });
        return { success: true };
    } catch (error) {
        return { success: false, message: 'Internal service error' };
    }
});
