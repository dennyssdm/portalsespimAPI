import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'portalsespim_super_secret_jwt_key_2026');

      // Get user from the database
      const [rows] = await pool.query(
        'SELECT id, name, nrp_nip, phone, role, role_label, keahlian, sertifikasi, program, angkatan, pangkat, gelar, foto, email, no_serdik, instansi_polri, kementerian_lembaga, negara_asal, created_at, updated_at FROM users WHERE id = ?',
        [decoded.id]
      );

      if (rows.length === 0) {
        return res.status(401).json({
          status: 'error',
          message: 'The user belonging to this token no longer exists.'
        });
      }

      req.user = rows[0];
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized, token failed or expired.'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized, no token provided.'
    });
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action.'
      });
    }
    next();
  };
};
