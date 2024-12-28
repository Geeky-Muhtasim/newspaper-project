const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Adjust the path if necessary
// Homepage Route
router.get('/', (req, res) => {
  // Fetch all categories
  db.query('SELECT * FROM categories', (err, categories) => {
    if (err) {
      console.error('Database Error:', err);
      res.status(500).send('Server Error');
    } else {
      // Fetch all news for the homepage
      db.query(
        `SELECT news.*, categories.name AS category_name 
         FROM news 
         JOIN categories ON news.category_id = categories.id 
         ORDER BY news.created_at DESC`,
        (newsErr, newsResults) => {
          if (newsErr) {
            console.error('Database Error:', newsErr);
            res.status(500).send('Server Error');
          } else {
            res.render('layout', {
              title: 'Home - Bangladesh Newspaper',
              content: 'index', // Render `views/index.ejs`
              news: newsResults,
              categories, // Pass categories to the layout
            });
          }
        }
      );
    }
  });
});


// Category Page Route
router.get('/categories/:category', (req, res) => {
  const category = req.params.category;

  // Fetch all categories
  db.query('SELECT * FROM categories', (err, categories) => {
    if (err) {
      console.error('Database Error:', err);
      res.status(500).send('Server Error');
    } else {
      // Fetch news for the selected category
      db.query(
        `SELECT news.*, categories.name AS category_name 
         FROM news 
         JOIN categories ON news.category_id = categories.id 
         WHERE categories.name = ? 
         ORDER BY news.created_at DESC`,
        [category],
        (newsErr, newsResults) => {
          if (newsErr) {
            console.error('Database Error:', newsErr);
            res.status(500).send('Server Error');
          } else {
            res.render('layout', {
              title: `${category} News - Bangladesh Newspaper`,
              content: 'category', // Render `views/category.ejs`
              news: newsResults,
              categories, // Pass categories to the layout
              category, // Pass current category
            });
          }
        }
      );
    }
  });
});


router.get('/news/:id', (req, res) => {
  const newsId = req.params.id;

  // Fetch all categories for the navbar
  db.query('SELECT * FROM categories', (catErr, categories) => {
      if (catErr) {
          console.error('Database Error (Categories):', catErr);
          return res.status(500).send('Server Error');
      }

      // Fetch the current news article along with its category name
      db.query(
          `SELECT news.*, categories.name AS category_name 
           FROM news 
           JOIN categories ON news.category_id = categories.id 
           WHERE news.id = ?`, 
          [newsId], 
          (err, results) => {
              if (err) {
                  console.error('Database Error (News):', err);
                  return res.status(500).send('Server Error');
              } else if (results.length === 0) {
                  return res.status(404).send('News not found');
              } else {
                  const news = results[0];

                  // Fetch related news from the same category
                  db.query(
                      `SELECT news.*, categories.name AS category_name 
                       FROM news 
                       JOIN categories ON news.category_id = categories.id 
                       WHERE news.category_id = ? AND news.id != ? 
                       LIMIT 5`, 
                      [news.category_id, newsId],
                      (relatedErr, relatedResults) => {
                          if (relatedErr) {
                              console.error('Database Error (Related News):', relatedErr);
                              return res.status(500).send('Server Error');
                          } else {
                              res.render('layout', {
                                  title: news.title,
                                  content: 'news-detail', // Render `views/news-detail.ejs`
                                  news,
                                  relatedNews: relatedResults, // Pass related news
                                  categories, // Pass categories for the navbar
                              });
                          }
                      }
                  );
              }
          }
      );
  });
});


module.exports = router;
