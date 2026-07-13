import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const { search, role } = req.query;
    let query = 'SELECT id, name, nrp_nip, phone, role, role_label, keahlian, sertifikasi, program, angkatan, pangkat, gelar, foto, email, no_serdik, instansi_polri, kementerian_lembaga, negara_asal, created_at, updated_at FROM users';
    const params = [];
    const conditions = [];

    if (search) {
      conditions.push('(name LIKE ? OR nrp_nip LIKE ? OR phone LIKE ?)');
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    if (role) {
      conditions.push('role = ?');
      params.push(role);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY id DESC';

    const [users] = await pool.query(query, params);

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      'SELECT id, name, nrp_nip, phone, role, role_label, keahlian, sertifikasi, program, angkatan, pangkat, gelar, foto, email, no_serdik, instansi_polri, kementerian_lembaga, negara_asal, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `User with ID ${id} not found.`
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: rows[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, nrp_nip, phone, password, role, role_label, keahlian, sertifikasi, program, angkatan, pangkat, gelar, foto, email, no_serdik, instansi_polri, kementerian_lembaga, negara_asal } = req.body;

    if (!name || !nrp_nip || !phone || !password || !role || !role_label) {
      return res.status(400).json({
        status: 'error',
        message: 'All fields (name, nrp_nip, phone, password, role, role_label) are required.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await pool.query(
      'INSERT INTO users (name, nrp_nip, phone, password, role, role_label, keahlian, sertifikasi, program, angkatan, pangkat, gelar, foto, email, no_serdik, instansi_polri, kementerian_lembaga, negara_asal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, nrp_nip, phone, hashedPassword, role, role_label, keahlian || null, sertifikasi || null, program || null, angkatan || null, pangkat || null, gelar || null, foto || null, email || null, no_serdik || null, instansi_polri || null, kementerian_lembaga || null, negara_asal || null]
    );

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: result.insertId,
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

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, nrp_nip, phone, password, role, role_label, keahlian, sertifikasi, program, angkatan, pangkat, gelar, foto, email, no_serdik, instansi_polri, kementerian_lembaga, negara_asal } = req.body;
 
    // Check if user exists first
    const [existing] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `User with ID ${id} not found.`
      });
    }
 
    let query = 'UPDATE users SET name = ?, nrp_nip = ?, phone = ?, role = ?, role_label = ?, keahlian = ?, sertifikasi = ?, program = ?, angkatan = ?, pangkat = ?, gelar = ?, foto = ?, email = ?, no_serdik = ?, instansi_polri = ?, kementerian_lembaga = ?, negara_asal = ?';
    const params = [
      name || existing[0].name,
      nrp_nip || existing[0].nrp_nip,
      phone || existing[0].phone,
      role || existing[0].role,
      role_label || existing[0].role_label,
      keahlian !== undefined ? keahlian : existing[0].keahlian,
      sertifikasi !== undefined ? sertifikasi : existing[0].sertifikasi,
      program !== undefined ? program : existing[0].program,
      angkatan !== undefined ? angkatan : existing[0].angkatan,
      pangkat !== undefined ? pangkat : existing[0].pangkat,
      gelar !== undefined ? gelar : existing[0].gelar,
      foto !== undefined ? foto : existing[0].foto,
      email !== undefined ? email : existing[0].email,
      no_serdik !== undefined ? no_serdik : existing[0].no_serdik,
      instansi_polri !== undefined ? instansi_polri : existing[0].instansi_polri,
      kementerian_lembaga !== undefined ? kementerian_lembaga : existing[0].kementerian_lembaga,
      negara_asal !== undefined ? negara_asal : existing[0].negara_asal
    ];
 
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      query += ', password = ?';
      params.push(hashedPassword);
    }
 
    query += ' WHERE id = ?';
    params.push(id);
 
    await pool.query(query, params);
 
    // Get the updated user details
    const [updated] = await pool.query(
      'SELECT id, name, nrp_nip, phone, role, role_label, keahlian, sertifikasi, program, angkatan, pangkat, gelar, foto, email, no_serdik, instansi_polri, kementerian_lembaga, negara_asal, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        user: updated[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `User with ID ${id} not found.`
      });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);

    res.status(200).json({
      status: 'success',
      message: `User with ID ${id} has been deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};
