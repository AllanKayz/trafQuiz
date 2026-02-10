let currentSession = null;

function setSession(user) {
    currentSession = {
        id: user.id,
        username: user.username,
        role: user.role
    };
}

function getSession() {
    return currentSession;
}

function clearSession() {
    currentSession = null;
}

function isAuthenticated() {
    return !!currentSession;
}

function hasRole(role) {
    return currentSession && currentSession.role === role;
}

function isAdmin() {
    return hasRole('admin');
}

module.exports = {
    setSession,
    getSession,
    clearSession,
    isAuthenticated,
    hasRole,
    isAdmin
};
