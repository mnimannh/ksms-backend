// controllers/inventoryReportController.js
import { getInventoryReport, getAllCategories } from '../models/inventoryReportModel.js'

function fmt2(n) {
  return parseFloat(Number(n).toFixed(2))
}

function enrichRow(row) {
  const price = Number(row.price)
  const sold  = Number(row.sold)
  const stock = Number(row.stock)

  return {
    variant_id:       row.variant_id,
    inventory_id:     row.inventory_id,
    name:             row.variant_name
      ? `${row.product_name} – ${row.variant_name}`
      : row.product_name,
    product_name:     row.product_name,
    variant_name:     row.variant_name,
    category:         row.category_name,
    category_id:      row.category_id,
    barcode:          row.barcode,
    image_url:        row.image_url || null,
    price,
    stock,
    sold,
    remaining:        stock,
    revenue:          fmt2(price * sold),
    potentialRevenue: fmt2(price * stock),
  }
}

function buildCategoryBreakdown(enrichedRows) {
  const map = {}

  enrichedRows.forEach(r => {
    if (!map[r.category]) {
      map[r.category] = {
        category_id:      r.category_id,
        name:             r.category,
        items:            0,
        stock:            0,
        sold:             0,
        remaining:        0,
        revenue:          0,
        potentialRevenue: 0,
      }
    }
    const c = map[r.category]
    c.items            += 1
    c.stock            += r.stock
    c.sold             += r.sold
    c.remaining        += r.remaining
    c.revenue          += r.revenue
    c.potentialRevenue += r.potentialRevenue
  })

  return Object.values(map)
    .map(c => ({
      ...c,
      revenue:          fmt2(c.revenue),
      potentialRevenue: fmt2(c.potentialRevenue),
      soldPct: (c.stock + c.sold) > 0
        ? Math.round((c.sold / (c.stock + c.sold)) * 100)
        : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
}

function buildSummary(enrichedRows) {
  const totalStock  = enrichedRows.reduce((s, r) => s + r.stock, 0)
  const totalSold   = enrichedRows.reduce((s, r) => s + r.sold,  0)
  const outOfStock  = enrichedRows.filter(r => r.stock === 0).length
  const sellThrough = (totalStock + totalSold) > 0
    ? Math.round((totalSold / (totalStock + totalSold)) * 100)
    : 0

  const totalRevenue   = fmt2(enrichedRows.reduce((s, r) => s + r.revenue,          0))
  const totalPotential = fmt2(enrichedRows.reduce((s, r) => s + r.potentialRevenue, 0))
  const combined       = fmt2(totalRevenue + totalPotential)
  const realisedPct    = combined > 0 ? Math.round((totalRevenue / combined) * 100) : 0

  return {
    overview: {
      totalItems:     enrichedRows.length,
      totalStock,
      totalSold,
      outOfStock,
      sellThroughPct: sellThrough,
    },
    financials: {
      revenue:          totalRevenue,
      potentialRevenue: totalPotential,
      combined,
      realisedPct,
    },
  }
}

// ── Route handlers ────────────────────────────────────────────────────────────

async function listCategories(req, res) {
  try {
    const categories = await getAllCategories()
    res.json({ success: true, data: categories })
  } catch (err) {
    console.error('[InventoryReport] listCategories error:', err)
    res.status(500).json({ success: false, message: 'Failed to fetch categories.' })
  }
}

async function generateReport(req, res) {
  try {
    const year  = parseInt(req.query.year,  10)
    const month = parseInt(req.query.month, 10)
    const categoryId = req.query.categoryId
      ? parseInt(req.query.categoryId, 10)
      : null

    if (!year || year < 2000 || year > 2100) {
      return res.status(400).json({ success: false, message: 'Invalid year.' })
    }
    if (!month || month < 1 || month > 12) {
      return res.status(400).json({ success: false, message: 'Invalid month (1–12).' })
    }

    const rawRows      = await getInventoryReport({ year, month, categoryId })
    const enrichedRows = rawRows.map(enrichRow)

    res.json({
      success: true,
      meta: {
        year,
        month,
        categoryId,
        generatedAt: new Date().toISOString(),
      },
      data: {
        rows:              enrichedRows,
        summary:           buildSummary(enrichedRows),
        categoryBreakdown: buildCategoryBreakdown(enrichedRows),
      },
    })
  } catch (err) {
    console.error('[InventoryReport] generateReport error:', err)
    res.status(500).json({ success: false, message: 'Failed to generate report.' })
  }
}

export { generateReport, listCategories }