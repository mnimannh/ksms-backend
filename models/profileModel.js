import db from '../db/connection.js';

export const getProfile = async (id) => {
  const [rows] = await db.query(
    `SELECT id, fullName, email, role, status, created_at, last_login,
            is_temp_password, phone, address, matric_no, course, year_of_study,
            profile_picture
     FROM user WHERE id = ?`,
    [id]
  );
  return rows[0];
};

export const updateProfile = async (id, { phone, address, matric_no, course, year_of_study }) => {
  await db.query(
    'UPDATE user SET phone=?, address=?, matric_no=?, course=?, year_of_study=? WHERE id=?',
    [phone || null, address || null, matric_no || null, course || null, year_of_study || null, id]
  );
};

export const changePassword = async (id, hashedPassword) => {
  await db.query(
    'UPDATE user SET password=?, is_temp_password=0 WHERE id=?',
    [hashedPassword, id]
  );
};

export const updateProfilePicture = async (id, url) => {
  await db.query('UPDATE user SET profile_picture=? WHERE id=?', [url, id]);
};

export const getProfilePictureUrl = async (id) => {
  const [rows] = await db.query('SELECT profile_picture FROM user WHERE id = ?', [id]);
  return rows[0]?.profile_picture || null;
};
