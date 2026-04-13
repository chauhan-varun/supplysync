-- Update Entities with performance metrics
ALTER TABLE entities ADD COLUMN rating DECIMAL(3, 2) DEFAULT 4.50;
ALTER TABLE entities ADD COLUMN avg_lead_time INT DEFAULT 3; -- in days

-- Update Orders with completion timestamp
ALTER TABLE orders ADD COLUMN completed_at TIMESTAMP NULL;

-- Update Logistics with cost and locations
ALTER TABLE logistics ADD COLUMN shipping_cost DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE logistics ADD COLUMN origin_location VARCHAR(255);
ALTER TABLE logistics ADD COLUMN destination_location VARCHAR(255);

-- Apply some updates to existing data
UPDATE entities SET rating = 4.8, avg_lead_time = 2 WHERE entity_id = 1;
UPDATE entities SET rating = 4.2, avg_lead_time = 5 WHERE entity_id = 2;
UPDATE entities SET rating = 4.5, avg_lead_time = 3 WHERE entity_id = 3;

-- Mock costs for logistics
UPDATE logistics SET shipping_cost = 150.00, origin_location = 'London, UK', destination_location = 'New York, US' WHERE logistics_id > 0;
