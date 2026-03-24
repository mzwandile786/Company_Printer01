import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Added
import { CommonModule } from '@angular/common'; // Added
import { DesignationService } from '../services/designation'; // Ensure this path is correct
import { LoadingContainer } from '../loading-container/loading-container';
import { timeout, finalize, delay } from 'rxjs/operators';

export interface Designation {
  DesignationID?: number;
  DesignationName: string;
}

@Component({
  selector: 'app-designation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
   LoadingContainer,
  ],
  templateUrl: './designation-dialog.html',
})
export class DesignationDialog {
  private userService = inject(DesignationService);
  private snackBar = inject(MatSnackBar);
  private isChanged = false;
   isLoading = false;

  designation: Designation = {
    DesignationName: ''
  };

  constructor(
    public dialogRef: MatDialogRef<DesignationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Designation | null
  ) {
    if (data) {
      this.designation = { ...data };
    }
  }


save() {
  // 1. Define Snackbar Position (to keep it consistent with printers)
  const snackPosition = {
    horizontalPosition: 'right' as const,
    verticalPosition: 'top' as const
  };

  // 2. Add Validation Check (similar to printers onSave)
  const name = this.designation?.DesignationName;
  if (!name || typeof name !== 'string' || !name.trim()) {
    this.snackBar.open('Please fill all required fields!', 'OK', {
      duration: 3000,
      panelClass: ['error-snackbar'], // Matches your error style
      ...snackPosition
    });
    return;
  }

  const isUpdate = !!this.designation.DesignationID;
  const dataToSave = { ...this.designation };

  if (!isUpdate) {
    this.resetForm(); 
  }

  // Wrap the 'true' state in setTimeout to stop the NG0100 error
  setTimeout(() => {
    this.isLoading = true;
  }, 0);

  const request$ = isUpdate 
    ? this.userService.updateDesignation(dataToSave)
    : this.userService.createDesignation(dataToSave);

  request$.pipe(
    delay(800), 
    finalize(() => {
      setTimeout(() => {
        this.isLoading = false;
      }, 0);
    })
  ).subscribe({
    next: () => {
      this.snackBar.open(
        isUpdate ? 'Designation updated successfully!' : 'Designation added successfully!', 
        'OK', 
        {
          duration: 3000,
          panelClass: ['blue-snackbar'],
          ...snackPosition
        }
      );

      if (isUpdate) {
        this.dialogRef.close(true);
      } else {
        this.isChanged = true;
      }
    },
    error: (err) => {
      console.error('Operation failed', err);
      if (!isUpdate) { this.designation = dataToSave; }
      this.snackBar.open('Failed to process designation.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
        ...snackPosition
      });
    }
  });
}




  resetForm() {
    this.designation = {
      DesignationName: ''
    };
  }

  cancel() {
   
    this.dialogRef.close(this.isChanged);
  }
}