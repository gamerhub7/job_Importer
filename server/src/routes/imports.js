const express = require('express');
const router = express.Router();
const controller = require('../controllers/importController');

router.get('/', controller.listImports);
router.post('/trigger', controller.triggerImport);

module.exports = router;
