# Bootstrap to Angular Material Migration Guide

## Overview
This document maps Bootstrap patterns to Angular Material equivalents to complete the migration from Bootstrap 5 to Angular Material 21 + native CSS (Flexbox/Grid).

---

## 1. LAYOUT & GRID SYSTEM

### Bootstrap → Material Mapping

| Pattern | Bootstrap | Material Equivalent | Notes |
|---------|-----------|-------------------|-------|
| **Flexbox layout** | `.d-flex`, `.flex-column`, `.justify-content-*` | `fxLayout`, CSS Grid, or plain CSS | Use native CSS Grid/Flexbox; add Material `mat-toolbar`, `mat-sidenav` for layouts |
| **Grid system** | `.row`, `.col-md-6`, `.col-12` | CSS Grid or Flexbox + utility classes | Already added `.layout-row`, `.col-md-6`, `.col-md-4`, `.col-12` in `src/styles.css` |
| **Spacing** | `.mb-3`, `.p-4`, `.me-3` | Use inline styles or CSS classes | Replace with native margin/padding or Material spacing variables |
| **Container** | `.container`, `.container-fluid` | `<mat-toolbar>`, `<mat-card>` wrappers | Use Material containers for consistency |

### Best Practices
```html
<!-- ❌ BEFORE (Bootstrap) -->
<div class="d-flex flex-column p-4 me-3">
  <div class="row mb-4">
    <div class="col-md-6">Content</div>
  </div>
</div>

<!-- ✅ AFTER (Material + CSS) -->
<div class="material-layout">
  <div class="layout-row" style="margin-bottom: 1rem;">
    <div class="col-md-6">Content</div>
  </div>
</div>

<!-- Add to styles.css: -->
.material-layout { display: flex; flex-direction: column; padding: 1rem; margin-right: 0.75rem; }
```

---

## 2. BUTTONS

### Bootstrap → Material Mapping

| Bootstrap | Material | Example |
|-----------|----------|---------|
| `.btn` | `mat-button` | `<button mat-button>Click</button>` |
| `.btn-primary` | None (use color) | `<button mat-button color="primary">OK</button>` |
| `.btn-secondary` | `mat-stroked-button` or plain `mat-button` | `<button mat-stroked-button>Cancel</button>` |
| `.btn-danger` | `color="warn"` | `<button mat-button color="warn">Delete</button>` |
| `.btn-success` | `color="accent"` | `<button mat-button color="accent">Save</button>` |
| `.btn-outline-*` | `mat-stroked-button` + `color` | `<button mat-stroked-button color="primary">Outline</button>` |
| `.btn-lg` | `mat-raised-button` | `<button mat-raised-button>Prominent</button>` |
| `.btn-sm` | None (use CSS override) | Add `.mat-button-sm { font-size: 0.75rem; }` |
| `.btn-group` | `<mat-button-toggle-group>` | See below |
| Disabled state | `[disabled]="condition"` | `<button mat-button [disabled]="isDisabled">Text</button>` |

### Button Examples

```html
<!-- ❌ BEFORE -->
<button class="btn btn-primary" [disabled]="isLoading">Submit</button>
<button class="btn btn-secondary">Cancel</button>
<button class="btn btn-danger" (click)="delete()">Delete</button>

<!-- ✅ AFTER -->
<button mat-raised-button color="primary" [disabled]="isLoading">Submit</button>
<button mat-stroked-button>Cancel</button>
<button mat-button color="warn" (click)="delete()">Delete</button>
```

### Button Group (Toggle Group)

```html
<!-- ❌ BEFORE (Bootstrap) -->
<div class="btn-group btn-group-sm" role="group">
  <button type="button" class="btn btn-outline-primary">Left</button>
  <button type="button" class="btn btn-outline-primary">Middle</button>
  <button type="button" class="btn btn-outline-primary">Right</button>
</div>

<!-- ✅ AFTER (Material) -->
<mat-button-toggle-group>
  <mat-button-toggle value="left">Left</mat-button-toggle>
  <mat-button-toggle value="middle">Middle</mat-button-toggle>
  <mat-button-toggle value="right">Right</mat-button-toggle>
</mat-button-toggle-group>
```

