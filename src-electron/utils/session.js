let currentSession = null;

function setSession(user) {
    currentSession = user;
}

function getSession() {
    return currentSession;
}

function clearSession() {
    currentSession = null;
}

function isAdmin() {
    return currentSession && currentSession.role === 'admin';
}

function isInstructor() {
    return currentSession && (currentSession.role === 'instructor' || currentSession.role === 'admin');
}

module.exports = { setSession, getSession, clearSession, isAdmin, isInstructor };
