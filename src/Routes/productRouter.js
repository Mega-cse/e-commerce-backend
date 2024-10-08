// routes/product.js
import express from 'express';
import { createproduct, deleteProduct, getbyId, getProduct, updateProduct } from '../Controller/productController.js';

const router = express.Router();

// CREATE a new product
router.post('/create', createproduct)

// READ all products
router.get('/get',getProduct)
// READ a single product
router.get('/:id',getbyId);

// UPDATE a product
router.put('/:id',updateProduct);

// DELETE a product
router.delete('/:id', deleteProduct);

export default router;
