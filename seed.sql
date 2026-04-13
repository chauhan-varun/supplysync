-- Mock Entities
INSERT INTO entities (name, entity_type, contact_info, location) VALUES
('Global Logistics Co', 'supplier', 'contact@globallog.com', 'New York, US'),
('Tech Manufacturing Ltd', 'manufacturer', 'info@techmfr.com', 'Shenzhen, CN'),
('Prime Distribution', 'distributor', 'support@primedist.com', 'London, UK');

-- Mock Products
INSERT INTO products (sku, name, description, base_price) VALUES
('CPU-X1', 'Core Processor X1', 'High-performance processor', 299.99),
('GPU-Z9', 'Graphics Unit Z9', 'Next-gen gaming GPU', 599.49),
('RAM-16G', 'DDR5 RAM 16GB', 'Ultra-fast memory module', 89.99);

-- Mock Inventory
-- Supplier has lots of CPUs
INSERT INTO inventory (product_id, entity_id, quantity_on_hand, reorder_level) VALUES
(1, 1, 500, 50),
-- Manufacturer is low on GPUs (Trigger Replenishment)
(2, 2, 5, 20),
-- Distributor is low on RAM (Trigger Replenishment)
(3, 3, 2, 10);

-- Mock Orders (Pending)
INSERT INTO orders (from_entity_id, to_entity_id, status) VALUES
(1, 2, 'pending'),
(3, 1, 'pending'),
(3, 2, 'pending');

-- Mock Order Items
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(1, 1, 10, 250.00),
(2, 3, 5, 80.00),
(3, 3, 2, 80.00);
-- Notice: Order 2 and 3 both go TO New York/Shenzhen from the Distributor.
-- Wait, let's look at locations: 
-- Entity 1: New York
-- Entity 2: Shenzhen
-- Entity 3: London
-- To trigger consolidation, let's make two orders go to the same location.
-- Update Order 3 to go to Entity 1 (New York) too.
UPDATE orders SET to_entity_id = 1 WHERE order_id = 3;
