# =============================================================================
# UNITS TABLE SCHEMA
# =============================================================================
# Üniteler tablosu için Python şeması
# =============================================================================

UNITS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS units (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    unit_id VARCHAR(100) NOT NULL,
    subject_id INT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    INDEX idx_units_name (name),
    INDEX idx_units_unit_id (unit_id),
    INDEX idx_units_subject (subject_id),
    INDEX idx_units_active (is_active),
    UNIQUE KEY unique_unit_subject (unit_id, subject_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
"""

# JSON dosyalarından dinamik olarak doldurulacak
UNITS_SAMPLE_DATA = "" 