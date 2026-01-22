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
        border-radius: 20px;
        backdrop-filter: var(--glass-blur);
        -webkit-backdrop-filter: var(--glass-blur);
        box-shadow: 0 4px 12px var(--shadow-color);
        display: flex;
        align-items: center;
        gap: 20px;
        border: var(--glass-border);
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        height: 100%;
        position: relative;
        overflow: hidden;
    }

    .stat-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
        pointer-events: none;
    }

    .stat-card:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 20px 40px -10px var(--shadow-color);
        border-color: var(--primary-color);
    }

    .icon-section {
        flex-shrink: 0;
    }

    .icon-wrapper {
        width: 64px;
        height: 64px;
        border-radius: 18px;
        background: var(--hover-bg);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-muted);
        transition: all 0.3s ease;
        position: relative;
    }

    .icon-wrapper mat-icon {
        width: 32px;
        height: 32px;
        font-size: 32px;
    }

    /* Trend styling for icon with gradients */
    .icon-wrapper.trend-up { 
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%); 
        color: #3b82f6; 
        box-shadow: 0 8px 16px -4px rgba(59, 130, 246, 0.2);
    }
    .icon-wrapper.trend-down { 
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%); 
        color: #ef4444; 
        box-shadow: 0 8px 16px -4px rgba(239, 68, 68, 0.2);
    }

    .content {
        flex: 1;
        min-width: 0;
    }

    .stat-label {
        color: var(--text-muted);
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .stat-value {
        font-size: 2.25rem;
        font-weight: 800;
        color: var(--text-main);
        margin-bottom: 4px;
        letter-spacing: -0.02em;
        line-height: 1.1;
    }

    .stat-footer {
        color: var(--text-muted);
        font-size: 0.8125rem;
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 500;
    }

    .trend-indicator {
        display: flex;
        align-items: center;
    }
    
    .trend-indicator mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
    }

    .trend-indicator.up { color: #10b981; }
    .trend-indicator.down { color: #ef4444; }

    .footer-text {
        opacity: 0.8;
    }
	`]
})

export class StatCardComponent {
    title = input.required<string>();
    data = input.required<string | number>();
    footer = input<string>('');
    icon = input<string>('');
    trend = input<'up' | 'down' | null>(null);
}
