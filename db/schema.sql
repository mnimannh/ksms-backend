-- ========================================
-- KSMS Database Schema (Fixed & Optimized)
-- ========================================

SET FOREIGN_KEY_CHECKS = 0; -- Turns off constraint checking while building

CREATE DATABASE IF NOT EXISTS ksms;
USE ksms;

-- 1. Users
CREATE TABLE IF NOT EXISTS `user` (
    id INT NOT NULL AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL UNIQUE,
    fullName VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_temp_password TINYINT(1) NOT NULL DEFAULT 0,
    phone VARCHAR(20) DEFAULT NULL,
    address TEXT DEFAULT NULL,
    matric_no VARCHAR(50) DEFAULT NULL,
    course VARCHAR(100) DEFAULT NULL,
    year_of_study TINYINT DEFAULT NULL,
    profile_picture VARCHAR(255) DEFAULT NULL,
    reset_token VARCHAR(100) DEFAULT NULL,
    reset_token_expiry DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL DEFAULT NULL,
    role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
    status ENUM('active', 'inactive') DEFAULT 'active',
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
    cost_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    price DECIMAL(10,2) NOT NULL,
    barcode VARCHAR(50) UNIQUE NOT NULL,
    threshold INT DEFAULT 10,
    stock_tracking_type ENUM('manual','load_cell') DEFAULT 'manual',
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

-- 7. Shift Assignment
CREATE TABLE IF NOT EXISTS shift_assignment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    assignedBy INT NOT NULL,
    startTime DATETIME NOT NULL,
    endTime DATETIME NOT NULL,
    shiftType ENUM('Morning','Evening') DEFAULT 'Morning',
    status ENUM('draft','published') NOT NULL DEFAULT 'published',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES user(id),
    FOREIGN KEY (assignedBy) REFERENCES user(id)
) ENGINE=InnoDB;

-- 8. Shift Swap Request
CREATE TABLE IF NOT EXISTS shift_swap_request (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    requester_id INT NOT NULL,
    target_id    INT NOT NULL,
    shift_id     INT NOT NULL,
    target_shift_id INT DEFAULT NULL,
    status       ENUM('pending','accepted','rejected','approved','cancelled') DEFAULT 'pending',
    admin_note   TEXT,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id)   REFERENCES user(id),
    FOREIGN KEY (target_id)      REFERENCES user(id),
    FOREIGN KEY (shift_id)       REFERENCES shift_assignment(id) ON DELETE CASCADE,
    FOREIGN KEY (target_shift_id) REFERENCES shift_assignment(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 9. Shift Attendance Log
CREATE TABLE IF NOT EXISTS shift_attendance_log (
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
) ENGINE=InnoDB;

-- 10. Payroll (Fixed syntax error here)
CREATE TABLE IF NOT EXISTS payroll (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,            
    month DATE NOT NULL,               
    hoursWorked DECIMAL(5,2) NOT NULL, 
    totalPay DECIMAL(10,2), -- Fixed: Removed the breaking semicolon and AFTER clause
    createdBy INT NOT NULL,          
    isCreated BOOLEAN DEFAULT FALSE,   
    isReceived BOOLEAN DEFAULT FALSE,  
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES user(id),
    FOREIGN KEY (createdBy) REFERENCES user(id),
    UNIQUE KEY (userID, month)        
) ENGINE=InnoDB;

-- 11. RFID
CREATE TABLE IF NOT EXISTS rfid(
    id INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    rfid_uid VARCHAR(50) NOT NULL UNIQUE,   
    card_name VARCHAR(50),                                 
    is_active BOOLEAN DEFAULT TRUE,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 12. Load Cells
CREATE TABLE IF NOT EXISTS load_cells (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sensor_uid VARCHAR(100) NOT NULL UNIQUE,
    variant_id INT NULL,
    calibration_factor DECIMAL(10,4),
    empty_weight DECIMAL(10,2),
    unit_weight DECIMAL(10,2),
    latest_weight DECIMAL(10,2) DEFAULT 0,
    calculated_quantity INT DEFAULT 0,
    status ENUM('unassigned','active','inactive') DEFAULT 'unassigned',
    last_seen DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (variant_id) REFERENCES variants(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 13. Load Cell Logs
CREATE TABLE IF NOT EXISTS load_cell_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    load_cell_id INT NOT NULL,
    weight DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (load_cell_id) REFERENCES load_cells(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 14. Orders
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 15. Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  variant_id INT NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES variants(id)
) ENGINE=InnoDB;

-- 16. Rule-based Operational Insights
CREATE TABLE IF NOT EXISTS rule_insights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rule_id VARCHAR(20) NOT NULL,
    variant_id INT NOT NULL,
    message TEXT NOT NULL,
    severity ENUM('info', 'warning', 'critical') DEFAULT 'warning',
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_insights_variant FOREIGN KEY (variant_id)
        REFERENCES variants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 17. Hourly Rate
CREATE TABLE IF NOT EXISTS hourly_rate (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    rate DECIMAL(10,2) NOT NULL,          
    effective_from DATE NOT NULL,        
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1; -- Turns safety constraint checking back on