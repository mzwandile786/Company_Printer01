import { Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-container',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './loading-container.html',
  styleUrl: './loading-container.css',
})
export class LoadingContainer {
  loading = input<boolean>(false);
  size = input<number>(40);
}