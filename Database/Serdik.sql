-- --------------------------------------------------------
-- TABLE STRUCTURE: `serdik_content`
-- Database: portalsespim
-- --------------------------------------------------------

USE `portalsespim`;

DROP TABLE IF EXISTS `serdik_content`;
CREATE TABLE `serdik_content` (
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

--
-- Dumping data for table `serdik_content`
--
INSERT INTO `serdik_content` (`id`, `title`, `category`, `date`, `status`, `author`) VALUES
('ser-1', 'Informasi Registrasi Peserta Didik Baru (Serdik) TA 2026', 'Pengumuman Serdik', '2026-07-01', 'Published', 'Admin'),
('ser-2', 'Panduan Tata Tertib & Kode Etik Serdik Sespim Polri', 'Pedoman Serdik', '2026-07-02', 'Published', 'Admin'),
('ser-3', 'Jadwal Kegiatan Belajar Mengajar & Seminar Serdik', 'Jadwal Kegiatan', '2026-07-03', 'Published', 'Admin'),
('ser-4', 'Direktori Karya Tulis & Naskah Akademik Serdik', 'Karya Tulis Serdik', '2026-07-04', 'Published', 'Admin');
