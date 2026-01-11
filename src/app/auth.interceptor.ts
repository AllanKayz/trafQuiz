import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const userJson = localStorage.getItem('user');
    let token = '';

    if (userJson) {
        try {
            const user = JSON.parse(userJson);
            token = user.token || '';
        } catch (e) {
            console.error('Error parsing user token', e);
        }
    }

    if (token) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(req).pipe(
        catchError((error) => {
            if (error.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('user');
                router.navigate(['/login']);
            }
            return throwError(() => error);
        })
    );
};
