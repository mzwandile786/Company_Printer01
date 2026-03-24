import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route) => {

  const router = inject(Router);
  const user = localStorage.getItem('currentUser');

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  const currentUser = JSON.parse(user);
  const role = currentUser.role;

  // If route has allowed roles
  const allowedRoles = route.data?.['roles'];

  if (!allowedRoles || allowedRoles.includes(role)) {
    return true;
  }

  // Not allowed
  router.navigate(['/printers']);
  return false;
};
