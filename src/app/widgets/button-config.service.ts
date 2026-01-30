import { Injectable, computed, signal } from '@angular/core';
import { SectionButton } from './sectionheader/sectionheader.component';

@Injectable({
  providedIn: 'root'
})
export class ButtonConfigService {

  private buttonConfig = signal<Record<string, SectionButton[]>>({
    questions: [
      { name: 'Add Question', icon: 'add', action: 'addQuestion', variant: 'primary' },
      { name: 'Add Category', icon: 'category', action: 'addCategory', variant: 'outline' },
    ],
    students: [
      { name: 'Add Student', icon: 'person_add', action: 'addStudent', variant: 'primary' }
    ],
    instructors: [
      { name: 'Specializations', icon: 'stars', action: 'manageSpecializations', variant: 'outline' },
      { name: 'Certifications', icon: 'verified', action: 'manageCertifications', variant: 'outline' },
      { name: 'Add Instructor', icon: 'person_add', action: 'addInstructor', variant: 'primary' }
    ],
    exams: [
      { name: 'Manage Categories', icon: 'category', action: 'manageCategories', variant: 'outline' },
      { name: 'Manage Timeframe', icon: 'timer', action: 'manageTimeframe', variant: 'outline' },
      { name: 'Schedule', icon: 'calendar_today', action: 'sheduleExam', variant: 'primary' },
      { name: 'Create Exam', icon: 'post_add', action: 'createExam', variant: 'primary' },
      { name: 'Refresh Stats', icon: 'refresh', action: 'refreshStats', variant: 'outline' }
    ]
  });

  // Role Specific Overrides
  private roleOverrides = signal<Record<string, Record<string, SectionButton[]>>>({
    student: {
      questions: [
        { name: 'Practice Test', action: 'practiceTest' }
      ]
    },
    instructor: {
      exams: [
        { name: 'Review Exams', action: 'reviewExams' }
      ]
    }
  });

  getButtons(menu: string, role: string) {
    if (role === 'admin') {
      const baseButtons = this.buttonConfig()[menu] || [];
      // Check for specific overrides if any (e.g. customized admin buttons)
      const overrides = this.roleOverrides()[role]?.[menu] || [];
      // Merge strategy could be implemented here, but for now base is Admin
      return baseButtons;
    }
    // Non-admins get only their overrides
    return this.roleOverrides()[role]?.[menu] || [];
  }

  // Update button configurations dynamically
  updateButtonConfig(config: Record<string, SectionButton[]>) {
    this.buttonConfig.update(current => ({ ...current, ...config }));
  }

  updateRoleOverrides(overrides: Record<string, Record<string, SectionButton[]>>) {
    this.roleOverrides.update(current => ({ ...current, ...overrides }));
  }

  constructor() { }
}
