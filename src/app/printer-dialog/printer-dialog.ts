import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { PrinterService, Printer, PrinterMake } from '../services/printer';

@Component({
  selector: 'app-printer-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './printer-dialog.html',
  styleUrls: ['./printer-dialog.css']
})
export class PrinterDialog implements OnInit {
  printerForm: FormGroup;
  printerMakes: PrinterMake[] = [];
  isChanged = false;

  private printerService = inject(PrinterService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  constructor(
    public dialogRef: MatDialogRef<PrinterDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Printer | null
  ) {
    this.printerForm = this.fb.group({
      PrinterName: [data?.PrinterName || '', Validators.required],
      PrinterMakeID: [data?.PrinterMakeID || null, Validators.required],
      FolderToMonitor: [data?.FolderToMonitor || '', Validators.required],
      FileOutput: [data?.FileOutput || '', Validators.required],    // 🔹 now required
      OutputType: [data?.OutputType || '', Validators.required],    // 🔹 now required
      Active: [data?.Active ?? true, Validators.requiredTrue]       // 🔹 required to be checked
    });
  }

  ngOnInit(): void {
    this.loadPrinterMakes();
  }

  loadPrinterMakes() {
    this.printerService.getPrinterMakes().subscribe({
      next: (res: PrinterMake[]) => this.printerMakes = res,
      error: (err) => console.error('Failed to load printer makes', err)
    });
  }

  

onSave() {

  const snackPosition = {
    horizontalPosition: 'right' as const,
    verticalPosition: 'top' as const
  };

  if (this.printerForm.invalid) {
    this.snackBar.open('Please fill all required fields!', 'OK', {
      duration: 3000,
      panelClass: ['error-snackbar'],
      ...snackPosition
    });
    return;
  }

  // 🔹 Merge EngenPrintersID for update
  const formValue: Printer = {
    ...this.printerForm.value,
    EngenPrintersID: this.data?.EngenPrintersID ?? 0
  };

  const isUpdate = !!this.data?.EngenPrintersID;

  if (isUpdate) {
    this.printerService.updatePrinter(formValue).subscribe({
      next: () => {
        this.snackBar.open('Printer updated successfully!', 'OK', {
          duration: 3000,
          panelClass: ['blue-snackbar'],
          ...snackPosition
        });
        this.isChanged = true;
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Update failed', err);
        this.snackBar.open('Failed to update printer.', 'Close', {
          duration: 3000,
          panelClass: ['red-snackbar'],
          ...snackPosition
        });
      }
    });

  } else {

    this.snackBar.open('Saving printer...', '', {
      duration: 1000,
      ...snackPosition
    });

    this.printerService.createPrinter(formValue).subscribe({
      next: () => {
        this.snackBar.open('Printer added successfully!', 'OK', {
          duration: 3000,
          panelClass: ['blue-snackbar'],
          ...snackPosition
        });

        this.isChanged = true;
        this.resetForm();
      },
      error: (err) => {
        console.error('Save failed', err);
        this.snackBar.open('Failed to save printer.', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error'],
          ...snackPosition
        });
      }
    });
  }
}

onNoClick() {
  // Tell parent that data changed so it can reload the table
  this.dialogRef.close(this.isChanged);
}

resetForm() {
  this.printerForm.reset({
    PrinterName: '',
    PrinterMakeID: null,
    FolderToMonitor: '', // default placeholder path
    FileOutput: '',      // default placeholder path
    OutputType: '',
    Active: true
  });
}
}