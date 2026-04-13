CREATE TABLE IF NOT EXISTS recommendation_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  client_ip VARCHAR(64) NULL,
  nama VARCHAR(120) NULL,
  budget INT NULL,
  usia INT NULL,
  butuh_pendampingan TINYINT(1) NULL,
  preferensi_hotel VARCHAR(32) NULL,
  tipe_transportasi VARCHAR(32) NULL,
  destinasi_tambahan VARCHAR(32) NULL,
  paket_utama VARCHAR(64) NULL,
  alternatif_count INT NOT NULL DEFAULT 0,
  status VARCHAR(24) NOT NULL DEFAULT 'success',
  PRIMARY KEY (id),
  KEY idx_recommendation_logs_created_at (created_at),
  KEY idx_recommendation_logs_paket_utama (paket_utama),
  KEY idx_recommendation_logs_status (status)
);
