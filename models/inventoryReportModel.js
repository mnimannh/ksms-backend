// models/inventoryReportModel.js
import db from '../db/connection.js'

async function getInventoryReport({ year, month, categoryId = null }) {
  const queryParams = [year, month]

  let categoryClause = ''
  if (categoryId) {
    categoryClause = 'AND c.id = ?'
    queryParams.push(categoryId)
  }


  const sql = `
    SELECT
      i.id                          AS inventory_id,
      i.inventoryName               AS product_name,
      c.id                          AS category_id,
      c.name                        AS category_name,

      v.id                          AS variant_id,
      v.variant_name,
      v.quantity                    AS stock,
      v.cost_price,
      v.price,
      v.barcode,

      COALESCE(sales.units_sold, 0) AS sold,

      img.image_url                 AS image_url

    FROM inventory i
    INNER JOIN categories c  ON c.id = i.category_id
    INNER JOIN variants   v  ON v.inventory_id = i.id

    LEFT JOIN (
      SELECT
        oi.variant_id,
        SUM(oi.quantity) AS units_sold
      FROM order_items oi
      INNER JOIN orders o ON o.id = oi.order_id
      WHERE YEAR(o.created_at)  = ?
        AND MONTH(o.created_at) = ?
      GROUP BY oi.variant_id
    ) sales ON sales.variant_id = v.id

    LEFT JOIN product_images img
      ON img.variant_id = v.id
     AND img.is_main    = 1

    WHERE 1 = 1
      ${categoryClause}

    ORDER BY c.name, i.inventoryName, v.variant_name
  `

  const [rows] = await db.query(sql, queryParams)
  return rows
}

async function getAllCategories() {
  const [rows] = await db.query(
    'SELECT id, name FROM categories ORDER BY name'
  )
  return rows
}

export { getInventoryReport, getAllCategories }