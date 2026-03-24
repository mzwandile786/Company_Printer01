import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MOCK_USERS, MOCK_DESIGNATIONS } from '../mock-data';

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
  // 1. GET ALL USERS: Uses mock data with a small delay for realism
  getUsers(): Observable<User[]> {
    return of(MOCK_USERS as any[]).pipe(delay(400));
  }

  // 2. GET DESIGNATIONS: For your User Form dropdowns
  getDesignations(): Observable<any[]> {
    return of(MOCK_DESIGNATIONS);
  }

  // 3. CREATE: Simulates a successful save
  createUser(user: User): Observable<any> {
    console.log('Demo: User Created', user);
    return of({ success: true }).pipe(delay(500));
  }

  // 4. UPDATE: Simulates a successful edit
  updateUser(user: User): Observable<any> {
    console.log('Demo: User Updated ID', user.UserID);
    return of({ success: true }).pipe(delay(500));
  }

  // 5. DELETE: Simulates a successful removal
  deleteUser(id: number): Observable<any> {
    console.log('Demo: User Deleted ID', id);
    return of({ success: true }).pipe(delay(500));
  }
}