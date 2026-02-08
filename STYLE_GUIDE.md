# TrafQuiz Design System Style Guide

## Visual Language
The new TrafQuiz interface is built on a **High-Contrast Navy & Slate** palette, designed for maximum legibility in both professional and training environments.

## Color Palette (HSL)
- **Primary Blue:** `hsl(221.2, 83.2%, 53.3%)` - Used for primary actions and branding.
- **Background (Light):** `hsl(210, 40%, 98%)` - Clean slate for reduced eye strain.
- **Background (Dark):** `hsl(222.2, 84%, 4.9%)` - Deep navy for rich contrast.
- **Glassmorphism:** Surfaces use 12px blur with 5% white/black borders to create depth without GPU-heavy shadows.

## Typography
- **Primary Font:** Inter / System UI Sans-serif.
- **Monospace:** JetBrains Mono (for codes and registration numbers).
- **Scale:** High visual hierarchy with bold weights (700+) for headings.

## Components
### Buttons
- **Primary:** High-elevation blue with subtle gradients.
- **Outline:** Transparent with 2px borders, high-contrast hover states.
- **Quick Actions:** Card-style buttons on the dashboard for workflow efficiency.

### Cards & Surfaces
- **Glass Card:** Combined backdrop-filter and subtle borders for a modern, lightweight feel.
- **Skeleton Loaders:** Shimmering placeholders that match component dimensions to reduce perceived latency.

### Data Visualization
- **Charts:** Powered by Chart.js with responsive containers.
- **Tables:** High-density layouts with sticky headers and semantic status badges.