---

## 3. FORMS & INPUTS

### Bootstrap → Material Mapping

| Bootstrap | Material | Example |
|-----------|----------|---------|
| `.form-control` | `mat-form-field` + `matInput` | See below |
| `.form-label` | `<mat-label>` | Inside `mat-form-field` |
| `.form-select` | `<mat-select>` | Use `mat-form-field` wrapper |
| `.form-check` | `mat-checkbox` | `<mat-checkbox>Check me</mat-checkbox>` |
| `.form-switch` | `mat-slide-toggle` | `<mat-slide-toggle>Toggle</mat-slide-toggle>` |
| `.invalid-feedback` | `mat-error` | Inside `mat-form-field` |
| Form validation | Reactive Forms + Material validators | See below |

### Form Example

```html
<!-- ❌ BEFORE -->
<form [formGroup]="form" (submit)="submit()">
  <div class="mb-3">
    <label for="email" class="form-label">Email:</label>
    <input type="email" class="form-control" formControlName="email" id="email">
  </div>
  <div class="mb-3">
    <select class="form-select" formControlName="role">
      <option value="admin">Admin</option>
      <option value="student">Student</option>
    </select>
  </div>
  <button type="submit" class="btn btn-primary">Submit</button>
</form>

<!-- ✅ AFTER -->
<form [formGroup]="form" (submit)="submit()">
  <mat-form-field appearance="outline" class="w-100">
    <mat-label>Email</mat-label>
    <input matInput type="email" formControlName="email">
    <mat-error *ngIf="form.get('email')?.hasError('required')">Email is required</mat-error>
  </mat-form-field>

  <mat-form-field appearance="outline" class="w-100">
    <mat-label>Role</mat-label>
    <mat-select formControlName="role">
      <mat-option value="admin">Admin</mat-option>
      <mat-option value="student">Student</mat-option>
    </mat-select>
  </mat-form-field>

  <button mat-raised-button color="primary" type="submit">Submit</button>
</form>
```

### Form Field & Input Configuration

```typescript
// ✅ All imports needed in component
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule
  ],
  template: `...`
})
export class FormComponent {}
```

---

## 4. MODALS & DIALOGS

### Bootstrap → Material Mapping

**Bootstrap modals** use `data-bs-toggle="modal"` and `data-bs-target="#id"` with HTML markup. **Angular Material uses `MatDialog` service**—no HTML markup needed.

```html
<!-- ❌ BEFORE (Bootstrap Modal) -->
<button data-bs-toggle="modal" data-bs-target="#myModal" class="btn btn-primary">Open</button>

<div class="modal fade" id="myModal" tabindex="-1">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Title</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">Content</div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button class="btn btn-primary" (click)="save()">Save</button>
      </div>
    </div>
  </div>
</div>

<!-- ✅ AFTER (Material Dialog) -->
<button mat-raised-button color="primary" (click)="openDialog()">Open</button>

<!-- Create a separate component: my-dialog.component.ts -->
```

### Material Dialog Implementation

**1. Create a dialog component:**

```typescript
// my-dialog.component.ts
import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-my-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Dialog Title</h2>
    <mat-dialog-content>
      Content goes here
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Close</button>
      <button mat-raised-button color="primary" (click)="save()">Save</button>
    </mat-dialog-actions>
  `
})
export class MyDialogComponent {
  dialogRef = inject(MatDialogRef<MyDialogComponent>);

  save() {
    this.dialogRef.close({ saved: true });
  }
}
```

**2. Open dialog from parent component:**

```typescript
// parent.component.ts
import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MyDialogComponent } from './my-dialog.component';

@Component({...})
export class ParentComponent {
  dialog = inject(MatDialog);

