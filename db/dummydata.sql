USE ksms;

-- ========================================
-- 1. Users
-- ========================================
INSERT INTO user (email, fullName, password, role)
VALUES
('admin@ksms.com', 'Alice Admin', 'password123', 'admin'),
('staff1@ksms.com', 'Bob Staff', 'password123', 'staff'),
('staff2@ksms.com', 'Charlie Staff', 'password123', 'staff'),
('staff3@ksms.com', 'Diana Staff', 'password123', 'staff');

-- ========================================
-- 2. Categories
-- ========================================
INSERT INTO categories (name)
VALUES
('Electronics'),
('Office Supplies'),
('Furniture'),
('Stationery');

-- ========================================
-- 3. Inventory
-- ========================================
INSERT INTO inventory (inventoryName, category_id, description, default_threshold)
VALUES
('Laptop', 1, 'High performance laptop', 5),
('Office Chair', 3, 'Ergonomic chair for office', 10),
('Printer Paper', 2, 'A4 size printer paper', 50),
('Pen Pack', 4, 'Set of 10 ballpoint pens', 20);

-- ========================================
-- 4. Variants
-- ========================================
INSERT INTO variants (inventory_id, variant_name, quantity, price, barcode)
VALUES
(1, 'Laptop i5 16GB', 10, 1200.00, 'LP-i5-001'),
(1, 'Laptop i7 32GB', 5, 1800.00, 'LP-i7-002'),
(2, 'Chair Black', 15, 150.00, 'CH-BLK-001'),
(2, 'Chair Grey', 10, 160.00, 'CH-GRY-002'),
(3, 'Paper 500pcs', 100, 25.00, 'PR-500-001'),
(4, 'Pen Blue', 200, 5.00, 'PN-BLU-001'),
(4, 'Pen Black', 150, 5.00, 'PN-BLK-002');

-- ========================================
-- 5. Product Images
-- ========================================
INSERT INTO product_images (variant_id, image_url)
VALUES
(1, 'https://dummyimage.com/300x300/000/fff&text=Laptop+i5'),
(2, 'https://dummyimage.com/300x300/000/fff&text=Laptop+i7'),
(3, 'https://dummyimage.com/300x300/000/fff&text=Chair+Black'),
(4, 'https://dummyimage.com/300x300/000/fff&text=Chair+Grey'),
(5, 'https://dummyimage.com/300x300/000/fff&text=Paper+500pcs'),
(6, 'https://dummyimage.com/300x300/000/fff&text=Pen+Blue'),
(7, 'https://dummyimage.com/300x300/000/fff&text=Pen+Black');

-- ========================================
-- 6. Low Stock Alerts
-- ========================================
INSERT INTO low_stock_alerts (variant_id, threshold, is_read)
VALUES
(2, 5, 0),
(4, 10, 0),
(7, 20, 0);

-- ========================================
-- 7. Shift Assignments
-- ========================================
INSERT INTO shift_assignment (userID, assignedBy, startTime, endTime, shiftType, notes)
VALUES
(2, 1, '2026-01-25 08:00:00', '2026-01-25 16:00:00', 'Morning', 'Front desk'),
(3, 1, '2026-01-25 14:00:00', '2026-01-25 22:00:00', 'Evening', 'Inventory check'),
(4, 1, '2026-01-25 08:00:00', '2026-01-25 16:00:00', 'Morning', 'Office support');

-- ========================================
-- 8. Shift Attendance Log
-- ========================================
INSERT INTO shift_attendance_log (shiftID, userID, checkIn, checkOut, status, notes)
VALUES
(1, 2, '2026-01-25 08:05:00', '2026-01-25 16:00:00', 'Completed', ''),
(2, 3, '2026-01-25 14:00:00', '2026-01-25 22:15:00', 'Late', 'Traffic delay'),
(3, 4, NULL, NULL, 'Missed', 'Sick leave');

-- ========================================
-- 9. Payroll
-- ========================================
INSERT INTO payroll (userID, month, hoursWorked, createdBy, isCreated, isReceived, notes)
VALUES
(2, '2026-01-01', 160.00, 1, TRUE, FALSE, 'January payroll'),
(3, '2026-01-01', 150.50, 1, TRUE, FALSE, 'January payroll'),
(4, '2026-01-01', 120.75, 1, TRUE, FALSE, 'January payroll');
