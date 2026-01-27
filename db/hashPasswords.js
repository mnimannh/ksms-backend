import db from './db/connection.js'; // your DB connection
import bcrypt from 'bcrypt';

const saltRounds = 12;
//to run this node hashPasswords.js
async function hashAllPasswords() {
  try {
    // 1. Get all users
    const [users] = await db.query('SELECT id, password FROM user');

    for (const user of users) {
      const plainPassword = user.password;

      // 2. Hash the password
      const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

      // 3. Update DB with hashed password
      await db.query('UPDATE user SET password = ? WHERE id = ?', [hashedPassword, user.id]);
      console.log(`User ${user.id} password hashed.`);
    }

    console.log('All passwords hashed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error hashing passwords:', err);
    process.exit(1);
  }
}

hashAllPasswords();
