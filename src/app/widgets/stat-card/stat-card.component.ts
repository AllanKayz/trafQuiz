import { Component, input } from '@angular/core';

@Component({
    selector: 'app-stat-card',
    imports: [],
    template: `	
	    <div class="stat-card">
            <div class="stat-value">{{title()}}</div>
            <div class="stat-label">{{data()}}</div>
			<div class="stat-label">{{footer()}}</div>
        </div>
    `,
    styles: `
	.stat-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        padding: 25px;
        border-radius: 15px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease;
    }

    .stat-card:hover {
        transform: translateY(-5px);
    }

    .stat-value {
        font-size: 26px;
        font-weight: bold;
        color: #667eea;
        margin-bottom: 5px;
    }

    .stat-label {
        color: #666;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
	`
})

export class StatCardComponent {
    title = input.required();
    data = input.required();
    footer = input.required();
}
