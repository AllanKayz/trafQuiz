# TRAFQUIZ 2.0 Security Architecture & Policies

## Overview
TRAFQUIZ 2.0 follows defense-in-depth security principles for desktop application environments.

## Security Controls Implemented

1. **Electron Hardening**:
   - `contextIsolation: true`
   - `nodeIntegration: false`
   - Strict Content Security Policy (CSP) headers applied on all web requests
   - Allowlisted IPC channels in `preload.js` with rejection of unauthorized channels

2. **Authentication & Password Security**:
   - Modern `Scrypt` / `Argon2` password hashing with dynamic salt generation
   - Legacy `bcrypt` password compatibility with transparent auto-rehash upgrade on login
   - Generic error messages on login failures to prevent account enumeration

3. **Authorization & IDOR Protection**:
   - Strict ownership checks on profile/user modification endpoints (`update-user`, `update-user-password`)
   - Granular RBAC permissions enforced at IPC handler level (`admin`, `instructor`, `student`)

4. **Audit Logging**:
   - Centralized `audit_logs` persistence for logins, logouts, user updates, password resets, and deletions

5. **Backup & Integrity Verification**:
   - Automated database backups (`create-backup`) with timestamping and `PRAGMA quick_check;` database health verification (`verify-database-integrity`).
