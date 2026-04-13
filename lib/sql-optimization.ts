import pool from './db';

/**
 * 1. Inventory Replenishment Optimization
 * Identifies products that are below their reorder levels at specific entities.
 */
export async function getReplenishmentAnalysis() {
  const sql = `
    SELECT 
      p.name AS product_name,
      p.sku,
      e.name AS entity_name,
      e.entity_type,
      i.quantity_on_hand,
      i.reorder_level,
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
 * 2. Minimize Stock Outs (Demand Velocity)
 * Calculates the average daily demand over the last 30 days to predict potential stock outs.
 */
export async function getDemandVelocityAnalysis() {
  const sql = `
    SELECT 
      p.name AS product_name,
      p.sku,
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
 * 3. Logistics Optimization (Route Consolidation)
 * Identifies opportunities to consolidate shipments by grouping pending orders by destination.
 */
export async function getLogisticsConsolidation() {
  const sql = `
    SELECT 
      e.location AS destination,
      COUNT(o.order_id) AS pending_orders_count,
      SUM(oi.quantity) AS total_items,
      GROUP_CONCAT(o.order_id) AS order_ids
    FROM orders o
    JOIN entities e ON o.to_entity_id = e.entity_id
    JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.status = 'pending'
    GROUP BY e.location
    HAVING pending_orders_count > 1
    ORDER BY pending_orders_count DESC;
  `;
  const [rows] = await pool.execute(sql);
  return rows;
}

/**
 * 4. Streamline Order Fulfillment (Transaction)
 * Custom multi-step fulfillment that updates inventory and sets order to shipped within a transaction.
 */
export async function fulfillOrder(orderId: number) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Check if order exists and is pending
    const [orders]: any = await connection.execute(
      'SELECT from_entity_id FROM orders WHERE order_id = ? AND status = "pending" FOR UPDATE',
      [orderId]
    );

    if (orders.length === 0) throw new Error('Order not found or already processed');
    const fromEntityId = orders[0].from_entity_id;

    // 2. Reduce inventory for each item in the order
    const [items]: any = await connection.execute(
      'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
      [orderId]
    );

    for (const item of items) {
      const [result]: any = await connection.execute(
        'UPDATE inventory SET quantity_on_hand = quantity_on_hand - ? WHERE product_id = ? AND entity_id = ? AND quantity_on_hand >= ?',
        [item.quantity, item.product_id, fromEntityId, item.quantity]
      );

      if (result.affectedRows === 0) {
        throw new Error(`Insufficient stock for product ID ${item.product_id}`);
      }
    }

    // 3. Update order status
    await connection.execute(
      'UPDATE orders SET status = "shipped" WHERE order_id = ?',
      [orderId]
    );

    // 4. Create logistics entry
    await connection.execute(
      'INSERT INTO logistics (order_id, carrier, tracking_number, shipping_status) VALUES (?, "Default Carrier", ?, "In Transit")',
      [orderId, `TRK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`]
    );

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
