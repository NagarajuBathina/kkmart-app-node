const express = require('express');
const router = express.Router();
const { addCombo } = require('../controllers/combo.controller');

router.post('/add_combo', addCombo);

module.exports = router;