-- ========================================
-- KSMS Database Schema (MySQL 12 Backup)
-- ========================================

CREATE DATABASE IF NOT EXISTS ksms;
USE ksms;

-- 1. Users
CREATE TABLE IF NOT EXISTS user (
    id INT NOT NULL AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL UNIQUE,
    fullName VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL DEFAULT NULL,
    role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
    PRIMARY KEY (id)
) ENGINE=InnoDB;

-- 2. Categories
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
    variant_name VARCHAR(50) NOT NULL UNIQUE,
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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

CREATE TABLE shift_assignment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    assignedBy INT NOT NULL,
    startTime DATETIME NOT NULL,
    endTime DATETIME NOT NULL,
    shiftType ENUM('Morning','Evening') DEFAULT 'Morning',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES user(id),
    FOREIGN KEY (assignedBy) REFERENCES user(id)
);

CREATE TABLE shift_attendance_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shiftID INT NOT NULL,
    userID INT NOT NULL,
    checkIn DATETIME,
    checkOut DATETIME,
    status ENUM('Pending','Completed','Late','Missed') DEFAULT 'Pending',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (shiftID) REFERENCES shift_assignment(id),
    FOREIGN KEY (userID) REFERENCES user(id)
);

CREATE TABLE payroll (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,               -- Employee
    month DATE NOT NULL,               -- Store first day of the month, e.g., '2026-01-01'
    hoursWorked DECIMAL(5,2) NOT NULL, -- Total hours worked in the month
    createdBy INT NOT NULL,            -- Admin who created the payroll
    isCreated BOOLEAN DEFAULT FALSE,   -- Payroll generated flag
    isReceived BOOLEAN DEFAULT FALSE,  -- Payroll paid flag
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES user(id),
    FOREIGN KEY (createdBy) REFERENCES user(id),
    UNIQUE KEY (userID, month)         -- Ensure one payroll record per user per month
);