  openDialog() {
    const dialogRef = this.dialog.open(MyDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result?.saved) {
        console.log('Dialog saved');
      }
    });
  }
}
```

---

## 5. NAVIGATION & TABS

### Bootstrap → Material Mapping

| Bootstrap | Material | Example |
|-----------|----------|---------|
| `.nav-pills` + `data-bs-toggle="pill"` | `<mat-tab-group>` | See below |
| `.nav-item` clickable | `<mat-tab label="Tab">` | Simpler, no click handling needed |
| `.active` class | Automatic in Material tabs | Material tracks active index |

### Tabs Example

```html
<!-- ❌ BEFORE (Bootstrap Pills/Tabs) -->
<div role="tablist">
  <button data-bs-toggle="pill" data-bs-target="#tab1" class="nav-link active">Tab 1</button>
  <button data-bs-toggle="pill" data-bs-target="#tab2" class="nav-link">Tab 2</button>
</div>
<div class="tab-content">
  <div class="tab-pane fade show active" id="tab1" role="tabpanel">Content 1</div>
  <div class="tab-pane fade" id="tab2" role="tabpanel">Content 2</div>
</div>

<!-- ✅ AFTER (Material Tabs) -->
<mat-tab-group>
  <mat-tab label="Tab 1">Content 1</mat-tab>
  <mat-tab label="Tab 2">Content 2</mat-tab>
</mat-tab-group>
```

---

## 6. NAVIGATION SIDEBAR

### Bootstrap → Material Mapping

**Use Material `<mat-sidenav-container>` + `<mat-sidenav>` + `<mat-nav-list>`**

```html
<!-- ✅ Material Sidenav (Recommended) -->
<mat-sidenav-container class="example-container">
  <mat-sidenav #sidenav>
    <mat-nav-list>
      <mat-list-item *ngFor="let item of menuItems" [routerLink]="item.route">
        <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
        <span matListItemTitle>{{ item.label }}</span>
      </mat-list-item>
    </mat-nav-list>
  </mat-sidenav>
  
  <mat-sidenav-content>
    <button mat-icon-button (click)="sidenav.toggle()">
      <mat-icon>menu</mat-icon>
    </button>
    <router-outlet></router-outlet>
  </mat-sidenav-content>
</mat-sidenav-container>
```

---

## 7. UTILITY CLASSES MAPPING

### Bootstrap Utilities → CSS/Material

| Bootstrap Util | Purpose | Material / CSS Alternative |
|---|---|---|
| `.d-flex` | Display flex | CSS: `display: flex;` |
| `.flex-column` | Flex direction column | CSS: `flex-direction: column;` |
| `.justify-content-center` | Justify content | CSS: `justify-content: center;` |
| `.align-items-center` | Align items | CSS: `align-items: center;` |
| `.mb-3` | Margin bottom | CSS: `margin-bottom: 1rem;` or Material spacing |
| `.p-4` | Padding | CSS: `padding: 1.5rem;` |
| `.w-100` | Width 100% | CSS: `width: 100%;` |
| `.text-center` | Text center | CSS: `text-align: center;` |
| `.text-uppercase` | Text uppercase | CSS: `text-transform: uppercase;` |
| `.shadow-sm` | Box shadow | CSS: `box-shadow: var(--shadow-sm);` |
| `.rounded` | Border radius | CSS: `border-radius: var(--radius);` |
| `.mx-auto` | Margin auto horizontal | CSS: `margin: 0 auto;` |
| `.vh-100` | Height 100vh | CSS: `height: 100vh;` |
| `.sticky-bottom` | Sticky to bottom | CSS: `position: sticky; bottom: 0;` |

### Quick CSS Utility Classes Reference

Add these to `src/styles.css` as needed:

```css
.d-flex { display: flex; }
.flex-column { flex-direction: column; }
.flex-row { flex-direction: row; }
.justify-content-center { justify-content: center; }
.align-items-center { align-items: center; }
.gap-3 { gap: 1rem; }
.mb-3 { margin-bottom: 1rem; }
.mb-4 { margin-bottom: 1.5rem; }
.p-4 { padding: 1.5rem; }
.w-100 { width: 100%; }
.h-100 { height: 100%; }
.text-center { text-align: center; }
.text-uppercase { text-transform: uppercase; }
.shadow-sm { box-shadow: var(--shadow-sm); }
.rounded { border-radius: var(--radius); }
.mx-auto { margin-left: auto; margin-right: auto; }
```

---

## 8. CHANGE DETECTION OPTIMIZATION

### Add ChangeDetectionStrategy.OnPush to Components

```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-example',
  changeDetection: ChangeDetectionStrategy.OnPush,  // ← Add this
  templateUrl: './example.component.html',
  styleUrl: './example.component.css'
})
export class ExampleComponent {
  // Component logic
}
```

**Benefits:**
- Faster rendering
- Fewer unnecessary checks
- Better performance on large lists

---

## 9. VALIDATION & ERROR MESSAGES

### Bootstrap → Material Error Handling

```html
<!-- ✅ AFTER (Material validation) -->
<mat-form-field appearance="outline" class="w-100">
  <mat-label>Username</mat-label>
  <input matInput formControlName="username" required>
  <mat-error *ngIf="form.get('username')?.hasError('required')">
    Username is required
  </mat-error>
  <mat-error *ngIf="form.get('username')?.hasError('minlength')">
    Username must be at least 3 characters
  </mat-error>
