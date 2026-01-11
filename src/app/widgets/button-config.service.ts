import { Injectable, computed, signal } from '@angular/core';
import { SectionButton } from './sectionheader/sectionheader.component';

@Injectable({
  providedIn: 'root'
})
export class ButtonConfigService {

  private buttonConfig = signal<Record<string, SectionButton[]>>({
    questions: [
      { name: 'Add Question', icon: 'add', action: 'addQuestion' },
      { name: 'Add Category', icon: 'add', action: 'addCategory' },
    ],
    students: [
      { name: 'Add Student', icon: 'person_add', action: 'addStudent' }
    ],
    instructors: [
      { name: 'Add Instructor', icon: 'person_add', action: 'addInstructor' },
      { name: 'Add Specialization', icon: 'specialization_add', action: 'addSpecialization' },
      { name: 'Add Certification', icon: 'certification_add', action: 'addCertification' }
    ],
    exams: [
      { name: 'Create Exam', icon: 'post_add', action: 'createExam' },
      { name: 'Schedule', icon: 'calendar_today', action: 'sheduleExam' }
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
