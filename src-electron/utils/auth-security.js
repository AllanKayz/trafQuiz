const { setSession, clearSession, getSession } = require('../utils/session');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../db');
const User = require('../models/UserModel');

// Argon2 / Scrypt Password Hashing with automatic fallback and transparent upgrade
async function hashPasswordModern(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`scrypt$${salt}$${derivedKey.toString('hex')}`);
    });
  });
}

async function verifyPasswordModern(password, storedHash) {
  if (!storedHash) return false;

  // Standard bcrypt hash verification
  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$') || storedHash.startsWith('$2y$')) {
    const isMatch = await bcrypt.compare(password, storedHash);
    return { isValid: isMatch, needsRehash: isMatch }; // Rehash legacy bcrypt to modern scrypt/argon format
  }

  // Modern scrypt format: scrypt$salt$hash
  if (storedHash.startsWith('scrypt$')) {
    const [, salt, originalHash] = storedHash.split('$');
    return new Promise((resolve) => {
      crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
        if (err) return resolve({ isValid: false, needsRehash: false });
        const isValid = derivedKey.toString('hex') === originalHash;
        resolve({ isValid, needsRehash: false });
      });
    });
  }

  // Fallback direct bcrypt
  const isValid = await bcrypt.compare(password, storedHash);
  return { isValid, needsRehash: false };
}

// Granular RBAC Permissions Mapping
const ROLE_PERMISSIONS = {
  admin: ['*'],
  instructor: [
    'students.view',
    'lessons.view',
    'lessons.update',
    'vehicles.view',
    'vehicles.report_issue',
    'exams.view_results'
  ],
  student: [
    'exams.take',
    'exams.view_results',
    'lessons.view_own',
    'payments.view_own',
    'profile.view_own'
  ]
};

function hasPermission(userRole, permission) {
  if (!userRole) return false;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  if (permissions.includes('*')) return true;
  return permissions.includes(permission);
}

// Log security audit events
async function logAuditEvent(userId, username, action, entity, entityId, details = null, status = 'SUCCESS') {
  try {
    await db.run(
      `INSERT INTO audit_logs (user_id, username, action, entity, entity_id, details, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, DATETIME('now'))`,
      [userId || null, username || 'system', action, entity, String(entityId || ''), details ? JSON.stringify(details) : null, status]
    );
  } catch (err) {
    console.error('Failed to log audit event:', err);
  }
}

module.exports = {
  hashPasswordModern,
  verifyPasswordModern,
  ROLE_PERMISSIONS,
  hasPermission,
  logAuditEvent
};
