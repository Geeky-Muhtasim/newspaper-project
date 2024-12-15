const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Adjust the path if necessary
// Homepage Route
router.get('/', (req, res) => {
  res.render('layout', {
    title: 'Home - Bangladesh Newspaper',
    content: 'index', // This refers to the `views/index.ejs` file
  });
});

// Category Page Route
router.get('/categories/:category', (req, res) => {
  const category = req.params.category;

  // Dummy news data for demonstration
  const news = [
    { id: 1, title: `Sample ${category} News`, content: 'This is a sample news content.' },
    { id: 2, title: `${category} Update`, content: 'Another example of news content.' },
  ];

  res.render('layout', {
    title: `${category} News - Bangladesh Newspaper`,
    content: 'category', // This refers to the `views/category.ejs` file
    news,
    category,
  });
});

// News Detail Route with Related News
router.get('/news/:id', (req, res) => {
    const newsId = req.params.id;
  
    // Fetch the current news article
    db.query('SELECT * FROM news WHERE id = ?', [newsId], (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send('Server Error');
      } else if (results.length === 0) {
        res.status(404).send('News not found');
      } else {
        const news = results[0];
  
        // Fetch related news from the same category
        db.query(
          'SELECT * FROM news WHERE category = ? AND id != ? LIMIT 5',
          [news.category, newsId],
          (relatedErr, relatedResults) => {
            if (relatedErr) {
              console.error(relatedErr);
              res.status(500).send('Server Error');
            } else {
              res.render('layout', {
                title: news.title,
                content: 'news-detail',
                news,
                relatedNews: relatedResults, // Pass related news to the view
              });
            }
          }
        );
      }
    });
  });
  

module.exports = router;
