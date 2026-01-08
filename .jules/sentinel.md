## 2024-05-22 - [CRITICAL] Insecure Role Fallback
**Vulnerability:** Found that both the frontend (`AuthProvider.tsx`) and the database RLS helper (`get_my_role` in `initial_schema.sql`) defaulted to the `DOCENTE` (Teacher) role when a user profile was missing or an error occurred.
**Learning:** "Fail Open" defaults are dangerous. A missing profile should result in *no* access, not *default* access. The database function `coalesce(_role, 'docente')` meant any authenticated user (even without a profile) could read all student data because of the policy `Staff view all students`.
**Prevention:** Always use "Fail Closed" logic. Default to `null` or a restricted guest role. In SQL, ensure role retrieval functions return `null` or raise an error if the role is indeterminate, rather than guessing a privileged role.

## 2024-05-23 - Unnecessary Secret Exposure in Bundle
**Vulnerability:** The `vite.config.ts` was configured to inject `GEMINI_API_KEY` into the client-side bundle via `define` as `process.env.API_KEY`, even though the main application code did not use it.
**Learning:** Build tools like Vite can inadvertently expose secrets if `define` or similar replacement plugins are used with environment variables. Even if the variable is meant for a specific part of the codebase, if it's in the main config, it might be accessible in the global scope or replaced in files that shouldn't have it.
**Prevention:**
1. Audit `vite.config.ts` and similar build configs for `define` or environment variable plugins.
2. Only expose environment variables prefixed with `VITE_` (or equivalent) explicitly needed by the client.
3. Remove any unused environment variable injections.
