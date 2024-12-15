const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const router = express.Router();

// Middleware for authentication and role-based access
const isAuthenticated = (req, res, next) => {
    if (!req.session.isAdmin) {
        return res.redirect('/admin/login'); // Redirect to login if not authenticated
    }
    next();
};

const isAdmin = (req, res, next) => {
    if (req.session.role !== 'admin') { // Check the user's role
        return res.status(403).send('Access Denied'); // Forbidden for non-admins
    }
    next();
};

// View All Users (Admin only)
router.get('/', isAuthenticated, isAdmin, (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).send('Server Error');
        }
        res.render('admin/users', { title: 'Manage Users', users: results });
    });
});

// Add User Form (Admin only)
router.get('/add', isAuthenticated, isAdmin, (req, res) => {
    res.render('admin/add-user', { title: 'Add User' });
});

// Handle Adding User (Admin only)
router.post('/add', isAuthenticated, isAdmin, async (req, res) => {
    const { username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', 
    [username, hashedPassword, role], (err) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).send('Server Error');
        }
        res.redirect('/admin/users');
    });
});

// Edit User Form (Admin only)
router.get('/edit/:id', isAuthenticated, isAdmin, (req, res) => {
    const userId = req.params.id;
    db.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
        if (err || results.length === 0) {
            console.error('Database Error:', err || 'User Not Found');
            return res.status(404).send('User Not Found');
        }
        res.render('admin/edit-user', { title: 'Edit User', user: results[0] });
    });
});

// Handle Editing User (Admin only)
router.post('/edit/:id', isAuthenticated, isAdmin, async (req, res) => {
    const userId = req.params.id;
    const { username, password, role } = req.body;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const query = hashedPassword
        ? 'UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?'
        : 'UPDATE users SET username = ?, role = ? WHERE id = ?';
    const params = hashedPassword ? [username, hashedPassword, role, userId] : [username, role, userId];

    db.query(query, params, (err) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).send('Server Error');
        }
        res.redirect('/admin/users');
    });
});

// Delete User (Admin only)
router.get('/delete/:id', isAuthenticated, isAdmin, (req, res) => {
    const userId = req.params.id;
    db.query('DELETE FROM users WHERE id = ?', [userId], (err) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).send('Server Error');
        }
        res.redirect('/admin/users');
    });
});

module.exports = router;
