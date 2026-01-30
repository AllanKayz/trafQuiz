import { Injectable, signal, inject } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private router = inject(Router);
    private loadingCount = signal(0);
    public isLoading = signal(false);

    constructor() {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                this.show();
            } else if (
                event instanceof NavigationEnd ||
                event instanceof NavigationCancel ||
                event instanceof NavigationError
            ) {
                this.hide();
            }
        });
    }

    show() {
        this.loadingCount.update(count => count + 1);
        this.isLoading.set(true);
    }

    hide() {
        this.loadingCount.update(count => Math.max(0, count - 1));
        if (this.loadingCount() === 0) {
            this.isLoading.set(false);
        }
    }

    reset() {
        this.loadingCount.set(0);
        this.isLoading.set(false);
    }
}
