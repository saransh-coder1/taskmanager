import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private router: Router) {}

  register(user: any) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
  }

  login(email: string, password: string): boolean {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem('loggedInUser', JSON.stringify(user));
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem('loggedInUser');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('loggedInUser');
  }
}
