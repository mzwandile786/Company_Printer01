import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Designation {
  DesignationID?: number;
  DesignationName: string;
}

@Injectable({ providedIn: 'root' })
export class DesignationService {

  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7273/api/Designation';

  getDesignations(): Observable<Designation[]> {
    return this.http.get<Designation[]>(`${this.apiUrl}/get`);
  }

  createDesignation(designation: Designation): Observable<any> {
    return this.http.post(`${this.apiUrl}/insert`, designation);
  }

  updateDesignation(designation: Designation): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/update/${designation.DesignationID}`,
      designation
    );
  }

  deleteDesignation(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }
}
