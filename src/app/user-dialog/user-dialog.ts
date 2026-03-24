import { Component, Inject, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { UserService, User } from '../services/user';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { timeout, finalize, delay } from 'rxjs/operators';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
      MatIconModule 
  ],
  templateUrl: './user-dialog.html',
  styleUrls: ['./user-dialog.css']
})
export class UserDialog implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);

  form!: FormGroup;
  designations: any[] = [];
  isEdit = false;
// PASSWORD TOGGLE
isLoading = false;

hidePassword = true;
hideConfirmPassword = true;

  constructor(
    public dialogRef: MatDialogRef<UserDialog>,
    @Inject(MAT_DIALOG_DATA) public passedData: User | null
  ) {}

  // ================================
  // INIT
  // ================================

ngOnInit(): void {
  this.isEdit = !!this.passedData?.UserID;
  this.buildForm();
  this.loadDesignations();



  if (this.passedData) {
    this.form.patchValue(this.passedData);
  }
   // ✅ REAL-TIME password match validation
  if (!this.isEdit) {
    this.form.get('Password')?.valueChanges.subscribe(() => {
      this.form.updateValueAndValidity();
    });

    this.form.get('ConfirmPassword')?.valueChanges.subscribe(() => {
      this.form.updateValueAndValidity();
    });
  }
}


  // ================================
  // BUILD FORM
  // ================================
buildForm() {
  this.form = this.fb.group(
    {
      UserID: [this.passedData?.UserID || 0],
      FirstName: ['', Validators.required],
      LastName: ['', Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      UserName: ['', Validators.required],

      // ✅ password optional when editing
      Password: [
        '',
        this.isEdit
          ? []
          : [
              Validators.required,
              Validators.pattern(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{5,}$/
              )
            ]
      ],

      // ✅ confirm only for create
      ConfirmPassword: ['', this.isEdit ? [] : Validators.required],

      DesignationID: [0, [Validators.required, Validators.min(1)]],
      DesignationName: ['']
    },

    // ✅ validator ONLY for create
    this.isEdit ? null : { validators: this.passwordMatchValidator }
  );
}

  // ================================
  // PASSWORD MATCH VALIDATOR
  // ================================
passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('Password');
  const confirm = group.get('ConfirmPassword');

  if (!password || !confirm) return null;

  if (!confirm.value) return null;

  if (password.value !== confirm.value) {
    confirm.setErrors({ passwordMismatch: true });
  } else {
    // remove only mismatch error but keep others if exist
    if (confirm.hasError('passwordMismatch')) {
      const errors = { ...confirm.errors };
      delete errors['passwordMismatch'];
      confirm.setErrors(Object.keys(errors).length ? errors : null);
    }
  }

  return null;
}

  // ================================
  // LOAD DESIGNATIONS
  // ================================
  loadDesignations() {
    this.userService.getDesignations().subscribe({
      next: (res) => (this.designations = res),
      error: (err) => console.error(err)
    });
  }

  // ================================
  // DESIGNATION CHANGE
  // ================================
  onDesignationChange() {
    const selected = this.designations.find(
      (d) => d.DesignationID === this.form.value.DesignationID
    );
    if (selected) {
      this.form.patchValue({ DesignationName: selected.DesignationName });
    }
  }

onSave() {
  const snackPosition = {
    horizontalPosition: 'right' as const,
    verticalPosition: 'top' as const
  };

  this.form.markAllAsTouched();

  // ✅ Validation check similar to printers/designations
  if (this.form.invalid) {
    this.snackBar.open('Please fill all required fields correctly!', 'OK', {
      duration: 3000,
      panelClass: ['error-snackbar'],
      ...snackPosition
    });
    return;
  }

  const data: any = { ...this.form.value }; 
  const isUpdate = !!data.UserID;

  // ✅ Use setTimeout to start loading (prevents NG0100 error)
  setTimeout(() => {
    this.isLoading = true;
  }, 0);

  if (isUpdate && !data.Password) {
    delete data.Password;
  }

  const request$ = isUpdate 
    ? this.userService.updateUser(data) 
    : this.userService.createUser(data);

  request$.pipe(
    delay(800), // ✅ Consistent UI delay
    finalize(() => {
      setTimeout(() => {
        this.isLoading = false;
      }, 0);
    })
  ).subscribe({
    next: (res) => {
      this.snackBar.open(
        res?.message || (isUpdate ? 'User updated successfully' : 'User added successfully'),
        'OK',
        {
          duration: 3000,
          panelClass: ['blue-snackbar'],
          ...snackPosition
        }
      );

      if (isUpdate) {
        this.dialogRef.close(data);
      } else {
        this.form.reset();
        this.form.patchValue({ UserID: 0 });
      }
    },
    error: (err) => {
      const message = err.error?.message || (isUpdate ? 'Update failed' : 'Validation failed');
      this.snackBar.open(message, 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
        ...snackPosition
      });
    }
  });
}



  // ================================
  // CANCEL
  // ================================
  onCancel() {
    this.dialogRef.close();
  }

  // ================================
  // SNACKBAR
  // ================================
  private showSnackbar(message: string) {
    this.snackBar.open(message, 'OK', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['blue-snackbar'],  

    });
  }

  // ================================
  // HELPERS FOR TEMPLATE
  // ================================
  get f() {
    return this.form.controls;
  }
}