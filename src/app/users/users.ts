import { Component, inject, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LoadingContainer } from '../loading-container/loading-container';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';
import { UserService, User } from '../services/user';
import { UserDialog } from '../user-dialog/user-dialog';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatPaginatorModule, MatButtonModule,
    MatDialogModule, MatIconModule, FormsModule, MatCardModule,
    MatSelectModule, MatFormFieldModule,  MatSnackBarModule, LoadingContainer 
  ],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users implements OnInit, AfterViewInit {
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  isLoading = false;

  displayedColumns: string[] = ['FirstName', 'LastName', 'Email', 'UserName', 'DesignationName', 'Password', 'Edit', 'Delete'];
  dataSource = new MatTableDataSource<User>([]);
  allUsers: User[] = [];
  designations: any[] = [];
  selectedDesignation: number | null = null;

  // 1. Define the wildcard filter object for all columns
  globalFilter: string = '';


  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.loadUsers();
    this.loadDesignations();
    // 2. Setup the custom predicate
    this.setupFilterPredicate();
  }

setupFilterPredicate() {
  this.dataSource.filterPredicate = (data: any, filter: string) => {
    const search = filter.trim().toLowerCase();

    if (!search) return true;

    // Check all fields you want to search
    return (
      (data.FirstName?.toLowerCase().includes(search)) ||
      (data.LastName?.toLowerCase().includes(search)) ||
      (data.Email?.toLowerCase().includes(search)) ||
      (data.UserName?.toLowerCase().includes(search)) ||
      (data.DesignationName?.toLowerCase().includes(search))
    );
  };
}


  // 3. This combines dropdown and wildcard logic
applyGlobalFilter() {
  this.dataSource.filter = this.globalFilter;
}




  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

 loadUsers() {
  this.isLoading = true;

  this.userService.getUsers().subscribe({
    next: (data) => {

      setTimeout(() => {
        this.allUsers = data;
        this.dataSource.data = data;
        this.isLoading = false;
      }, 500); // 👈 1 second delay

    },
    error: err => {
      console.error(err);
      this.isLoading = false;
    }
  });
}

  loadDesignations() {
    this.userService.getDesignations().subscribe({
      next: (res) => this.designations = res,
      error: err => console.error(err)
    });
  }

  filterUsers() {
    this.dataSource.data = this.selectedDesignation === null 
      ? [...this.allUsers] 
      : this.allUsers.filter(u => u.DesignationID === this.selectedDesignation);
    if (this.paginator) this.paginator.firstPage();
  }

  // Modified existing methods to use the predicate
 // filterUsers() {
   // this.applyColumnFilter();
   // if (this.paginator) this.paginator.firstPage();
 // }
  
clearFilter() {

  // reset filter values
  this.selectedDesignation = null;
  this.globalFilter = '';

  // restore full dataset
  this.dataSource.data = [...this.allUsers];

  // clear material filter
  this.dataSource.filter = '';

  // reset paginator to first page
  if (this.paginator) {
    this.paginator.firstPage();
  }
}

 openDialog(user?: User) {
  const dialogRef = this.dialog.open(UserDialog, {
    width: '550px',
    minHeight: '650px',
   // maxHeight: '90vh',
    // We pass a copy of the user to prevent accidental data binding 
    // or a new object if adding
    data: user ? { ...user } : { UserID: 0 }, 
    panelClass: 'custom-dialog-container'
  });

  dialogRef.afterClosed().subscribe(result => {
    /* When the dialog closes, check if a result was returned.
       If UserID > 0, it means an Update was requested.
       If no result (null), the user just clicked 'Cancel' or finished adding.
    */
    if (result && result.UserID > 0) {
      // Scenario: Update existing user
      this.userService.updateUser(result).subscribe({
        next: () => this.loadUsers(),
        error: err => console.error('Update failed', err)
      });
    } else {
      // Scenario: Dialog was closed after adding new users or clicking cancel.
      // We refresh the list to ensure any users added while the dialog 
      // was open are now visible in the table.
      this.loadUsers();
    }
  });
}


deleteUser(id: number) {
  // 1. Open the custom blue-themed dialog
  const dialogRef = this.dialog.open(ConfirmDialog, {
    width: '400px',
    data: { message: 'Are you sure you want to delete this user?' }
  });

  // 2. Listen for the result
  dialogRef.afterClosed().subscribe(result => {
    if (result === true) {
      
      this.isLoading = true;

      this.userService.deleteUser(id).subscribe({
        next: () => {

          setTimeout(() => {

            this.snackBar.open('User deleted successfully', 'OK', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['blue-snackbar']
            });

            this.loadUsers();

          }, 500);

        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;

          const message = err.error?.message || 'Delete failed';
          this.snackBar.open(message, 'OK', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['blue-snackbar'] // Consider changing this to 'error-snackbar' for failures
          });
        }
      });
    }
  });
}}