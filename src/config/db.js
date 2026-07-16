import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'portalsespim',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection and auto-create activity_logs table
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully.');
    
    // Auto-create activity_logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`activity_logs\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT DEFAULT NULL,
        \`name\` VARCHAR(150) DEFAULT NULL,
        \`nrp_nip\` VARCHAR(50) DEFAULT NULL,
        \`role\` VARCHAR(50) DEFAULT NULL,
        \`action\` VARCHAR(255) NOT NULL,
        \`ip_address\` VARCHAR(50) DEFAULT NULL,
        \`user_agent\` VARCHAR(255) DEFAULT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Table "activity_logs" verified/created successfully.');
    
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.error('Please make sure your MySQL/MariaDB server is running and the database details in .env are correct.');
  }
})();

export default pool;
