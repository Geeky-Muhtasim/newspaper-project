const express = require('express');
const db = require('../config/db');
const router = express.Router();

// Middleware for authentication
const isAuthenticated = (req, res, next) => {
    if (!req.session.isAdmin) {
        return res.redirect('/admin/login');
    }
    next();
};

// View All Categories
router.get('/', isAuthenticated, (req, res) => {
    db.query('SELECT * FROM categories', (err, results) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).send('Server Error');
        }
        res.render('admin/categories', { title: 'Manage Categories', categories: results });
    });
});

// Add Category Form
router.get('/add', isAuthenticated, (req, res) => {
    res.render('admin/add-category', { title: 'Add Category' });
});

// Handle Adding Category
router.post('/add', isAuthenticated, (req, res) => {
    const { name } = req.body;
    db.query('INSERT INTO categories (name) VALUES (?)', [name], (err) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).send('Server Error');
        }
        res.redirect('/admin/categories');
    });
});

// Edit Category Form
router.get('/edit/:id', isAuthenticated, (req, res) => {
    const categoryId = req.params.id;
    db.query('SELECT * FROM categories WHERE id = ?', [categoryId], (err, results) => {
        if (err || results.length === 0) {
            console.error('Database Error:', err || 'Category Not Found');
            return res.status(404).send('Category Not Found');
        }
        res.render('admin/edit-category', { title: 'Edit Category', category: results[0] });
    });
});

// Handle Editing Category
router.post('/edit/:id', isAuthenticated, (req, res) => {
    const categoryId = req.params.id;
    const { name } = req.body;
    db.query('UPDATE categories SET name = ? WHERE id = ?', [name, categoryId], (err) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).send('Server Error');
        }
        res.redirect('/admin/categories');
    });
});

// Delete Category
router.get('/delete/:id', isAuthenticated, (req, res) => {
    const categoryId = req.params.id;
    db.query('DELETE FROM categories WHERE id = ?', [categoryId], (err) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).send('Server Error');
        }
        res.redirect('/admin/categories');
    });
});

module.exports = router;
