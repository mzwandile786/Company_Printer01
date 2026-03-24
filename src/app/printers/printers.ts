import { Component, inject, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DatePipe, CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PrinterService, Printer, PrinterMake } from '../services/printer';
import { PrinterDialog } from '../printer-dialog/printer-dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { LoadingContainer } from '../loading-container/loading-container';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-printers',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule, 
    MatPaginatorModule, 
    MatButtonModule, 
    MatDialogModule, 
    DatePipe,
    MatIconModule, 
    FormsModule, 
    MatFormFieldModule, 
    MatSelectModule, 
    MatDatepickerModule,
    MatInputModule, 
    MatNativeDateModule,
    MatCheckboxModule,
   LoadingContainer
     
  ], 
  templateUrl: './printers.html',
  styleUrl: './printers.css'
})
export class Printers implements OnInit, AfterViewInit {
  private printerService = inject(PrinterService);
  private dialog = inject(MatDialog);
    private snackBar = inject(MatSnackBar);
    // 2. Define the loading state
  isLoading = false;

   currentUserRole: string = '';
  isLevel1: boolean = false;

  displayedColumns: string[] = [
    'select', 
    'PrinterName',
    'PrinterMakeName',
    'FolderToMonitor', 
    'OutputType', 
    'FileOutput', 
    'Active', 
    'CreatedTimeStamp', 
    'Edit',
    'Delete'
  ];

  dataSource = new MatTableDataSource<Printer>([]);
  printerMakes: PrinterMake[] = [];
  
  selection = new SelectionModel<Printer>(true, []);

  filters = {
    printerMake: null as number | null,
    fromDate: null as Date | null,
    toDate: null as Date | null
  };
// For the UI Table Wildcards (Local)
globalFilter: string = '';



  @ViewChild(MatPaginator) paginator!: MatPaginator;

  get hasSelection(): boolean {
    return this.selection.selected.length > 0;
  }

  ngOnInit() {

    // 🔹 Get role from localStorage
    const user = localStorage.getItem('currentUser');
    if (user) {
      const parsedUser = JSON.parse(user);
      this.currentUserRole = parsedUser.role;
      this.isLevel1 = this.currentUserRole === 'Level 1 Employee';
    }

    // 🔹 Setup columns based on role
    this.setupColumns();

    this.loadPrinters();
    this.loadDropdowns();
    this.setupFilterPredicate();

    this.printerService.refreshNeeded$.subscribe(() => {
      this.loadPrinters();
    });
  }

    // 🔥 Dynamically control columns
  setupColumns() {
    if (this.isLevel1) {
      this.displayedColumns = [
        'PrinterName',
        'PrinterMakeName',
        'FolderToMonitor',
        'OutputType',
        'FileOutput',
        'Active',
        'CreatedTimeStamp',
        'Edit'
      ];
    } else {
      this.displayedColumns = [
        'select',
        'PrinterName',
        'PrinterMakeName',
        'FolderToMonitor',
        'OutputType',
        'FileOutput',
        'Active',
        'CreatedTimeStamp',
        'Edit',
        'Delete'
      ];
    }
  }



// the predicate
setupFilterPredicate() {
  this.dataSource.filterPredicate = (data: any, filter: string) => {
    const search = filter.trim().toLowerCase();
    if (!search) return true;

    return (
      (data.PrinterName?.toLowerCase().includes(search)) ||
      (data.PrinterMakeName?.toLowerCase().includes(search)) ||
      (data.FolderToMonitor?.toLowerCase().includes(search)) ||
      (data.OutputType?.toLowerCase().includes(search)) ||
      (data.FileOutput?.toLowerCase().includes(search)) ||
      (data.CreatedTimeStamp ? new Date(data.CreatedTimeStamp).toLocaleDateString().includes(search) : false)
    );
  };
}

applyGlobalFilter() {
  this.dataSource.filter = this.globalFilter;
}

  

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  // --- Selection Helpers ---
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }

  // --- Data Loading ---
  loadPrinters() {
  this.isLoading = true;

  this.printerService.getPrinters().subscribe({
    next: (data: Printer[]) => {

      setTimeout(() => {
        this.selection.clear();
        this.dataSource.data = data;

        if (this.paginator) {
          this.paginator.firstPage();
        }

        this.isLoading = false;
      }, 800); // smooth delay

    },
    error: err => {
      console.error('Error fetching printers:', err);
      this.isLoading = false;
    }
  });
}

  loadDropdowns() {
    this.printerService.getPrinterMakes().subscribe({
      next: (res: PrinterMake[]) => this.printerMakes = res,
      error: err => console.error('Error fetching makes:', err)
    });
  }

  search() {
  const from = this.filters.fromDate ? this.filters.fromDate.toISOString() : undefined;
  const to = this.filters.toDate ? this.filters.toDate.toISOString() : undefined;
  const makeId = this.filters.printerMake || undefined;

  this.isLoading = true;

  this.printerService.searchPrinters(makeId, from, to).subscribe({
    next: (data) => {

      setTimeout(() => {
        this.selection.clear();
        this.dataSource.data = data;

        if (this.paginator) {
          this.paginator.firstPage();
        }

        this.isLoading = false;
      }, 500);

    },
    error: (err) => {
      console.error('Search failed', err);
      this.isLoading = false; // 🔴 IMPORTANT FIX
    }
  });
}

 clearFilters() {
 this.filters = { printerMake: null, fromDate: null, toDate: null };
  this.globalFilter = '';
  this.dataSource.filter = '';
  this.loadPrinters();
}

  openDialog(printer?: Printer) {
    const dialogRef = this.dialog.open(PrinterDialog, {
      width: '600px',
      minHeight: '550px',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
      data: printer ? { ...printer } : { Active: true } 
    });

   dialogRef.afterClosed().subscribe(result => {
  // Scenario 1: Multiple printers were added (Dialog returned 'true')
  if (result === true) {
    this.loadPrinters();
  } 
  // Scenario 2: A single printer was edited (Dialog returned the updated Object)
  else if (result && result.EngenPrintersID) {
    this.printerService.updatePrinter(result).subscribe({
      next: () => this.loadPrinters(),
      error: (err) => console.error('Update failed', err)
    });
  }
  // Scenario 3: Result is null/undefined (User just clicked cancel) -> Do nothing
});
 }


