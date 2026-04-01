const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/stats', authMiddleware, dashboardController.getStats);
router.get('/profit-report', authMiddleware, dashboardController.getProfitReport);
router.get('/profit-by-product', authMiddleware, dashboardController.getProfitByProduct);

module.exports = router;