</mat-form-field>
```

---

## 10. ICONS & TYPOGRAPHY

### Web Material Icons (Already imported)

```html
<!-- Using Material Icons -->
<mat-icon>home</mat-icon>
<mat-icon>delete</mat-icon>
<mat-icon>edit</mat-icon>
<mat-icon>add</mat-icon>
```

See full icon list: https://fonts.google.com/icons

---

## 11. PROGRESS & LOADING

### Bootstrap → Material Mapping

| Bootstrap | Material | Example |
|-----------|----------|---------|
| Custom spinner | `<mat-progress-bar>` | `<mat-progress-bar mode="indeterminate"></mat-progress-bar>` |
| Disabled overlay | `<mat-progress-spinner>` | `<mat-progress-spinner diameter="50"></mat-progress-spinner>` |
| Loading state | Loading service + Material toolbar | See Exam component example |

```html
<!-- ✅ Material Progress Indicators -->
<mat-progress-bar mode="indeterminate"></mat-progress-bar>
<mat-progress-spinner diameter="50" mode="indeterminate"></mat-progress-spinner>
```

---

## 12. TABLES

### Bootstrap → Material Mapping

Continue using `<mat-table>` for data tables. No substantial changes needed.

```html
<!-- ✅ Angular Material Table (Already in use) -->
<table mat-table [dataSource]="dataSource">
  <!-- Column definitions... -->
</table>
```

---

## 13. TOOLTIPS & POPOVERS

### Bootstrap → Material Mapping

| Bootstrap | Material | Example |
|-----------|----------|---------|
| `data-bs-toggle="tooltip"` | `matTooltip` | `<button matTooltip="Help text">Button</button>` |
| Popover | `matMenuTriggerFor` | Use `<mat-menu>` |

```html
<!-- ✅ Tooltips & Menus -->
<button mat-icon-button matTooltip="Click to refresh">
  <mat-icon>refresh</mat-icon>
</button>

<button mat-icon-button [matMenuTriggerFor]="menu">
  <mat-icon>more_vert</mat-icon>
</button>
<mat-menu #menu="matMenu">
  <button mat-menu-item>Option 1</button>
  <button mat-menu-item>Option 2</button>
</mat-menu>
```

---

## 14. CARDS

### Bootstrap → Material Mapping

| Bootstrap | Material | Example |
|-----------|----------|---------|
| `.card` | `<mat-card>` | `<mat-card>Content</mat-card>` |
| `.card-header` | `<mat-card-header>` | Inside `mat-card` |
| `.card-body` | `<mat-card-content>` | Inside `mat-card` |
| `.card-footer` | `<mat-card-actions>` | Footer actions |

```html
<!-- ✅ Angular Material Card -->
<mat-card>
  <mat-card-header>
    <mat-card-title>Card Title</mat-card-title>
  </mat-card-header>
  <mat-card-content>
    Content goes here
  </mat-card-content>
  <mat-card-actions>
    <button mat-button>Action</button>
  </mat-card-actions>
