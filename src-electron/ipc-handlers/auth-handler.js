const { ipcMain } = require('electron');
const { UserModel } = require('../models/UserModel');
const { StudentModel } = require('../models/StudentModel');
const { InstructorModel } = require('../models/InstructorModel');
const { broadcastChange } = require('../utils/broadcast');
const { setSession, clearSession, isAdmin, isAuthenticated, getSession } = require('../utils/session');

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
            return { success: false, message: 'Invalid credentials' };
        }

        const isValid = await UserModel.verifyPassword(user, password);
        if (!isValid) {
            return { success: false, message: 'Invalid credentials' };
        }

        setSession(user);

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
        if (!isAuthenticated()) return { success: false, message: 'Unauthorized' };
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
        const session = getSession();
        if (!session) return { success: false, message: 'Unauthorized' };
        const { id, ...payload } = data;

        // Ownership check: users can only update themselves, unless they are an admin
        if (id !== session.id && session.role !== 'admin') {
            return { success: false, message: 'Unauthorized: Cannot update other users' };
        }

        const result = await UserModel.update(id, payload);
        broadcastChange('users', 'update', result);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('update-user-password', async (event, { id, password }) => {
    try {
        const session = getSession();
        if (!session) return { success: false, message: 'Unauthorized' };

        // Ownership check
        if (id !== session.id && session.role !== 'admin') {
            return { success: false, message: 'Unauthorized' };
        }

        await UserModel.updatePassword(id, password);
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('delete-account', async (event, { id, password }) => {
    try {
        const session = getSession();
        if (!session) return { success: false, message: 'Unauthorized' };

        // Ownership check
        if (id !== session.id && session.role !== 'admin') {
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
        return { success: false, message: error.message };
    }
});

ipcMain.handle('logout', async () => {
    clearSession();
    return { success: true };
});

ipcMain.handle('get-all-users', async () => {
    try {
        if (!isAdmin()) {
            return { success: false, message: 'Unauthorized: Admin access required' };
        }
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
        return { success: false, message: error.message };
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
        return { success: false, message: error.message };
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
        return { success: false, message: error.message };
    }
});

ipcMain.handle('forgot-password', async (event, { username }) => {
    try {
        if (!username) {
            return { success: false, message: 'Username is required' };
        }

        const user = await UserModel.findByUsername(username);
        if (!user) {
            // Don't reveal if user exists (security best practice)
            return { success: true, message: 'If this account exists, a password reset email will be sent' };
        }

        // In a real application, you would:
        // 1. Generate a reset token
        // 2. Save it with an expiration time
        // 3. Send an email with the reset link
        // For now, we'll just return success message
        console.log(`Password reset requested for user: ${username}`);
        
        return { 
            success: true, 
            message: 'If this account exists, a password reset email will be sent to the associated email address',
            email: user.email ? `${user.email.substring(0, 3)}***@${user.email.split('@')[1]}` : 'your registered email'
        };
    } catch (error) {
        console.error('Forgot password error:', error);
        return { success: false, message: `Service error: ${error.message}` };
    }
});

ipcMain.handle('reset-password', async (event, { username, newPassword, resetToken }) => {
    try {
        if (!username || !newPassword) {
            return { success: false, message: 'Username and new password are required' };
        }

        if (newPassword.length < 6) {
            return { success: false, message: 'Password must be at least 6 characters long' };
        }

        const user = await UserModel.findByUsername(username);
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        // In a real application, you would:
        // 1. Verify the reset token
        // 2. Check if token is expired
        // 3. Update the password only if token is valid
        
        // For now, allow password reset with just username validation
        await UserModel.updatePassword(user.id, newPassword);
        broadcastChange('users', 'update', { id: user.id });
        
        return { 
            success: true, 
            message: 'Password has been reset successfully' 
        };
    } catch (error) {
        console.error('Reset password error:', error);
        return { success: false, message: `Service error: ${error.message}` };
    }
});
