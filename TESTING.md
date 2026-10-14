# TRAFQUIZ 2.0 Testing Guide

## Test Suite Overview
TRAFQUIZ 2.0 includes automated integration and core workflow tests covering authentication, IPC handlers, scheduling, security, and database migrations.

## Running Tests

### Integration Tests
To execute the automated integration test suite against the SQLite test database:

```bash
NODE_ENV=test node tests/integration/run-tests.js
```

### Test Coverage
1. **Authentication Tests (`auth.test.js`)**:
   - Admin login verification
   - Password auto-upgrade hash transition

2. **Core Workflow Tests (`core.test.js`)**:
   - Student addition and retrieval
   - Instructor registration
   - Admin creation
   - Lesson scheduling
   - Fleet vehicle registration, activity logging, and issue reporting
   - Financial expense recording and transaction tracking

3. **Security Tests (`security.test.js`)**:
   - Logout & session clearing
   - User enumeration prevention (generic failure messages)
   - IDOR protection (preventing students from updating other user profiles)
   - Unauthorized access control on admin endpoints
