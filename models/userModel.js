import db from '../db/connection.js';

export const getUsersFromDB = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM user', (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};
