import { Component, inject, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { DesignationService, Designation } from '../services/designation';
import { DesignationDialog } from '../designation-dialog/designation-dialog';
import { LoadingContainer } from '../loading-container/loading-container';

import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-designations',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatSnackBarModule,
    LoadingContainer
  ],
  templateUrl: './designations.html',
  styleUrl: './designations.css'
})
export class Designations implements OnInit, AfterViewInit {

  private designationService = inject(DesignationService);
  private dialog = inject(MatDialog);
   private snackBar = inject(MatSnackBar);
   isLoading = false;

  displayedColumns: string[] = [
    'DesignationName',
     'Edit',
     'Delete'
  ];

  // 1. Define the wildcard filter object
  columnFilters = {
    DesignationName: ''
  };

  dataSource = new MatTableDataSource<Designation>([]);
  allDesignations: Designation[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.loadDesignations();
    this.setupFilterPredicate();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  // 3. Setup the wildcard matching logic
  setupFilterPredicate() {
    this.dataSource.filterPredicate = (data: Designation, filter: string) => {
      const searchTerms = JSON.parse(filter);
      
      const match = (val: string, query: string) => {
        if (!query) return true;
        const text = val ? val.toLowerCase() : '';
        const search = query.toLowerCase();
        
        if (search.includes('*')) {
          const escapedSearch = search.replace(/[.+^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp('^' + escapedSearch.split('*').join('.*') + '$');
          return regex.test(text);
        }
        return text.includes(search);
      };

      return match(data.DesignationName, searchTerms.DesignationName);
    };
  }

  // 4. Triggered on keyup in the HTML
  applyColumnFilter() {
    this.dataSource.filter = JSON.stringify(this.columnFilters);
  }

loadDesignations() {
  this.isLoading = true; // start spinner

  this.designationService.getDesignations().subscribe({
    next: (data: Designation[]) => {

      // Delay UI update by 3 seconds
      setTimeout(() => {
        this.allDesignations = data;
        this.dataSource.data = data;

        if (this.paginator) {
          this.paginator.firstPage();
        }

        this.isLoading = false; // stop spinner AFTER delay
      }, 500); // 👈 change time here

    },
    error: (err) => {
      console.error(err);
      this.isLoading = false; // stop spinner if error
    }
  });
}

  openDialog(designation?: Designation) {
    const dialogRef = this.dialog.open(DesignationDialog, {
      width: '500px', 
      minHeight: '250px', 
  panelClass: 'custom-dialog-container',
      data: designation ? { ...designation } : {}
    });

  dialogRef.afterClosed().subscribe(result => {
    // 1. If result is true, it means new items were added inside the dialog
    if (result === true) {
      this.loadDesignations();
    } 
    // 2. If result is an object with an ID, it's an Update request
    else if (result && result.DesignationID) {
      this.designationService.updateDesignation(result).subscribe({
        next: () => this.loadDesignations(),
        error: (err) => console.error('Update failed', err)
      });
    }
    // 3. If result is null/undefined, the user just clicked cancel without changes
  });
}


deleteDesignation(id: number) {
  // 1. Open your custom ConfirmDialog
  const dialogRef = this.dialog.open(ConfirmDialog, {
    width: '400px',
    data: { message: 'Are you sure you want to delete this designation?' }
  });

  // 2. Listen for the result (Confirm = true, Cancel = false)
  dialogRef.afterClosed().subscribe(result => {
    if (result === true) {
      
      this.isLoading = true; // ✅ start loading

      this.designationService.deleteDesignation(id).subscribe(() => {

        this.snackBar.open('Designation deleted successfully!', 'OK', {
          duration: 500,
          verticalPosition: 'top',
          horizontalPosition: 'right',
          panelClass: ['blue-snackbar']
        });

        this.loadDesignations(); // reload handles loading stop

      }, error => {
        this.isLoading = false; // ✅ stop loading on error

        this.snackBar.open('Failed to delete designation.', 'OK', {
          duration: 1000,
          verticalPosition: 'top',
          horizontalPosition: 'right',
          panelClass: ['snackbar-error']
        });
      });
    }
  });
}}
