# SAICC Security Notes

- Demo authentication uses HTTP-only session cookies.
- Passwords are stored with salted scrypt hashes.
- Navigation and sensitive actions are role-gated.
- Data access is tenant-scoped through the service layer.
- Audit logs capture governance actions such as incident conversion and tool status changes.
- Full prompt content is not stored by default.
