import pool from '../config/db.js';

export const tableMap = {
  'beranda-content': 'beranda_content',
  'profil-content': 'profil_content',
  'program-pendidikan-content': 'program_pendidikan_content',
  'kelembagaan-internal-content': 'kelembagaan_internal_content',
  'widyaiswara-content': 'widyaiswara_content',
  'publikasi-content': 'publikasi_content',
  'berita-informasi-content': 'berita_informasi_content',
  'galeri-unduhan-content': 'galeri_unduhan_content',
  'kontak-content': 'kontak_content',
  'sarana-prasarana-content': 'sarana_prasarana_content'
};

const prefixMap = {
  'beranda_content': 'h',
  'profil_content': 'p',
  'program_pendidikan_content': 'e',
  'kelembagaan_internal_content': 'k',
  'widyaiswara_content': 'w',
  'publikasi_content': 'pub',
  'berita_informasi_content': 'n',
  'galeri_unduhan_content': 'g',
  'kontak_content': 'con',
  'sarana_prasarana_content': 's'
};

// Middleware to inject and validate table name
export const checkContentType = (req, res, next) => {
  const type = req.params.contentType;
  const tableName = tableMap[type];

  if (!tableName) {
    return res.status(404).json({
      status: 'error',
      message: `Content type '${type}' is invalid. Supported types: ${Object.keys(tableMap).join(', ')}`
    });
  }

  req.tableName = tableName;
  next();
};

export const getAllContent = async (req, res, next) => {
  try {
    const { search, category, status, author, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `SELECT * FROM ${req.tableName}`;
    let countQuery = `SELECT COUNT(*) as total FROM ${req.tableName}`;
    
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(title LIKE ? OR author LIKE ? OR category LIKE ? OR content LIKE ?)');
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (author) {
      conditions.push('author = ?');
      params.push(author);
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    
    // For LIMIT and OFFSET in mysql2, they must be numbers if passed as values
    const countParams = [...params];
    params.push(parseInt(limit), offset);

    // Run both count and select queries
    const [totalRows] = await pool.query(countQuery, countParams);
    const [rows] = await pool.query(query, params);

    const total = totalRows[0].total;
    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      status: 'success',
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      },
      data: {
        records: rows
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getContentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(`SELECT * FROM ${req.tableName} WHERE id = ?`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Record with ID '${id}' not found in ${req.tableName}.`
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        record: rows[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createContent = async (req, res, next) => {
  try {
    const { id, title, category, date, status, author, image_url, content } = req.body;

    if (!title || !category || !date) {
      return res.status(400).json({
        status: 'error',
        message: 'Fields (title, category, date) are required.'
      });
    }

    // Auto-generate ID if not provided
    let finalId = id;
    if (!finalId) {
      const prefix = prefixMap[req.tableName] || 'c';
      // Query database for all IDs in this table to determine next number
      const [rows] = await pool.query(`SELECT id FROM ${req.tableName} WHERE id LIKE ?`, [`${prefix}-%`]);
      let maxNum = 0;
      for (const row of rows) {
        const parts = row.id.split('-');
        const num = parts.length > 1 ? parseInt(parts[parts.length - 1]) : NaN;
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
      finalId = `${prefix}-${maxNum + 1}`;
    }

    const recordStatus = status || 'Published';
    const recordAuthor = author || 'Admin';
    const recordImageUrl = image_url || null;
    const recordContent = content || null;

    await pool.query(
      `INSERT INTO ${req.tableName} (id, title, category, date, status, author, image_url, content) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [finalId, title, category, date, recordStatus, recordAuthor, recordImageUrl, recordContent]
    );

    // Retrieve inserted record
    const [inserted] = await pool.query(`SELECT * FROM ${req.tableName} WHERE id = ?`, [finalId]);

    res.status(201).json({
      status: 'success',
      data: {
        record: inserted[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateContent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, category, date, status, author, image_url, content } = req.body;

    // Check if record exists
    const [existing] = await pool.query(`SELECT * FROM ${req.tableName} WHERE id = ?`, [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Record with ID '${id}' not found in ${req.tableName}.`
      });
    }

    const updatedTitle = title !== undefined ? title : existing[0].title;
    const updatedCategory = category !== undefined ? category : existing[0].category;
    const updatedDate = date !== undefined ? date : existing[0].date;
    const updatedStatus = status !== undefined ? status : existing[0].status;
    const updatedAuthor = author !== undefined ? author : existing[0].author;
    const updatedImageUrl = image_url !== undefined ? image_url : existing[0].image_url;
    const updatedContent = content !== undefined ? content : existing[0].content;

    await pool.query(
      `UPDATE ${req.tableName} SET title = ?, category = ?, date = ?, status = ?, author = ?, image_url = ?, content = ? WHERE id = ?`,
      [updatedTitle, updatedCategory, updatedDate, updatedStatus, updatedAuthor, updatedImageUrl, updatedContent, id]
    );

    // Retrieve updated record
    const [updated] = await pool.query(`SELECT * FROM ${req.tableName} WHERE id = ?`, [id]);

    res.status(200).json({
      status: 'success',
      data: {
        record: updated[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteContent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(`SELECT * FROM ${req.tableName} WHERE id = ?`, [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: `Record with ID '${id}' not found in ${req.tableName}.`
      });
    }

    await pool.query(`DELETE FROM ${req.tableName} WHERE id = ?`, [id]);

    res.status(200).json({
      status: 'success',
      message: `Record with ID '${id}' has been deleted successfully from ${req.tableName}.`
    });
  } catch (error) {
    next(error);
  }
};
