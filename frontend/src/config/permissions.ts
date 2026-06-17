import type { UserRole } from '../types';

/**
 * Role-based access control for the application menus & routes.
 *
 * Hierarchy (most → least access):
 *   SUPER_ADMIN  → full access to everything
 *   FARM_MANAGER → full operational access
 *   ACCOUNTANT   → finance / records oriented
 *   VETERINARIAN → animal health oriented
 *   WORKER       → only what they need: their produce, records & commerce
 *
 * `'*'` means every route is allowed. Otherwise a route is visible only if its
 * path is listed. `/settings` is allowed for everyone so each member can at
 * least edit their own account (managers additionally get the Team/CMS tabs).
 */
export const ROLE_ROUTES: Record<UserRole, string[] | '*'> = {
    SUPER_ADMIN: '*',
    FARM_MANAGER: '*',
    ACCOUNTANT: ['/', '/commerce', '/produce', '/inventory', '/workforce', '/settings'],
    VETERINARIAN: ['/', '/livestock', '/produce', '/settings'],
    WORKER: ['/', '/produce', '/crops', '/livestock', '/commerce', '/settings'],
};

const DEFAULT_ROUTES = ['/', '/settings'];

function allowedFor(role?: UserRole): string[] | '*' {
    if (!role) return DEFAULT_ROUTES;
    return ROLE_ROUTES[role] ?? DEFAULT_ROUTES;
}

/** Whether a role may access a given route path. */
export function canAccess(role: UserRole | undefined, path: string): boolean {
    const allowed = allowedFor(role);
    if (allowed === '*') return true;
    return allowed.includes(path);
}

/** Filter a list of nav items (objects with a `path`) down to those the role can see. */
export function filterNavByRole<T extends { path: string }>(items: T[], role?: UserRole): T[] {
    const allowed = allowedFor(role);
    if (allowed === '*') return items;
    return items.filter((item) => allowed.includes(item.path));
}

/** Roles that can manage other team members (add/edit/remove). */
export const MANAGER_ROLES: UserRole[] = ['SUPER_ADMIN', 'FARM_MANAGER'];

export function canManageTeam(role?: UserRole): boolean {
    return !!role && MANAGER_ROLES.includes(role);
}
