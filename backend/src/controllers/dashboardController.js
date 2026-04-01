const { sequelize, Invoice, InvoiceItem, Product, User } = require('../models');
const { Op } = require('sequelize');

exports.getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);
    const last7DaysStr = last7Days.toISOString();

    let todaySales = 0;
    let todayProfit = 0;
    let totalInvoices = 0;
    let totalProducts = 0;
    let lowStockCount = 0;
    let topProducts = [];
    let salesLast7Days = [];
    let recentInvoices = [];

    try {
      // Today's sales using raw query
      const rawTodaySales = await sequelize.query(`
        SELECT COALESCE(SUM(total), 0) as total
        FROM invoices
        WHERE created_at >= :today
      `, {
        replacements: { today: todayStr },
        type: sequelize.QueryTypes.SELECT
      });
      todaySales = parseFloat(rawTodaySales[0]?.total || 0);

      // Today's profit using raw query
      const rawTodayProfit = await sequelize.query(`
        SELECT COALESCE(SUM(profit), 0) as profit
        FROM invoices
        WHERE created_at >= :today
      `, {
        replacements: { today: todayStr },
        type: sequelize.QueryTypes.SELECT
      });
      todayProfit = parseFloat(rawTodayProfit[0]?.profit || 0);

      // Today's invoice count using raw query
      const rawTodayCount = await sequelize.query(`
        SELECT COUNT(*) as count
        FROM invoices
        WHERE created_at >= :today
      `, {
        replacements: { today: todayStr },
        type: sequelize.QueryTypes.SELECT
      });
      totalInvoices = parseInt(rawTodayCount[0]?.count || 0);

      totalProducts = await Product.count();

      lowStockCount = await Product.count({
        where: {
          stock: {
            [Op.lte]: 10
          }
        }
      });

      const rawTopProducts = await sequelize.query(`
        SELECT p.id, p.name, SUM(ii.quantity) as total
        FROM invoice_items ii
        JOIN products p ON ii.product_id = p.id
        JOIN invoices i ON ii.invoice_id = i.id
        WHERE i.created_at >= :today
        GROUP BY p.id, p.name
        ORDER BY total DESC
        LIMIT 5
      `, {
        replacements: { today: todayStr },
        type: sequelize.QueryTypes.SELECT
      });

      topProducts = rawTopProducts.map(item => ({
        id: item.id,
        name: item.name,
        total: parseInt(item.total)
      }));

      const rawSalesLast7Days = await sequelize.query(`
        SELECT DATE(i.created_at) as date, SUM(i.total) as total
        FROM invoices i
        WHERE i.created_at >= :last7Days
        GROUP BY DATE(i.created_at)
        ORDER BY date ASC
      `, {
        replacements: { last7Days: last7DaysStr },
        type: sequelize.QueryTypes.SELECT
      });

      salesLast7Days = rawSalesLast7Days.map(item => ({
        date: item.date,
        total: parseFloat(item.total)
      }));
      
      // Get recent invoices using raw query
      const rawRecentInvoices = await sequelize.query(`
        SELECT id, total, created_at
        FROM invoices
        WHERE created_at >= :last7Days
        ORDER BY created_at DESC
        LIMIT 10
      `, {
        replacements: { last7Days: last7DaysStr },
        type: sequelize.QueryTypes.SELECT
      });
      
      recentInvoices = rawRecentInvoices;
      
    } catch (dbError) {
      console.error('DB query error:', dbError.message);
    }

    res.json({
      total: todaySales,
      profit: todayProfit,
      totalInvoices,
      totalProducts,
      lowStockCount,
      topProducts,
      salesLast7Days,
      recentInvoices: recentInvoices.map(inv => ({
        id: inv.id,
        invoice_number: `INV-${inv.id.toString().padStart(4, '0')}`,
        total: parseFloat(inv.total),
        profit: parseFloat(inv.profit || 0),
        created_at: inv.created_at
      }))
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getProfitReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate + 'T00:00:00.000').toISOString() : new Date(new Date().setDate(new Date().getDate() - 30)).toISOString();
    const end = endDate ? new Date(endDate + 'T23:59:59.999').toISOString() : new Date().toISOString();

    const totalRevenueResult = await sequelize.query(`
      SELECT COALESCE(SUM(total), 0) as total
      FROM invoices
      WHERE created_at >= :start AND created_at <= :end
    `, {
      replacements: { start, end },
      type: sequelize.QueryTypes.SELECT
    });

    const totalCostResult = await sequelize.query(`
      SELECT COALESCE(SUM(ii.cost * ii.quantity), 0) as cost
      FROM invoice_items ii
      JOIN invoices i ON ii.invoice_id = i.id
      WHERE i.created_at >= :start AND i.created_at <= :end
    `, {
      replacements: { start, end },
      type: sequelize.QueryTypes.SELECT
    });

    const totalProfitResult = await sequelize.query(`
      SELECT COALESCE(SUM(profit), 0) as profit
      FROM invoices
      WHERE created_at >= :start AND created_at <= :end
    `, {
      replacements: { start, end },
      type: sequelize.QueryTypes.SELECT
    });

    const salesByDayResult = await sequelize.query(`
      SELECT DATE(i.created_at) as date, 
             SUM(i.profit) as profit, 
             SUM(i.total) as revenue
      FROM invoices i
      WHERE i.created_at >= :start AND i.created_at <= :end
      GROUP BY DATE(i.created_at)
      ORDER BY date ASC
    `, {
      replacements: { start, end },
      type: sequelize.QueryTypes.SELECT
    });

    const topProductsResult = await sequelize.query(`
      SELECT p.id, p.name, p.price, p.cost_price,
             SUM(ii.profit) as profit,
             SUM(ii.quantity) as sold
      FROM invoice_items ii
      JOIN products p ON ii.product_id = p.id
      JOIN invoices i ON ii.invoice_id = i.id
      WHERE i.created_at >= :start AND i.created_at <= :end
      GROUP BY p.id, p.name, p.price, p.cost_price
      ORDER BY profit DESC
      LIMIT 5
    `, {
      replacements: { start, end },
      type: sequelize.QueryTypes.SELECT
    });

    const lowMarginProductsResult = await sequelize.query(`
      SELECT p.id, p.name, p.price, p.cost_price,
             SUM(ii.profit) as total_profit,
             SUM(ii.quantity) as sold,
             CASE WHEN SUM(ii.quantity * p.price) > 0 
                  THEN (SUM(ii.profit) / SUM(ii.quantity * p.price) * 100)
                  ELSE 0 END as margin
      FROM invoice_items ii
      JOIN products p ON ii.product_id = p.id
      JOIN invoices i ON ii.invoice_id = i.id
      WHERE i.created_at >= :start AND i.created_at <= :end
      GROUP BY p.id, p.name, p.price, p.cost_price
      HAVING (SUM(ii.profit) / NULLIF(SUM(ii.quantity * p.price), 0) * 100) < 10
      ORDER BY margin ASC
    `, {
      replacements: { start, end },
      type: sequelize.QueryTypes.SELECT
    });

    const totalRevenue = parseFloat(totalRevenueResult[0]?.total || 0);
    const totalCost = parseFloat(totalCostResult[0]?.cost || 0);
    const totalProfit = parseFloat(totalProfitResult[0]?.profit || 0);
    const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0;

    res.json({
      totalRevenue,
      totalCost,
      totalProfit,
      averageMargin,
      salesByDay: salesByDayResult.map(item => ({
        date: item.date,
        profit: parseFloat(item.profit || 0),
        revenue: parseFloat(item.revenue || 0)
      })),
      topProducts: topProductsResult.map(item => ({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        costPrice: parseFloat(item.cost_price || 0),
        profit: parseFloat(item.profit || 0),
        sold: parseInt(item.sold || 0)
      })),
      lowMarginProducts: lowMarginProductsResult.map(item => ({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        costPrice: parseFloat(item.cost_price || 0),
        totalProfit: parseFloat(item.total_profit || 0),
        margin: parseFloat(item.margin || 0)
      }))
    });
  } catch (error) {
    console.error('Profit report error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getProfitByProduct = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate + 'T00:00:00.000').toISOString() : new Date(new Date().setDate(new Date().getDate() - 30)).toISOString();
    const end = endDate ? new Date(endDate + 'T23:59:59.999').toISOString() : new Date().toISOString();

    const result = await sequelize.query(`
      SELECT p.id, p.name, p.price, p.cost_price, p.stock,
             SUM(ii.quantity) as total_sold,
             SUM(ii.quantity * p.price) as total_revenue,
             SUM(ii.quantity * p.cost_price) as total_cost,
             SUM(ii.profit) as total_profit,
             CASE WHEN SUM(ii.quantity * p.price) > 0 
                  THEN (SUM(ii.profit) / SUM(ii.quantity * p.price) * 100)
                  ELSE 0 END as margin_percentage
      FROM invoice_items ii
      JOIN products p ON ii.product_id = p.id
      JOIN invoices i ON ii.invoice_id = i.id
      WHERE i.created_at >= :start AND i.created_at <= :end
      GROUP BY p.id, p.name, p.price, p.cost_price, p.stock
      ORDER BY total_profit DESC
    `, {
      replacements: { start, end },
      type: sequelize.QueryTypes.SELECT
    });

    res.json(result.map(item => ({
      id: item.id,
      name: item.name,
      price: parseFloat(item.price),
      costPrice: parseFloat(item.cost_price || 0),
      stock: parseInt(item.stock || 0),
      totalSold: parseInt(item.total_sold || 0),
      totalRevenue: parseFloat(item.total_revenue || 0),
      totalCost: parseFloat(item.total_cost || 0),
      totalProfit: parseFloat(item.total_profit || 0),
      marginPercentage: parseFloat(item.margin_percentage || 0)
    })));
  } catch (error) {
    console.error('Profit by product error:', error);
    res.status(500).json({ error: error.message });
  }
};
