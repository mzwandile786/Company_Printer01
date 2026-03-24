import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { delay } from 'rxjs/operators';

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
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7273/api/Printer';

  private _refreshNeeded$ = new Subject<void>();
  get refreshNeeded$() { return this._refreshNeeded$; }

  getPrinters(): Observable<Printer[]> {
    return this.http.get<Printer[]>(`${this.apiUrl}/get`);
  }

  getPrinterMakes(): Observable<PrinterMake[]> {
    return this.http.get<PrinterMake[]>(`${this.apiUrl}/printer-makes`);
  }

  createPrinter(printer: Printer): Observable<any> {
    return this.http.post(`${this.apiUrl}/insert`, printer).pipe(
      tap(() => this._refreshNeeded$.next())
    );
  }

  updatePrinter(printer: Printer): Observable<any> {
    // ✅ Make sure this matches your backend endpoint
    return this.http.put(`${this.apiUrl}/update/${printer.EngenPrintersID}`, printer).pipe(
      tap(() => this._refreshNeeded$.next())
    );
  }

  deletePrinter(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`).pipe(
      tap(() => this._refreshNeeded$.next())
    );
  }

  searchPrinters(printerMakeId?: number, fromDate?: string, toDate?: string): Observable<Printer[]> {
    let params = new HttpParams();
    if (printerMakeId) params = params.append('printerMakeId', printerMakeId.toString());
    if (fromDate) params = params.append('fromDate', fromDate);
    if (toDate) params = params.append('toDate', toDate);
    return this.http.get<Printer[]>(`${this.apiUrl}/search`, { params });
  }
}