deletePrinter(id: number) {
  if (this.isLevel1) return;

  // 1. Open the custom blue-themed dialog
  const dialogRef = this.dialog.open(ConfirmDialog, {
    width: '400px',
    data: { message: 'Are you sure you want to delete this printer?' }
  });

  // 2. Listen for the result
  dialogRef.afterClosed().subscribe(result => {
    if (result === true) {
      
      this.isLoading = true;

      this.printerService.deletePrinter(id).subscribe({
        next: () => {
          setTimeout(() => {
            this.loadPrinters();

            this.snackBar.open('Printer deleted successfully!', 'OK', {
              duration: 3000,
              panelClass: ['blue-snackbar'],
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });

          }, 800);
        },
        error: (err) => {
          console.error('Delete failed', err);
          this.isLoading = false;

          this.snackBar.open('Failed to delete printer.', 'Close', {
            duration: 3000,
            panelClass: ['red-snackbar'],
            verticalPosition: 'top',
            horizontalPosition: 'right'
          });
        }
      });
    }
  });
}


deleteSelected() {
  if (this.isLevel1) return; // 🔒 Block Level 1

  const selectedPrinters = this.selection.selected;

  const selectedIds = selectedPrinters
    .map(p => p.EngenPrintersID)
    .filter((id): id is number => id !== undefined);

  if (!selectedIds.length) return;

  const printerNames = selectedPrinters
    .map(p => p.PrinterName)
    .join(', ');

  const confirmMessage =
    `Delete the following printer(s)?\n\n${printerNames}\n\nTotal: ${selectedIds.length}`;

  // 1. Open the custom blue-themed dialog
  const dialogRef = this.dialog.open(ConfirmDialog, {
    width: '400px',
    data: { message: confirmMessage }
  });

  // 2. Wrap the existing logic in the afterClosed subscription
  dialogRef.afterClosed().subscribe(result => {
    if (result === true) {
      this.isLoading = true;
      let processedCount = 0;
      let successCount = 0;

      selectedIds.forEach(id => {
        this.printerService.deletePrinter(id).subscribe({
          next: () => {
            processedCount++;
            successCount++;

            if (processedCount === selectedIds.length) {
              this.selection.clear();
              this.loadPrinters();
              this.isLoading = false;

              this.showSnackbar(`${successCount} printer(s) deleted successfully.`, 'success', 3000);
            }
          },
          error: (err) => {
            processedCount++;
            console.error(`Failed to delete ID ${id}`, err);

            if (processedCount === selectedIds.length) {
              this.selection.clear();
              this.loadPrinters();
              this.isLoading = false; // Ensure loading stops even on batch error

              if (successCount === 0) {
                this.showSnackbar('No printers were deleted.', 'error', 4000);
              } else {
                this.showSnackbar(`${successCount} printer(s) deleted. Some deletions failed.`, 'error', 4000);
              }
            }
          }
        });
      });
    }
  });
}




private showSnackbar(
  message: string,
  type: 'success' | 'error' = 'success',
  duration: number = 2000
) {
  this.snackBar.open(message, 'OK', {
    duration: duration,
    horizontalPosition: 'right',
    verticalPosition: 'top',
    // This assigns the CSS class based on the type
    panelClass: type === 'success' ? ['blue-snackbar'] : ['error-snackbar']
  });
}
}