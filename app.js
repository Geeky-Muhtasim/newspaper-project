const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const session = require('express-session');
const db = require('./config/db');
const flash = require('connect-flash');
// Initialize environment variables
dotenv.config();

// Initialize Express app
const app = express();


// Middleware
app.use(bodyParser.urlencoded({ extended: true })); // Parse form data
app.use(bodyParser.json()); // Parse JSON data
app.use(express.static('public')); // Serve static files
app.use('/uploads', express.static('public/uploads'));
app.set('view engine', 'ejs'); // Set EJS as the template engine

// Session Middleware
app.use(session({
    secret: 'your_secret_key', // Use a strong secret key
    resave: false,
    saveUninitialized: true,
}));

// Flash Middleware
app.use(flash());

// Expose flash messages to views
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Import Routes
const adminRoutes = require('./routes/admin'); // Admin login and dashboard
const adminNewsRoutes = require('./routes/admin-news'); // Admin news management
const indexRoutes = require('./routes/index'); // Public-facing routes
const adminCategoriesRoutes = require('./routes/admin-categories');
const adminUsersRoutes = require('./routes/admin-users');


// Use Routes
app.use('/admin', adminRoutes); // Admin login and dashboard
app.use('/admin/news', adminNewsRoutes); // News management
app.use('/admin/categories', adminCategoriesRoutes);
app.use('/admin/users', adminUsersRoutes);
app.use('/', indexRoutes); // Public routes

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
