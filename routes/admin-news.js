const express = require('express');
const db = require('../config/db');
const router = express.Router();

// Middleware for checking authentication
const isAuthenticated = (req, res, next) => {
    if (!req.session.isAdmin) {
        return res.redirect('/admin/login'); // Redirect to login if not authenticated
    }
    next(); // Proceed to the next middleware or route
};

// View All News
router.get('/', isAuthenticated, (req, res) => {
    db.query(
        `SELECT news.*, categories.name AS category 
         FROM news JOIN categories ON news.category_id = categories.id`, 
        (err, results) => {
            if (err) {
                console.error('Database Error:', err);
                return res.status(500).send('Server Error');
            }
            res.render('admin/news', { title: 'Manage News', news: results });
        }
    );
});

// Add News Form
router.get('/add', isAuthenticated, (req, res) => {
    db.query('SELECT * FROM categories', (err, categories) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).send('Server Error');
        }
        res.render('admin/add-news', { title: 'Add News', categories });
    });
});

// Handle Adding News
router.post('/add', isAuthenticated, (req, res) => {
    const { title, content, category_id } = req.body;
    db.query(
        'INSERT INTO news (title, content, category_id) VALUES (?, ?, ?)',
        [title, content, category_id],
        (err) => {
            if (err) {
                console.error('Database Error:', err);
                return res.status(500).send('Server Error');
            }
            res.redirect('/admin/news');
        }
    );
});

// Edit News Form
router.get('/edit/:id', isAuthenticated, (req, res) => {
    const newsId = req.params.id;
    db.query('SELECT * FROM news WHERE id = ?', [newsId], (err, newsResults) => {
        if (err || newsResults.length === 0) {
            console.error('Database Error:', err || 'No News Found');
            return res.status(404).send('News Not Found');
        }
        db.query('SELECT * FROM categories', (err, categories) => {
            if (err) {
                console.error('Database Error:', err);
                return res.status(500).send('Server Error');
            }
            res.render('admin/edit-news', { title: 'Edit News', news: newsResults[0], categories });
        });
    });
});

// Handle Editing News
router.post('/edit/:id', isAuthenticated, (req, res) => {
    const newsId = req.params.id;
    const { title, content, category_id } = req.body;
    db.query(
        'UPDATE news SET title = ?, content = ?, category_id = ? WHERE id = ?',
        [title, content, category_id, newsId],
        (err) => {
            if (err) {
                console.error('Database Error:', err);
                return res.status(500).send('Server Error');
            }
            res.redirect('/admin/news');
        }
    );
});

// Delete News
router.get('/delete/:id', isAuthenticated, (req, res) => {
    const newsId = req.params.id;
    db.query('DELETE FROM news WHERE id = ?', [newsId], (err) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).send('Server Error');
        }
        res.redirect('/admin/news');
    });
});

module.exports = router;
