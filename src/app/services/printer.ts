import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { MOCK_PRINTERS, MOCK_PRINTER_MAKES } from '../mock-data';

export interface Printer {
  EngenPrintersID: number;
  PrinterMake: string;
  PrinterName: string;
  FolderToMonitor: string;
  OutputType: string;
  FileOutput: string;
  Active: boolean;
  PrinterMakeID: number;
  PrinterMakeName: string;
  CreatedTimeStamp: string;
}

export interface PrinterMake {
  printerMakeID: number;
  printerMakeName: string;
}

@Injectable({ providedIn: 'root' })
export class PrinterService {
  // Keeps your UI components working by notifying them of "changes"
  private _refreshNeeded$ = new Subject<void>();
  get refreshNeeded$() { return this._refreshNeeded$; }

  // 1. GET ALL: Returns the mock list
  getPrinters(): Observable<Printer[]> {
   return of(MOCK_PRINTERS as Printer[]).pipe(delay(400));
  }

  // 2. GET MAKES: For your dropdowns
  getPrinterMakes(): Observable<PrinterMake[]> {
    return of(MOCK_PRINTER_MAKES);
  }

  // 3. CREATE: Simulates a successful save
  createPrinter(printer: Printer): Observable<any> {
    console.log('Demo: Created', printer);
    return of({ success: true }).pipe(
      tap(() => this._refreshNeeded$.next())
    );
  }

  // 4. UPDATE: Simulates a successful edit
  updatePrinter(printer: Printer): Observable<any> {
    console.log('Demo: Updated ID', printer.EngenPrintersID);
    return of({ success: true }).pipe(
      tap(() => this._refreshNeeded$.next())
    );
  }

  // 5. DELETE: Simulates a successful removal
  deletePrinter(id: number): Observable<any> {
    console.log('Demo: Deleted ID', id);
    return of({ success: true }).pipe(
      tap(() => this._refreshNeeded$.next())
    );
  }

  // 6. SEARCH: Just returns the full mock list for the demo
  searchPrinters(printerMakeId?: number, fromDate?: string, toDate?: string): Observable<Printer[]> {
    console.log('Demo: Searching with filters', { printerMakeId, fromDate, toDate });
   return of(MOCK_PRINTERS as Printer[]).pipe(delay(400));
  }
}