const { ipcMain } = require('electron');
const { UserModel } = require('../models/UserModel');
const { StudentModel } = require('../models/StudentModel');
const { InstructorModel } = require('../models/InstructorModel');
const { broadcastChange } = require('../utils/broadcast');
const { setSession, clearSession, isAdmin, isAuthenticated, getSession } = require('../utils/session');
const { verifyPasswordModern, hashPasswordModern, logAuditEvent, ROLE_PERMISSIONS } = require('../utils/auth-security');

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
            await logAuditEvent(null, username || email, 'LOGIN_FAILED', 'User', null, { reason: 'User not found' }, 'FAILURE');
            return { success: false, message: 'Invalid credentials' };
        }

        // Verify password using modern hashing module (handles legacy bcrypt + modern scrypt/argon2)
        const passwordVerification = await verifyPasswordModern(password, user.password);
        if (!passwordVerification.isValid) {
            await logAuditEvent(user.id, user.username, 'LOGIN_FAILED', 'User', user.id, { reason: 'Wrong password' }, 'FAILURE');
            return { success: false, message: 'Invalid credentials' };
        }

        // Auto-upgrade legacy bcrypt password hashes transparently on login
        if (passwordVerification.needsRehash) {
            try {
                const newHash = await hashPasswordModern(password);
                await UserModel.updatePassword(user.id, newHash);
                console.log(`[Security Auto-Upgrade] Transparently upgraded password hash for user ID ${user.id}`);
            } catch (rehashErr) {
                console.error('Failed to auto-upgrade password hash:', rehashErr);
            }
        }

        setSession(user);
        await logAuditEvent(user.id, user.username, 'LOGIN_SUCCESS', 'User', user.id);

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
            permissions: ROLE_PERMISSIONS[user.role] || [],
            roleData,
            token: 'electron-local-token' 
        };
    } catch (error) {
        console.error('Login system error:', error);
        return { success: false, message: `Authentication service error: ${error.message}` };
    }
});

ipcMain.handle('get-current-user', async () => {
    const session = getSession();
    if (!session) return { success: false, message: 'Unauthorized' };
    const user = await UserModel.find(session.id);
    if (!user) return { success: false, message: 'User not found' };
    const { password: _, ...userWithoutPassword } = user;
    return {
        success: true,
        user: userWithoutPassword,
        permissions: ROLE_PERMISSIONS[user.role] || []
    };
});

ipcMain.handle('get-user-permissions', async () => {
    const session = getSession();
    if (!session) return { success: false, message: 'Unauthorized', permissions: [] };
    return {
        success: true,
        role: session.role,
        permissions: ROLE_PERMISSIONS[session.role] || []
    };
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

        if (id !== session.id && session.role !== 'admin') {
            return { success: false, message: 'Unauthorized: Cannot update other users' };
        }

        const result = await UserModel.update(id, payload);
        await logAuditEvent(session.id, session.username, 'UPDATE_USER', 'User', id);
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

        if (id !== session.id && session.role !== 'admin') {
            return { success: false, message: 'Unauthorized' };
        }

        const newHash = await hashPasswordModern(password);
        await UserModel.updatePassword(id, newHash);
        await logAuditEvent(session.id, session.username, 'CHANGE_PASSWORD', 'User', id);
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('delete-account', async (event, { id, password }) => {
    try {
        const session = getSession();
        if (!session) return { success: false, message: 'Unauthorized' };

        if (id !== session.id && session.role !== 'admin') {
            return { success: false, message: 'Unauthorized' };
        }

        const user = await UserModel.find(id);
        if (!user) return { success: false, message: 'User not found' };
        
        const verification = await verifyPasswordModern(password, user.password);
        if (!verification.isValid) return { success: false, message: 'Invalid password' };

        await UserModel.delete(id);
        await logAuditEvent(session.id, session.username, 'DELETE_ACCOUNT', 'User', id);
        broadcastChange('users', 'delete', { id });
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('logout', async () => {
    const session = getSession();
    if (session) {
        await logAuditEvent(session.id, session.username, 'LOGOUT', 'User', session.id);
    }
    clearSession();
    return { success: true };
});

ipcMain.handle('get-all-users', async () => {
    try {
        if (!isAdmin()) {
            return { success: false, message: 'Unauthorized: Admin access required' };
        }
        const users = await UserModel.findAll();
        const safeUsers = users.map(u => {
            const { password, ...rest } = u;
            return {
                ...rest,
                name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username,
                status: u.status || 'Active'
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

        if (userData.password) {
            userData.password = await hashPasswordModern(userData.password);
        }

        const newUser = await UserModel.create(userData);
        const { password, ...rest } = newUser;
        await logAuditEvent(getSession()?.id, getSession()?.username, 'ADD_USER', 'User', newUser.id);
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
            await StudentModel.delete(id);
        } else if (role === 'instructor') {
            await InstructorModel.delete(id);
        }
        await UserModel.delete(id);
        await logAuditEvent(getSession()?.id, getSession()?.username, 'DELETE_USER', 'User', id);
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
            return { success: true, message: 'If this account exists, a password reset email will be sent' };
        }

        console.log(`Password reset requested for user: ${username}`);
        await logAuditEvent(user.id, username, 'PASSWORD_RESET_REQUEST', 'User', user.id);
        
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

        const hashed = await hashPasswordModern(newPassword);
        await UserModel.updatePassword(user.id, hashed);
        await logAuditEvent(user.id, username, 'PASSWORD_RESET_COMPLETE', 'User', user.id);
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
