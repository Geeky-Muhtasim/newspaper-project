const bcrypt = require('bcrypt');
const plainPassword = 'admin123';
bcrypt.hash(plainPassword, 10, (err, hash) => {
    if (err) console.error('Hashing Error:', err);
    else console.log('Hashed Password:', hash);
});
