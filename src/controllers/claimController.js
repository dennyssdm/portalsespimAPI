import pool from '../config/db.js';

export const getAllClaims = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM inpassing_claims ORDER BY completed_at DESC');
    res.status(200).json({
      status: 'success',
      data: {
        claims: rows
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createClaim = async (req, res, next) => {
  try {
    const { nrp_nip, name } = req.body;
    if (!nrp_nip || !name) {
      return res.status(400).json({
        status: 'error',
        message: 'NRP/NIP and name are required.'
      });
    }

    // Generate a unique certificate code
    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
    const certificate_code = `CERT-INP-${nrp_nip}-${uniqueSuffix}`;

    await pool.query(
      'INSERT INTO inpassing_claims (nrp_nip, name, certificate_code) VALUES (?, ?, ?)',
      [nrp_nip, name, certificate_code]
    );

    const [inserted] = await pool.query('SELECT * FROM inpassing_claims WHERE certificate_code = ?', [certificate_code]);

    res.status(201).json({
      status: 'success',
      data: {
        claim: inserted[0]
      }
    });
  } catch (error) {
    // Prevent duplicate entries for the same user
    if (error.code === 'ER_DUP_ENTRY') {
      try {
        const [existing] = await pool.query('SELECT * FROM inpassing_claims WHERE nrp_nip = ?', [nrp_nip]);
        if (existing.length > 0) {
          return res.status(200).json({
            status: 'success',
            data: {
              claim: existing[0]
            }
          });
        }
      } catch (err) {
        next(err);
      }
    }
    next(error);
  }
};
