import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-stat-card',
    imports: [MatIconModule],
    template: `	
	    <div class="stat-card">
            <div class="icon-wrapper" [class.trend-up]="trend() === 'up'" [class.trend-down]="trend() === 'down'">
                <mat-icon>{{icon() || 'analytics'}}</mat-icon>
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
                    {{footer()}}
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
        border-radius: 20px;
        backdrop-filter: var(--glass-blur);
        box-shadow: 0 4px 12px var(--shadow-color);
        display: flex;
        align-items: flex-start;
        gap: 20px;
        border: var(--glass-border);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        height: 100%;
    }

    .stat-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 25px -5px var(--shadow-color);
        border-color: var(--primary-color);
    }

    .icon-wrapper {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        background: var(--hover-bg);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-muted);
        transition: all 0.3s ease;
    }

    .icon-wrapper mat-icon {
        width: 28px;
        height: 28px;
        font-size: 28px;
    }

    /* Trend styling for icon */
    .icon-wrapper.trend-up { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .icon-wrapper.trend-down { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

    .content {
        flex: 1;
    }

    .stat-label {
        color: var(--text-muted);
        font-size: 0.875rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 8px;
    }

    .stat-value {
        font-size: 2rem;
        font-weight: 700;
        color: var(--text-main);
        margin-bottom: 8px;
        letter-spacing: -0.02em;
        line-height: 1;
    }

    .stat-footer {
        color: var(--text-muted);
        font-size: 0.875rem;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
    }

    .trend-indicator {
        display: flex;
        align-items: center;
    }
    
    .trend-indicator mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
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
