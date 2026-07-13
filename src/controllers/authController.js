import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const signToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'portalsespim_super_secret_jwt_key_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const register = async (req, res, next) => {
  try {
    const { name, nrp_nip, phone, password, role, role_label, keahlian, sertifikasi, program, angkatan, pangkat, gelar, foto, email, no_serdik, instansi_polri, kementerian_lembaga, negara_asal } = req.body;

    if (!name || !nrp_nip || !phone || !password || !role || !role_label) {
      return res.status(400).json({
        status: 'error',
        message: 'All fields (name, nrp_nip, phone, password, role, role_label) are required.'
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert user into the database
    const [result] = await pool.query(
      'INSERT INTO users (name, nrp_nip, phone, password, role, role_label, keahlian, sertifikasi, program, angkatan, pangkat, gelar, foto, email, no_serdik, instansi_polri, kementerian_lembaga, negara_asal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, nrp_nip, phone, hashedPassword, role, role_label, keahlian || null, sertifikasi || null, program || null, angkatan || null, pangkat || null, gelar || null, foto || null, email || null, no_serdik || null, instansi_polri || null, kementerian_lembaga || null, negara_asal || null]
    );

    const newUserId = result.insertId;

    // Generate token
    const token = signToken(newUserId);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: newUserId,
          name,
          nrp_nip,
          phone,
          role,
          role_label,
          keahlian: keahlian || null,
          sertifikasi: sertifikasi || null,
          program: program || null,
          angkatan: angkatan || null,
          pangkat: pangkat || null,
          gelar: gelar || null,
          foto: foto || null,
          email: email || null,
          no_serdik: no_serdik || null,
          instansi_polri: instansi_polri || null,
          kementerian_lembaga: kementerian_lembaga || null,
          negara_asal: negara_asal || null
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    // Support explicit nrp_nip or phone in request body as fallback
    const loginId = identifier || req.body.nrp_nip || req.body.phone;

    if (!loginId || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide nrp_nip/phone and password.'
      });
    }

    // Find user in database
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE nrp_nip = ? OR phone = ?',
      [loginId, loginId]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect nrp_nip/phone or password.'
      });
    }

    const user = rows[0];

    // Check password (fallback to plain text compare if not a bcrypt hash)
    let isMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = (password === user.password);
    }

    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect nrp_nip/phone or password.'
      });
    }

    // Generate token
    const token = signToken(user.id);

    // Remove password from response
    delete user.password;

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      status: 'success',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { nrp_nip, phone, new_password } = req.body;

    if (!nrp_nip || !phone || !new_password) {
      return res.status(400).json({
        status: 'error',
        message: 'NRP/NIP, Nomor HP, dan Kata Sandi baru wajib diisi.'
      });
    }

    // 1. Verify user exists with nrp_nip and phone
    const [rows] = await pool.query(
      'SELECT id FROM users WHERE nrp_nip = ? AND phone = ?',
      [nrp_nip, phone]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Kombinasi NRP/NIP dan Nomor HP tidak ditemukan di sistem.'
      });
    }

    // 2. Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 12);

    // 3. Update password in DB
    await pool.query(
      'UPDATE users SET password = ? WHERE nrp_nip = ? AND phone = ?',
      [hashedPassword, nrp_nip, phone]
    );

    res.status(200).json({
      status: 'success',
      message: 'Kata sandi berhasil diperbarui.'
    });
  } catch (error) {
    next(error);
  }
};
