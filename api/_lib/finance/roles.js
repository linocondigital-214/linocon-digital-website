// Who can do what in the finance app. Only the owner can sign in for now; the
// bookkeeper role is here so a limited login can be added later without
// changing every handler: a bookkeeper can view and add records, but not
// change or delete them, and never touches settings or access.
export const PERMISSIONS = {
  owner: new Set(['view', 'add', 'edit', 'delete', 'settings', 'access', 'export']),
  bookkeeper: new Set(['view', 'add', 'export']),
}

export const can = (role, action) => Boolean(PERMISSIONS[role]?.has(action))
