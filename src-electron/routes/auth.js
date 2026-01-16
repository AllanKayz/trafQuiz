const express = require('express');
const router = express.Router();
const UserModel = require('../models/UserModel');
const StudentModel = require('../models/StudentModel');
const InstructorModel = require('../models/InstructorModel');

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = UserModel.findByEmail(email);

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isValid = await UserModel.verifyPassword(user, password);
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Get additional role data
        let roleData = {};
        if (user.role === 'student') {
            roleData = StudentModel.findByUserId(user.id);
        } else if (user.role === 'instructor') {
            roleData = InstructorModel.findByUserId(user.id); // Assuming this method exists or we use generic find
        }
        
        // Return user info sans password
        const { password: _, ...userWithoutPassword } = user;
        
        res.json({
            success: true,
            user: userWithoutPassword,
            roleData,
            token: 'dummy-jwt-token-for-electron-local' // Simplify auth for generic local app or use JWT if needed
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/register', async (req, res) => {
    // Basic registration implementation
    try {
        const { email } = req.body;
        if (UserModel.findByEmail(email)) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }
        
        const newUser = await UserModel.create(req.body);
        // Automatically create student profile if role is student?
        if (newUser.role === 'student') {
            StudentModel.create({ ...req.body, user_id: newUser.id }); // Should refactor create to handle this better
        }

        res.json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
