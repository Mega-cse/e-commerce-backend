import mongoose from 'mongoose';const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  address: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  details: [orderItemSchema], // Array of order items
}, { timestamps: true });
const Order = mongoose.model('Order', orderSchema);

export default Order;
