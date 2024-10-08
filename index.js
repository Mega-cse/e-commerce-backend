import express from 'express';
import cors from 'cors'
import dotenv from "dotenv";
import connectDB from './Database/config.js';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import userRoutes from './src/Routes/authRouter.js';
import productRoutes from './src/Routes/productRouter.js';
import orderRoutes from './src/Routes/orderRouter.js'

dotenv.config()
const app = express();
connectDB()
const port=process.env.PORT
app.use(cors())
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/api/user',userRoutes)
app.use('/api/product',productRoutes)
app.use('/api/orders', orderRoutes);
app.get('/', (req, res) => {
  res.send(`<h1>Welcome to E-Commerce Backend</h1>`);
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})




