import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  UserID: number;
  FirstName: string;
  LastName: string;
  Email: string;
  UserName: string;
  Password: string;
  DesignationID: number;
  DesignationName: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7273/api/Users';

  // Get all users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/get`);
  }

  // Create new user
  createUser(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/insert`, user);
  }

  // Update user
  updateUser(user: User): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${user.UserID}`, user);
  }

  // Delete user
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }
  getDesignations(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/designations`);
}
}
