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
    status ENUM('active', 'inactive') DEFAULT 'active';
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
    variant_name VARCHAR(50) UNIQUE,
    quantity INT DEFAULT 0,
    price DECIMAL(10,2) NOT NULL,
    barcode VARCHAR(50) UNIQUE NOT NULL,
    threshold INT DEFAULT 10,
    lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_variants_inventory FOREIGN KEY (inventory_id)
        REFERENCES inventory(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Product Images
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    variant_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_main TINYINT(1) DEFAULT 0,       
    image_order TINYINT UNSIGNED,        
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_images_variant FOREIGN KEY (variant_id)
        REFERENCES variants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Low Stock Alerts
CREATE TABLE IF NOT EXISTS low_stock_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    variant_id INT NOT NULL,
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
    userID INT NOT NULL,            
    month DATE NOT NULL,               
    hoursWorked DECIMAL(5,2) NOT NULL, 
    createdBy INT NOT NULL,          
    isCreated BOOLEAN DEFAULT FALSE,   
    isReceived BOOLEAN DEFAULT FALSE,  
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES user(id),
    FOREIGN KEY (createdBy) REFERENCES user(id),
    UNIQUE KEY (userID, month)        
);

CREATE TABLE rfid(
    id INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    rfid_uid VARCHAR(50) NOT NULL UNIQUE,   -- UID from RC522
    card_name VARCHAR(50),                  -- Optional label
    is_active BOOLEAN DEFAULT TRUE,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE load_cells (
    id INT AUTO_INCREMENT PRIMARY KEY,
    variant_id INT NOT NULL,
    sensor_uid VARCHAR(50) NOT NULL UNIQUE,   -- ESP32 / HX711 ID
    calibration_factor DECIMAL(10,4) NOT NULL,
    empty_weight DECIMAL(10,2) NOT NULL,      -- Container weight
    unit_weight DECIMAL(10,2) NOT NULL,       -- Weight per item
    is_active BOOLEAN DEFAULT TRUE,
    installed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (variant_id) REFERENCES variants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE load_cell_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    load_cell_id INT NOT NULL,
    weight DECIMAL(10,2) NOT NULL,
    calculated_quantity INT NOT NULL,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (load_cell_id) REFERENCES load_cells(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ===============================
-- 1️⃣ Orders table
-- ===============================
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
--  Order items table
-- ===============================
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  variant_id INT NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES variants(id)
);