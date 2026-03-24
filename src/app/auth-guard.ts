import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const user = localStorage.getItem('currentUser');

  // 1. If no user, redirect to login
  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  try {
    // 2. Parse the user safely
    const currentUser = JSON.parse(user);
    const role = currentUser?.role || 'User'; // Default role if missing

    // 3. Check allowed roles from route data
    const allowedRoles = route.data?.['roles'] as string[];

    if (!allowedRoles || allowedRoles.includes(role)) {
      return true;
    }

    // 4. Role not authorized - redirect to a safe page
    router.navigate(['/printers']);
    return false;

  } catch (error) {
    // 5. If JSON.parse fails (e.g., old data in localStorage), clear it and go to login
    console.error('Auth Guard Error: Invalid user data');
    localStorage.removeItem('currentUser');
    router.navigate(['/login']);
    return false;
  }
};