import express from 'express';
import { createOrder, getOrder, getOrdersByUserId } from '../Controller/orderController.js';
// import authenticate from '../../Middleware/auth.js';

const router = express.Router();

// Route to create an order, with userId as a URL parameter
router.post('/create/:userId', createOrder);

// Route to get all orders (if still needed)
router.get('/get', getOrder);

// Route to get orders by user ID
router.get('/:userId', getOrdersByUserId);

export default router;
