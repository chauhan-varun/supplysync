import pool from './db';

/**
 * 1. Inventory Replenishment Optimization
 */
export async function getReplenishmentAnalysis() {
  const sql = `
    SELECT 
      p.name AS product_name, p.sku, e.name AS entity_name, e.entity_type,
      i.quantity_on_hand, i.reorder_level,
      (i.reorder_level * 2 - i.quantity_on_hand) AS recommended_order_qty
    FROM inventory i
    JOIN products p ON i.product_id = p.product_id
    JOIN entities e ON i.entity_id = e.entity_id
    WHERE i.quantity_on_hand <= i.reorder_level
    ORDER BY (i.reorder_level - i.quantity_on_hand) DESC;
  `;
  const [rows] = await pool.execute(sql);
  return rows;
}

/**
 * 2. Demand Velocity & Stock-out Prediction
 */
export async function getDemandVelocityAnalysis() {
  const sql = `
    SELECT 
      p.name AS product_name, p.sku,
      COALESCE(SUM(oi.quantity), 0) AS total_sold_30d,
      COALESCE(SUM(oi.quantity) / 30, 0) AS daily_velocity,
      i.quantity_on_hand,
      CASE 
        WHEN (SUM(oi.quantity) / 30) > 0 THEN i.quantity_on_hand / (SUM(oi.quantity) / 30)
        ELSE 999 
      END AS days_until_stockout
    FROM products p
    LEFT JOIN order_items oi ON p.product_id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.order_id AND o.order_date > DATE_SUB(NOW(), INTERVAL 30 DAY)
    JOIN inventory i ON p.product_id = i.product_id
    GROUP BY p.product_id, i.inventory_id
    HAVING daily_velocity > 0
    ORDER BY days_until_stockout ASC;
  `;
  const [rows] = await pool.execute(sql);
  return rows;
}

/**
 * 3. Advanced Orders Management
 */
export async function getOrdersDetailed(search?: string, status?: string) {
  let sql = `
    SELECT 
      o.order_id, p.name AS product_name, p.sku, oi.quantity, o.status, o.order_date,
      e_from.name AS from_entity, e_to.name AS to_entity
    FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
    JOIN products p ON oi.product_id = p.product_id
    JOIN entities e_from ON o.from_entity_id = e_from.entity_id
    JOIN entities e_to ON o.to_entity_id = e_to.entity_id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (search) {
    sql += ` AND (p.name LIKE ? OR p.sku LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }
  if (status && status !== 'all') {
    sql += ` AND o.status = ?`;
    params.push(status);
  }

  sql += ` ORDER BY o.order_date DESC`;
  const [rows] = await pool.execute(sql, params);
  return rows;
}

/**
 * 4. Supplier/Manufacturer Performance View
 */
export async function getEntityPerformance() {
  const sql = `
    SELECT 
      e.name, e.entity_type, e.rating, e.avg_lead_time,
      COUNT(o.order_id) AS total_orders,
      AVG(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) * 100 AS fulfillment_rate
    FROM entities e
    LEFT JOIN orders o ON e.entity_id = o.from_entity_id
    GROUP BY e.entity_id
    ORDER BY e.rating DESC;
  `;
  const [rows] = await pool.execute(sql);
  return rows;
}

/**
 * 5. Advanced Logistics Tracking
 */
export async function getLogisticsAdvanced() {
  const sql = `
    SELECT 
      l.tracking_number, l.shipping_status, l.carrier, l.estimated_delivery,
      l.shipping_cost, l.origin_location, l.destination_location,
      o.order_id, p.name AS product_name
    FROM logistics l
    JOIN orders o ON l.order_id = o.order_id
    JOIN order_items oi ON o.order_id = oi.order_id
    JOIN products p ON oi.product_id = p.product_id
    ORDER BY l.estimated_delivery ASC;
  `;
  const [rows] = await pool.execute(sql);
  return rows;
}
