import Order from "../Models/OrderSchema.js";
import User from "../Models/authSchema.js";
import nodemailer from "nodemailer";

// Create Order Function
export const createOrder = async (req, res) => {
  const { userId } = req.params;
  const { address, paymentMethod, details } = req.body;

  // Validate input
  if (!address || !paymentMethod || !details || !Array.isArray(details)) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  for (const item of details) {
    if (!item.name || !item.price || item.quantity == null) {
      return res.status(400).json({ message: 'Each item must have name, price, and quantity' });
    }
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newOrder = new Order({ userId, address, paymentMethod, details });
    await newOrder.save();

    // Log the order to check structure
    console.log('Order created:', JSON.stringify(newOrder, null, 2));

    // Send confirmation email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.MAIL,
        pass: process.env.SECRET_KEY,
      },
    });

    const productDetails = details.map(item => 
      `Product: ${item.name}, Price: $${item.price}, Quantity: ${item.quantity}`
    ).join('\n');

    const emailContent = `
      <h1>Dear ${user.username},</h1>
      <p>Your order has been successfully created!</p>
      <p>Order Details:</p>
      <pre>${productDetails}</pre>
      <p>Address: ${address}</p>
      <p>Payment Method: ${paymentMethod}</p>
      <p>Thank you for shopping with us!</p>
      <p>Your order will be delivered within a few days.</p>
    `;

    await transporter.sendMail({
      from: process.env.MAIL,
      to: user.email,
      subject: 'Order Confirmation',
      html: emailContent,
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ message: 'Error saving order', error });
  }
};

// Get Orders Function (all orders)
export const getOrder = async (req, res) => {
  try {
    const orders = await Order.find().populate('userId'); // Populating userId if necessary
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
};

export const getOrdersByUserId = async (req, res) => {
  const { userId } = req.params;
  console.log('Fetching orders for userId:', userId);

  try {
    const orders = await Order.find({ userId }).populate('userId'); // Assuming you're using Mongoose and your schema is set correctly
    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error });
  }
};

