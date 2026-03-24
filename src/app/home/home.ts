import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { LoaderService } from '../services/loader';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit {

  role = '';
  isLoading = false;

  constructor(
    private router: Router,
    private loaderService: LoaderService
  ) {

    // Route loader
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loaderService.show();
      }

      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loaderService.hide();
      }
    });

    // Subscribe to global loader
    this.loaderService.loading$.subscribe(status => {
      this.isLoading = status;
    });
  }

  ngOnInit(): void {
    const user = localStorage.getItem('currentUser');
    if (user) {
      this.role = JSON.parse(user).role;
    }
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  isAdmin(): boolean {
    return this.role === 'System Administrator';
  }
}