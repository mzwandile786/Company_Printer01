import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MOCK_DESIGNATIONS } from '../mock-data';

export interface Designation {
  DesignationID?: number;
  DesignationName: string;
}

@Injectable({ providedIn: 'root' })
export class DesignationService {

  // 1. GET ALL: Loads your mock list of job titles
  getDesignations(): Observable<Designation[]> {
    return of(MOCK_DESIGNATIONS as any[]).pipe(delay(400));
  }

  // 2. CREATE: Simulates adding a new designation
  createDesignation(designation: Designation): Observable<any> {
    console.log('Demo: Created Designation', designation);
    return of({ success: true }).pipe(delay(500));
  }

  // 3. UPDATE: Simulates editing a job title
  updateDesignation(designation: Designation): Observable<any> {
    console.log('Demo: Updated Designation ID', designation.DesignationID);
    return of({ success: true }).pipe(delay(500));
  }

  // 4. DELETE: Simulates removing a designation
  deleteDesignation(id: number): Observable<any> {
    console.log('Demo: Deleted Designation ID', id);
    return of({ success: true }).pipe(delay(500));
  }
}