</mat-card>
```

---

## 15. COMPONENT IMPORTS CHECKLIST

### Required Material Imports for Full Migration

```typescript
// Buttons & Icons
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Forms
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';

// Layout & Navigation
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';

// Dialogs & Modals
import { MatDialogModule } from '@angular/material/dialog';

// Data Display
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

// Progress
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Menu & Actions
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

// Other
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
```

---

## MIGRATION CHECKLIST

### Phase 1: Foundation (✅ Completed)
- [x] Remove Bootstrap CSS/JS from build config
- [x] Remove Bootstrap npm dependency
- [x] Add layout utility classes to `styles.css`
- [x] Remove `console.log` statements
- [x] Add `mat-button` attributes to button elements

### Phase 2: Dashboard Component
- [ ] Convert navigation pills to Material tabs
- [ ] Replace form controls with `MatFormField`
- [ ] Ensure sidebar uses Material components
- [ ] Test styling and layout

### Phase 3: Exam Component
- [ ] Verify timer and progress bar (already Material)
- [ ] Replace action buttons with proper Material variants
- [ ] Ensure responsive design
- [ ] Test result display

### Phase 4: Admin Component
- [ ] Convert Bootstrap tabs to Material tabs
- [ ] Replace Bootstrap modal with MatDialog
- [ ] Convert form inputs to MatFormField
- [ ] Replace button group with MatButtonToggleGroup

### Phase 5: Other Components (Lessons, Messages, Reports, etc.)
- [ ] Convert each major component
- [ ] Add `ChangeDetectionStrategy.OnPush` for performance
- [ ] Replace remaining Bootstrap utilities
- [ ] Test dark mode theme

### Phase 6: Polish & Testing
- [ ] Run full build: `npm run build`
- [ ] Run Electron dev: `npm run electron:dev`
- [ ] Manual testing of all screens
- [ ] Verify bundle size reduction
- [ ] Cross-browser testing

---

## BUNDLE SIZE BENEFITS

**Before:** Bootstrap 5.3.8 = ~160 KB (minified), plus Angular Material lazy-loaded components
**After:** Only Material components you import = ~50–80 KB total

**Estimated savings: 60–80+ KB per user**

---

## CODE EXAMPLES BY COMPONENT

### Example 1: Convert Tab Navigation (Admin Component)

```typescript
// before: admin.component.ts (Bootstrap tabs)
// No TypeScript changes needed, just template

// after: admin.component.ts (Material tabs)
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-admin',
  imports: [MatTabsModule, ...otherImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`
})
export class AdminComponent {}
```

### Example 2: Convert Modal to MatDialog

```typescript
// Create dialog component: edit-student-dialog.component.ts
import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-edit-student-dialog',
  standalone: true,
  imports: [MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Edit Student</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>First Name</mat-label>
          <input matInput formControlName="firstName" required>
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" required>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()">Save</button>
    </mat-dialog-actions>
  `
})
export class EditStudentDialogComponent {
  fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<EditStudentDialogComponent>);
  data = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    firstName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
```

Then in parent component:

```typescript
@Component({...})
export class AdminComponent {
  dialog = inject(MatDialog);

  editStudent(student: any) {
    this.dialog.open(EditStudentDialogComponent, {
      data: student,
      width: '500px'
    }).afterClosed().subscribe(result => {
      if (result) {
        // Save updated student
      }
    });
  }
}
```

---

## NEXT STEPS

1. **Review this checklist** and bookmark for reference
2. **Start with one component** (e.g., Dashboard) — convert all patterns per section above
3. **Run build & test** after each component
4. **Use Angular DevTools** to profile performance improvements
5. **Iterate through remaining components** using the same pattern
6. **Final QA** on all screens before deploying

---

## RESOURCES

- [Angular Material Documentation](https://material.angular.io)
- [Material Design Principles](https://material.io/design)
- [Material Icons Gallery](https://fonts.google.com/icons)
- [Bootstrap to Material Migration Tool](https://material.io/design/platform-guidance/android-bars.html)

---

**Migration Owner:** TrafQuiz Dev Team  
**Last Updated:** 2026-02-07  
**Status:** In Progress (Phase 2)
