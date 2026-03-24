import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgZone } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { timeout, finalize } from 'rxjs/operators';
import { LoadingContainer } from '../loading-container/loading-container';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    LoadingContainer
  ],
})
export class Login {

  LoginObj = { userName: '', password: '' };
  isLoading = false;
  passwordVisible = false;

  http = inject(HttpClient);
  router = inject(Router);
  snackBar = inject(MatSnackBar);
   // Inject NgZone
  zone = inject(NgZone);

private cdr = inject(ChangeDetectorRef); // Inject this

 

onSubmit() {
  // Use a Promise to defer the state change slightly
  Promise.resolve().then(() => {
    this.isLoading = true;
  });

  if (!this.LoginObj.userName || !this.LoginObj.password) {
    this.showSnackBar('Username and password required');
    // Ensure we reset loading if validation fails
    this.isLoading = false; 
    return;
  }

  this.http.post(
    'https://localhost:7273/api/User/login',
    this.LoginObj,
    { responseType: 'text' }
  )
  .pipe(
    timeout(5000),
    finalize(() => {
      // Finalize runs on completion OR error
      this.isLoading = false;
      this.cdr.markForCheck(); 
    })
  )
  .subscribe({
    next: (res: string) => {
      localStorage.setItem('currentUser', res);
      this.router.navigate(['/printers']);
    },
    error: (err) => {
      let message = 'Login failed. Please try again.';
      if (err.status === 401) {
        message = 'Invalid username or password.';
      } else if (err.name === 'TimeoutError') {
        message = 'Server not responding. API may be offline.';
      }
      this.showSnackBar(message);
    }
  });
}

// Helper to keep code clean
private showSnackBar(message: string) {
  this.snackBar.open(message, 'Close', {
    duration: 4000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
    panelClass: ['snackbar-error']
  });
}}




  /*
 onSubmit() {
   const start = Date.now();

  this.isLoading= true; // show spinner

  this.http.post<any>(
    'https://localhost:7273/api/User/login',
    this.LoginObj
  ).subscribe({
    next: (res) => {

      // Save full response
      localStorage.setItem('currentUser', JSON.stringify(res));

      const role = res.role;

      // Role-based redirect
      if (role === 'System Administrator') {
        this.router.navigate(['/printers']);
      } 
      else if (role === 'Manager') {
        this.router.navigate(['/printers']);
      } 
      else if (role === 'Level 1 Employee') {
        this.router.navigate(['/printers']);
      }
      this.isLoading = false;
    },
    error: () => {
      alert('Login Failed');
    }
  });
}*/

