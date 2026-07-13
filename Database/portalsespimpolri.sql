-- SQL Dump
-- Database: portalsespim
-- Target Server Type: MariaDB
-- Target Server Version: 10.4.32
-- Server Charset: UTF-8 Unicode (utf8mb4)
-- Client Connection Collation: utf8mb4_unicode_ci

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- DATABASE INITIALIZATION
-- --------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `portalsespim` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `portalsespim`;

-- --------------------------------------------------------
-- TABLE STRUCTURE: `users`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `nrp_nip` VARCHAR(50) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('super_admin', 'stakeholder', 'admin', 'serdik', 'widyaiswara') NOT NULL,
  `role_label` VARCHAR(100) NOT NULL,
  `keahlian` VARCHAR(255) DEFAULT NULL,
  `sertifikasi` VARCHAR(255) DEFAULT NULL,
  `program` VARCHAR(100) DEFAULT NULL,
  `angkatan` VARCHAR(100) DEFAULT NULL,
  `pangkat` VARCHAR(100) DEFAULT NULL,
  `gelar` VARCHAR(100) DEFAULT NULL,
  `foto` LONGTEXT DEFAULT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `no_serdik` VARCHAR(50) DEFAULT NULL,
  `instansi_polri` VARCHAR(150) DEFAULT NULL,
  `kementerian_lembaga` VARCHAR(150) DEFAULT NULL,
  `negara_asal` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nrp_nip_unique` (`nrp_nip`),
  UNIQUE KEY `phone_unique` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- TABLE STRUCTURE: `beranda_content`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `beranda_content`;
CREATE TABLE `beranda_content` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `date` DATE NOT NULL,
  `status` ENUM('Published', 'Draft') NOT NULL DEFAULT 'Published',
  `author` VARCHAR(100) DEFAULT 'Admin',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- TABLE STRUCTURE: `profil_content`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `profil_content`;
CREATE TABLE `profil_content` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `date` DATE NOT NULL,
  `status` ENUM('Published', 'Draft') NOT NULL DEFAULT 'Published',
  `author` VARCHAR(100) DEFAULT 'Admin',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- TABLE STRUCTURE: `program_pendidikan_content`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `program_pendidikan_content`;
CREATE TABLE `program_pendidikan_content` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `date` DATE NOT NULL,
  `status` ENUM('Published', 'Draft') NOT NULL DEFAULT 'Published',
  `author` VARCHAR(100) DEFAULT 'Admin',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- TABLE STRUCTURE: `kelembagaan_internal_content`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `kelembagaan_internal_content`;
CREATE TABLE `kelembagaan_internal_content` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `date` DATE NOT NULL,
  `status` ENUM('Published', 'Draft') NOT NULL DEFAULT 'Published',
  `author` VARCHAR(100) DEFAULT 'Admin',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- TABLE STRUCTURE: `widyaiswara_content`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `widyaiswara_content`;
CREATE TABLE `widyaiswara_content` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `date` DATE NOT NULL,
  `status` ENUM('Published', 'Draft') NOT NULL DEFAULT 'Published',
  `author` VARCHAR(100) DEFAULT 'Admin',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- TABLE STRUCTURE: `publikasi_content`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `publikasi_content`;
CREATE TABLE `publikasi_content` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `date` DATE NOT NULL,
  `status` ENUM('Published', 'Draft') NOT NULL DEFAULT 'Published',
  `author` VARCHAR(100) DEFAULT 'Admin',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- TABLE STRUCTURE: `berita_informasi_content`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `berita_informasi_content`;
CREATE TABLE `berita_informasi_content` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `date` DATE NOT NULL,
  `status` ENUM('Published', 'Draft') NOT NULL DEFAULT 'Published',
  `author` VARCHAR(100) DEFAULT 'Admin',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- TABLE STRUCTURE: `galeri_unduhan_content`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `galeri_unduhan_content`;
CREATE TABLE `galeri_unduhan_content` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `date` DATE NOT NULL,
  `status` ENUM('Published', 'Draft') NOT NULL DEFAULT 'Published',
  `author` VARCHAR(100) DEFAULT 'Admin',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- TABLE STRUCTURE: `kontak_content`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `kontak_content`;
CREATE TABLE `kontak_content` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `date` DATE NOT NULL,
  `status` ENUM('Published', 'Draft') NOT NULL DEFAULT 'Published',
  `author` VARCHAR(100) DEFAULT 'Admin',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- TABLE STRUCTURE: `sarana_prasarana_content`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `sarana_prasarana_content`;
CREATE TABLE `sarana_prasarana_content` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `date` DATE NOT NULL,
  `status` ENUM('Published', 'Draft') NOT NULL DEFAULT 'Published',
  `author` VARCHAR(100) DEFAULT 'Admin',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- DATA DUMP
-- --------------------------------------------------------

--
-- Dumping data for table `users`
--
INSERT INTO `users` (`name`, `nrp_nip`, `phone`, `password`, `role`, `role_label`) VALUES
('Irjen Pol. Midi Siswoko, S.I.K.', '70012124', '081122334455', 'polri123', 'stakeholder', 'Super Admin Read Only / Stakeholder'),
('Brigjen Pol. Dr. H. Nurholis', '197505121998031002', '081199887766', 'polri123', 'stakeholder', 'Super Admin Read Only / Stakeholder'),
('Bripda Bagus Prasetyo', '200108242022031001', '081234567890', 'polri123', 'admin', 'Admin (Staf)'),
('AKBP Deny Haryanto, S.I.K., M.Si.', '84081234', '081388889999', 'polri123', 'serdik', 'User Serdik (Peserta Didik)'),
('Irjen Pol. Chuzaini Patoppoi, S.St.Mk., S.H.', '68120455', '081277776666', 'polri123', 'widyaiswara', 'User Widyaiswara (Tenaga Pendidik)');
--
-- Dumping data for table `widyaiswara_content`
--
INSERT INTO `widyaiswara_content` (`id`, `title`, `category`, `date`, `status`) VALUES
('w-1', 'Profil Tenaga Pendidik', 'Profil Widyaiswara', '2026-07-01', 'Published'),
('w-2', 'Daftar Kompetensi & Bidang Keahlian', 'Bidang Keahlian', '2026-07-02', 'Published'),
('w-3', 'Publikasi Karya Widyaiswara', 'Publikasi Widyaiswara', '2026-07-02', 'Published'),
('w-4', 'Materi Kuliah Terbuka Serdik', 'Materi Terbuka', '2026-07-03', 'Published'),
('w-5', 'Progress Pembimbingan Naskap', 'Pembimbingan Naskap', '2026-07-03', 'Published'),
('w-6', 'Sistem Inpassing Jabatan Fungsional', 'Inpassing', '2026-07-04', 'Published'),
('w-7', 'Sertifikasi BNSP / LSP Lemdiklat', 'LSP / BNSP', '2026-07-04', 'Published');

COMMIT;
SET FOREIGN_KEY_CHECKS = 1;
