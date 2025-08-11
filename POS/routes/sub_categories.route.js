const express = require('express');
const router = express.Router();
const {
    createSubcategory,
    getAllSubcategories,
    getSubcategoryById,
    updateSubcategory,
    deleteSubcategory
} = require('../controllers/sub_categories.controller');

router.get('/get_all_sub_categories', getAllSubcategories);
router.post('/create_sub_category', createSubcategory);
router.get('/get_subcategory/:id', getSubcategoryById);
router.put('/update_sub_category/:id', updateSubcategory);
router.delete('/delete_sub_category/:id', deleteSubcategory);

module.exports = router;
