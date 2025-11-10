-- ========================================
-- KSMS Database Schema (MySQL 12 Backup)
-- ========================================

CREATE DATABASE IF NOT EXISTS ksms;
USE ksms;

-- 1. Users
CREATE TABLE IF NOT EXISTS user (
    userID INT NOT NULL AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL UNIQUE,
    fullName VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
    PRIMARY KEY (userID)
) ENGINE=InnoDB;

-- 2. Categories
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- 3. Inventory (Products)
CREATE TABLE IF NOT EXISTS inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inventoryName VARCHAR(150) NOT NULL,
    category_id INT NOT NULL,
    description TEXT,
    default_threshold INT DEFAULT 10,
    lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventory_category FOREIGN KEY (category_id)
        REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Variants
CREATE TABLE IF NOT EXISTS variants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inventory_id INT NOT NULL,
    variant_name VARCHAR(50),
    quantity INT DEFAULT 0,
    price DECIMAL(10,2) NOT NULL,
    barcode VARCHAR(50) UNIQUE NOT NULL,
    lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_variants_inventory FOREIGN KEY (inventory_id)
        REFERENCES inventory(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Product Images
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    variant_id INT NOT NULL,
    image_url VARCHAR(255),
    CONSTRAINT fk_images_variant FOREIGN KEY (variant_id)
        REFERENCES variants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Low Stock Alerts
CREATE TABLE IF NOT EXISTS low_stock_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    variant_id INT NOT NULL,
    threshold INT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alerts_variant FOREIGN KEY (variant_id)
        REFERENCES variants(id) ON DELETE CASCADE,
    UNIQUE KEY ux_variant_unread (variant_id, is_read)
) ENGINE=InnoDB;
