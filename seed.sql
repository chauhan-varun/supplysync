SET FOREIGN_KEY_CHECKS = 0;

-- Seed Entities
TRUNCATE TABLE entities;
INSERT INTO entities (entity_id, name, entity_type, contact_info, location, rating, avg_lead_time) VALUES
(1, 'Global Logistics Co', 'supplier', 'contact@globallog.com', 'New York, US', 4.8, 2),
(2, 'Tech Manufacturing Ltd', 'manufacturer', 'info@techmfr.com', 'Shenzhen, CN', 4.2, 5),
(3, 'Prime Distribution', 'distributor', 'support@primedist.com', 'London, UK', 4.5, 3);

-- Seed Products
TRUNCATE TABLE products;
INSERT INTO products (product_id, sku, name, description, base_price) VALUES
(1, 'CPU-X1', 'Core Processor X1', 'High-performance processor', 299.99),
(2, 'GPU-Z9', 'Graphics Unit Z9', 'Next-gen gaming GPU', 599.49),
(3, 'RAM-16G', 'DDR5 RAM 16GB', 'Ultra-fast memory module', 89.99);

-- Seed Inventory
TRUNCATE TABLE inventory;
INSERT INTO inventory (product_id, entity_id, quantity_on_hand, reorder_level) VALUES
(1, 1, 500, 50),
(2, 2, 5, 20),
(3, 3, 2, 10);

-- Seed Orders
TRUNCATE TABLE orders;
INSERT INTO orders (order_id, from_entity_id, to_entity_id, status, order_date) VALUES
(1, 1, 2, 'pending', NOW()),
(2, 3, 1, 'pending', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 3, 1, 'delivered', DATE_SUB(NOW(), INTERVAL 5 DAY));

-- Seed Order Items
TRUNCATE TABLE order_items;
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(1, 1, 10, 250.00),
(2, 3, 5, 80.00),
(3, 3, 12, 75.00);

-- Seed Logistics
TRUNCATE TABLE logistics;
INSERT INTO logistics (order_id, carrier, tracking_number, shipping_status, origin_location, destination_location, shipping_cost, estimated_delivery) VALUES
(1, 'FastShip', 'TRK-XP-9921', 'In Transit', 'London, UK', 'New York, US', 250.00, DATE_ADD(NOW(), INTERVAL 3 DAY)),
(3, 'Dhl Express', 'TRK-DL-4412', 'Delivered', 'London, UK', 'New York, US', 180.00, DATE_SUB(NOW(), INTERVAL 1 DAY));

SET FOREIGN_KEY_CHECKS = 1;
