const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const router = express.Router();

// Middleware for authentication
const isAuthenticated = (req, res, next) => {
    if (!req.session.isAdmin) {
        return res.redirect('/admin/login'); // Redirect to login if not authenticated
    }
    next(); // Proceed if authenticated
};

// Middleware for admin-only access
const isAdmin = (req, res, next) => {
    if (req.session.role !== 'admin') { // Check if the user's role is admin
        return res.status(403).send('Access Denied'); // Forbidden for non-admins
    }
    next();
};

// Admin Login Page
router.get('/login', (req, res) => {
    res.render('admin/login', { title: 'Admin Login', error: null });
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // First, check the `admins` table for admin credentials
    db.query('SELECT * FROM admins WHERE username = ?', [username], async (err, adminResults) => {
        if (err) {
            console.error('Database Error (Admins):', err);
            return res.render('admin/login', { title: 'Admin Login', error: 'Server Error' });
        }

        if (adminResults.length > 0) {
            // Admin user found, validate password
            const admin = adminResults[0];
            const isMatch = await bcrypt.compare(password, admin.password);

            if (isMatch) {
                req.session.isAdmin = true;
                req.session.role = 'admin'; // Store admin role
                console.log('Admin logged in:', username);
                return res.redirect('/admin/dashboard');
            } else {
                console.log('Password mismatch for admin:', username);
                return res.render('admin/login', { title: 'Admin Login', error: 'Invalid Credentials' });
            }
        }

        // If not found in `admins`, check the `users` table for editor credentials
        db.query('SELECT * FROM users WHERE username = ?', [username], async (err, userResults) => {
            if (err) {
                console.error('Database Error (Users):', err);
                return res.render('admin/login', { title: 'Admin Login', error: 'Server Error' });
            }

            if (userResults.length > 0) {
                // Editor user found, validate password
                const user = userResults[0];
                const isMatch = await bcrypt.compare(password, user.password);

                if (isMatch) {
                    req.session.isAdmin = true;
                    req.session.role = user.role; // Store editor role
                    console.log('Editor logged in:', username);
                    return res.redirect('/admin/dashboard');
                } else {
                    console.log('Password mismatch for editor:', username);
                    return res.render('admin/login', { title: 'Admin Login', error: 'Invalid Credentials' });
                }
            }

            // If no match found in either table
            console.log('No user found with username:', username);
            return res.render('admin/login', { title: 'Admin Login', error: 'Invalid Credentials' });
        });
    });
});


// Admin Dashboard
router.get('/dashboard', isAuthenticated, (req, res) => {
    // Fetch statistics and recent activity
    const statsQuery = `
        SELECT 
            (SELECT COUNT(*) FROM news) AS totalNews, 
            (SELECT COUNT(*) FROM categories) AS totalCategories, 
            (SELECT COUNT(*) FROM users) AS totalUsers
        `;
    
    const recentNewsQuery = `
        SELECT id, title, created_at 
        FROM news 
        ORDER BY created_at DESC 
        LIMIT 5
    `;

    db.query(statsQuery, (err, statsResults) => {
        if (err) {
            console.error('Database Error (Stats):', err);
            return res.status(500).send('Server Error');
        }

        db.query(recentNewsQuery, (err, recentNewsResults) => {
            if (err) {
                console.error('Database Error (Recent News):', err);
                return res.status(500).send('Server Error');
            }

            // Render the dashboard with stats and recent news
            res.render('admin/dashboard', { 
                title: 'Admin Dashboard', 
                stats: statsResults[0], 
                recentNews: recentNewsResults, 
                role: req.session.role 
            });
        });
    });
});


// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/admin/login');
    });
});

module.exports = router;
