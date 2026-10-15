const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function captureScreenshots() {
  const outputDir = path.join(__dirname, 'docs/assets/screenshot');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: Object });
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2 // High resolution Retina screenshot
  });

  const page = await context.newPage();

  console.log('Navigating to login page...');
  await page.goto('http://localhost:4200/login');
  await page.waitForTimeout(1000);

  // 1. Login Page
  await page.screenshot({ path: path.join(outputDir, 'login-screen.png') });
  console.log('Captured login-screen.png');

  // Helper to log in as a specific user role via UI or mock localStorage
  async function loginAs(userObj) {
    await page.evaluate((user) => {
      localStorage.setItem('user', JSON.stringify(user));
    }, userObj);
  }

  // 2. Admin Role Screenshots
  const adminUser = {
    id: 1,
    username: 'admin',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'admin',
    email: 'admin@trafquiz.com'
  };

  await loginAs(adminUser);

  // Admin Dashboard
  await page.goto('http://localhost:4200/dashboard/dashboard');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, 'admin-dashboard.png') });
  console.log('Captured admin-dashboard.png');

  // Students Management
  await page.goto('http://localhost:4200/dashboard/students');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, 'students-management.png') });
  console.log('Captured students-management.png');

  // Instructors Management
  await page.goto('http://localhost:4200/dashboard/instructors');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, 'instructors-management.png') });
  console.log('Captured instructors-management.png');

  // Exams Management
  await page.goto('http://localhost:4200/dashboard/exams');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, 'exams-management.png') });
  console.log('Captured exams-management.png');

  // Questions Bank
  await page.goto('http://localhost:4200/dashboard/questions');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, 'questions-bank.png') });
  console.log('Captured questions-bank.png');

  // Financials & Invoicing
  await page.goto('http://localhost:4200/dashboard/finances');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, 'financials-invoicing.png') });
  console.log('Captured financials-invoicing.png');

  // Fleet Management
  await page.goto('http://localhost:4200/dashboard/vehicles');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, 'fleet-management.png') });
  console.log('Captured fleet-management.png');

  // Scheduling
  await page.goto('http://localhost:4200/dashboard/scheduling');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, 'scheduling-calendar.png') });
  console.log('Captured scheduling-calendar.png');

  // 3. Instructor Role Screenshots
  const instructorUser = {
    id: 3,
    user_id: 3,
    username: 'instructor1',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'instructor',
    email: 'instructor1@trafquiz.com'
  };

  await loginAs(instructorUser);

  // Instructor Schedule
  await page.goto('http://localhost:4200/dashboard/schedule');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, 'instructor-schedule.png') });
  console.log('Captured instructor-schedule.png');

  // Vehicle Status
  await page.goto('http://localhost:4200/dashboard/vehicle-status');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, 'vehicle-status-report.png') });
  console.log('Captured vehicle-status-report.png');

  // 4. Student Role Screenshots
  const studentUser = {
    id: 2,
    user_id: 2,
    username: 'student1',
    firstName: 'John',
    lastName: 'Doe',
    role: 'student',
    email: 'student1@trafquiz.com'
  };

  await loginAs(studentUser);

  // Student Practice Exam
  await page.goto('http://localhost:4200/exam');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, 'student-practice-exam.png') });
  console.log('Captured student-practice-exam.png');

  // Student Progress & Reports
  await page.goto('http://localhost:4200/dashboard/reports');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(outputDir, 'student-progress-reports.png') });
  console.log('Captured student-progress-reports.png');

  await browser.close();
  console.log('All screenshots captured successfully!');
}

captureScreenshots().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
