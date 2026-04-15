const { User } = require('../src-electron/models/UserModel');
const { Student } = require('../src-electron/models/StudentModel');
const { Instructor } = require('../src-electron/models/InstructorModel');
const { Exam } = require('../src-electron/models/ExamModel');
const { sequelize } = require('../src-electron/database');

async function seed() {
    console.log('Seeding data for benchmark...');

    // Create users, students, instructors
    for (let i = 1; i <= 10; i++) {
        const user = await User.create({
            username: `user${i}`,
            email: `user${i}@test.com`,
            password: 'password',
            role: i <= 5 ? 'student' : 'instructor',
            first_name: 'First',
            last_name: `Last ${i}`
        });

        if (user.role === 'student') {
            await Student.create({ user_id: user.id, status: 'active' });
        } else {
            await Instructor.create({ user_id: user.id, license_number: `LIC${i}`, experience: 5 });
        }
    }

    // Create exams and student_exams
    for (let i = 1; i <= 20; i++) {
        const exam = await Exam.create({
            name: `Exam ${i}`,
            description: 'Test Exam',
            duration: 60,
            passing_score: 50,
            start_time: new Date(),
            end_time: new Date(Date.now() + 3600000)
        });

        for (let j = 1; j <= 5; j++) {
            await sequelize.query(`INSERT INTO student_exams (student_id, exam_id, score, completed_at) VALUES (?, ?, ?, ?)`,
                { replacements: [j, exam.id, Math.floor(Math.random() * 100), new Date(Date.now() - Math.random() * 10000000000).toISOString()] });
        }
    }

    // Create payments
    for (let i = 0; i < 100; i++) {
        const type = Math.random() > 0.5 ? 'income' : 'expense';
        const date = new Date(Date.now() - Math.random() * 15000000000).toISOString();
        await sequelize.query(`INSERT INTO payments (amount, type, category, payment_date, status, transaction_id) VALUES (?, ?, ?, ?, ?, ?)`,
            { replacements: [Math.floor(Math.random() * 1000), type, 'test', date, 'completed', `TXN-${i}`] });
    }

    console.log('Seeding complete.');
}

if (require.main === module) {
    seed().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
}

module.exports = { seed };
