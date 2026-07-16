import pool from '../config/db.js';

// 1. Log a new user activity (both public and authenticated visits)
export const logActivity = async (req, res, next) => {
  try {
    const { userId, name, nrp_nip, role, action, ipAddress, userAgent } = req.body;

    if (!action) {
      return res.status(400).json({
        status: 'error',
        message: 'Action is required to log activity.'
      });
    }

    const resolvedIp = ipAddress || req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const resolvedUserAgent = userAgent || req.headers['user-agent'];

    await pool.query(
      'INSERT INTO activity_logs (user_id, name, nrp_nip, role, action, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        userId || null,
        name || null,
        nrp_nip || null,
        role || null,
        action,
        resolvedIp,
        resolvedUserAgent
      ]
    );

    // Count total unique visitor IPs as the visitor number
    const [uniqueIpsRow] = await pool.query('SELECT COUNT(DISTINCT ip_address) as count FROM activity_logs');
    const visitorNumber = uniqueIpsRow[0].count;

    res.status(201).json({
      status: 'success',
      message: 'Activity logged successfully.',
      visitorNumber
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get high-level activity stats
export const getActivityStats = async (req, res, next) => {
  try {
    const [totalRow] = await pool.query('SELECT COUNT(*) as count FROM activity_logs');
    const [uniqueIpsRow] = await pool.query('SELECT COUNT(DISTINCT ip_address) as count FROM activity_logs');
    const [uniqueUsersRow] = await pool.query('SELECT COUNT(DISTINCT user_id) as count FROM activity_logs WHERE user_id IS NOT NULL');
    
    // Grouped by role
    const [roleStats] = await pool.query(
      'SELECT role, COUNT(*) as count FROM activity_logs WHERE role IS NOT NULL GROUP BY role'
    );

    // Grouped by action
    const [actionStats] = await pool.query(
      'SELECT action, COUNT(*) as count FROM activity_logs GROUP BY action ORDER BY count DESC LIMIT 10'
    );

    res.status(200).json({
      status: 'success',
      data: {
        totalLogs: totalRow[0].count,
        uniqueIps: uniqueIpsRow[0].count,
        uniqueUsers: uniqueUsersRow[0].count,
        byRole: roleStats,
        byAction: actionStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// 3. Get top active users (Widyaiswara & Serdik)
export const getActiveUsersRanking = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        user_id, 
        name, 
        nrp_nip, 
        role, 
        COUNT(*) as total_visits,
        MAX(created_at) as last_active 
       FROM activity_logs 
       WHERE user_id IS NOT NULL 
       GROUP BY user_id, name, nrp_nip, role 
       ORDER BY total_visits DESC 
       LIMIT 50`
    );

    res.status(200).json({
      status: 'success',
      data: {
        ranking: rows
      }
    });
  } catch (error) {
    next(error);
  }
};

// 4. Delete/Clear logs (Optional admin maintenance)
export const clearLogs = async (req, res, next) => {
  try {
    await pool.query('TRUNCATE TABLE activity_logs');
    res.status(200).json({
      status: 'success',
      message: 'All activity logs cleared successfully.'
    });
  } catch (error) {
    next(error);
  }
};
