USE ksms;

-- ===============================
-- 1. Users
-- ===============================
INSERT INTO user (email, fullName, password, role) VALUES
('admin@example.com', 'Admin User', 'adminpass123', 'admin'),
('staff1@example.com', 'Staff One', 'staffpass123', 'staff'),
('staff2@example.com', 'Staff Two', 'staffpass123', 'staff');

-- ===============================
-- 2. Categories
-- ===============================
INSERT INTO categories (name) VALUES
('Beverages'),
('Snacks'),
('Stationery');

-- ===============================
-- 3. Inventory (Products)
-- ===============================
INSERT INTO inventory (inventoryName, category_id, description, default_threshold) VALUES
('Coca-Cola', 1, 'Refreshing soda drink', 10),
('Pepsi', 1, 'Popular cola beverage', 10),
('Potato Chips', 2, 'Crispy salted snack', 15),
('Notebook', 3, 'A4 size lined notebook', 20);

-- ===============================
-- 4. Variants
-- ===============================
INSERT INTO variants (inventory_id, variant_name, quantity, price, barcode) VALUES
-- Coca-Cola variants
(1, '500ml Can', 50, 1.50, 'COKE500ML001'),
(1, '330ml Bottle', 30, 1.20, 'COKE330ML002'),

-- Pepsi variants
(2, '500ml Can', 40, 1.40, 'PEPSI500ML001'),
(2, '330ml Bottle', 25, 1.10, 'PEPSI330ML002'),

-- Potato Chips variants
(3, 'Classic 50g', 100, 2.00, 'CHIPS50G001'),
(3, 'Barbecue 50g', 80, 2.20, 'CHIPS50G002'),

-- Notebook variants
(4, 'A4 Lined', 200, 3.50, 'NOTEBOOKA4L001'),
(4, 'A5 Lined', 150, 2.50, 'NOTEBOOKA5L002');

-- ===============================
-- 5. Product Images
-- ===============================
INSERT INTO product_images (variant_id, image_url) VALUES
(1, 'https://example.com/images/coke_500ml.jpg'),
(2, 'https://example.com/images/coke_330ml.jpg'),
(3, 'https://example.com/images/pepsi_500ml.jpg'),
(4, 'https://example.com/images/pepsi_330ml.jpg'),
(5, 'https://example.com/images/chips_classic.jpg'),
(6, 'https://example.com/images/chips_bbq.jpg'),
(7, 'https://example.com/images/notebook_a4.jpg'),
(8, 'https://example.com/images/notebook_a5.jpg');

-- ===============================
-- 6. Low Stock Alerts
-- ===============================
INSERT INTO low_stock_alerts (variant_id, threshold, is_read) VALUES
(2, 5, 0),  -- Coca-Cola 330ml low stock
(4, 5, 0),  -- Pepsi 330ml low stock
(6, 10, 0); -- Potato Chips Barbecue low stock
