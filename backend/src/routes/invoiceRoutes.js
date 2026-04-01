const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, invoiceController.createInvoice);
router.get('/', authMiddleware, invoiceController.getInvoices);
router.get('/:id', authMiddleware, invoiceController.getInvoice);

module.exports = router;
