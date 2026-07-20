-- --------------------------------------------------------
-- Migration SQL: Add column `tanggal_lahir` to `users` table
-- Database: portalsespim
-- --------------------------------------------------------

USE `portalsespim`;

-- Syntax untuk menambahkan kolom tanggal_lahir bertipe DATE ke tabel users
ALTER TABLE `users` 
ADD COLUMN `tanggal_lahir` DATE NULL AFTER `phone`;
