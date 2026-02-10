## 2026-02-10 - [IPC Authorization and IDOR Protection]
**Vulnerability:** Most IPC handlers were completely unprotected, allowing any user (or even unauthenticated processes if they could send IPC messages) to perform administrative actions, access sensitive financial data, or modify other users' information.
**Learning:** In Electron applications, the trust boundary between the Renderer and Main processes is critical. Developers often assume that since the UI doesn't show a button, the underlying IPC handler is safe. However, the Renderer is untrusted and can be compromised or manipulated to send arbitrary IPC messages.
**Prevention:**
1. Always maintain a session state in the Main process that is updated upon successful authentication.
2. Implement an authorization layer in the Main process for all sensitive IPC handlers to verify authentication and roles.
3. Implement ownership checks (IDOR protection) to ensure users can only access or modify their own data (e.g., `if (id !== session.id && !isAdmin())`).
4. Standardize error messages to generic responses to prevent user enumeration.
