import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-stat-card',
    imports: [MatIconModule],
    template: `	
	    <div class="stat-card animate-slide-up">
            <div class="icon-section">
                <div class="icon-wrapper" [class.trend-up]="trend() === 'up'" [class.trend-down]="trend() === 'down'">
                    <mat-icon>{{icon() || 'analytics'}}</mat-icon>
                </div>
            </div>
            <div class="content">
                <div class="stat-label">{{title()}}</div>
                <div class="stat-value">{{data()}}</div>
                <div class="stat-footer">
                    @if (trend()) {
                        <span class="trend-indicator" [class.up]="trend() === 'up'" [class.down]="trend() === 'down'">
                            <mat-icon>{{trend() === 'up' ? 'trending_up' : 'trending_down'}}</mat-icon>
                        </span>
                    }
                    <span class="footer-text">{{footer()}}</span>
                </div>
            </div>
        </div>
    `,
    styles: [`
    :host {
        display: block;
    }

	.stat-card {
        background: var(--bg-card);
        padding: 24px;
        border-radius: 16px;
        box-shadow: var(--shadow-md);
        display: flex;
        align-items: center;
        gap: 20px;
        border: 1px solid var(--border-color);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        height: 100%;
        position: relative;
    }

    .stat-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
        border-color: var(--primary-color);
    }

    .icon-wrapper {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        background: var(--hover-bg);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary-color);
        transition: all 0.3s ease;
    }

    .icon-wrapper mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
    }

    .stat-label {
        color: var(--text-muted);
        font-size: 0.8125rem;
        font-weight: 500;
        margin-bottom: 4px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .stat-value {
        font-size: 1.875rem;
        font-weight: 700;
        color: var(--text-main);
        margin-bottom: 2px;
        letter-spacing: -0.02em;
    }

    .stat-footer {
        color: var(--text-muted);
        font-size: 0.8125rem;
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .trend-indicator.up { color: #10b981; }
    .trend-indicator.down { color: #ef4444; }
	`]
})

export class StatCardComponent {
    title = input.required<string>();
    data = input.required<string | number>();
    footer = input<string>('');
    icon = input<string>('');
    trend = input<'up' | 'down' | null>(null);
}
