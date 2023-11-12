import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import seedRouter from './routes/seedRoutes.js';
import productRouter from './routes/productRoutes.js';
import userRouter from './routes/userRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import uploadRouter from './routes/UploadRoutes.js';
import InventoryItem from './models/inventoryItemModel.js';

dotenv.config();

mongoose
.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('connected to db')
}).catch(err => {
    console.log(err.message);
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to the database');
  })
  .catch((err) => {
    console.error(err.message);
  });


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/keys/paypal', (req, res) => {
    res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
});

app.use("/api/upload", uploadRouter);
app.use('/api/seed', seedRouter);
app.use('/api/products', productRouter);
app.use('/api/users', userRouter);
app.use('/api/orders', orderRouter);

app.put('/api/items/:name', async (req, res) => {
  try {
    const decodedName = decodeURIComponent(req.params.name);
    const { category, quantity } = req.body;

    // Find the item by name and category
    const existingItem = await InventoryItem.findOne({ name: decodedName, category });

    if (!existingItem) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Update the quantity
    existingItem.quantity += quantity;

    // Save the updated item
    const updatedItem = await existingItem.save();

    res.json({ success: true, message: 'Item updated successfully', updatedItem });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


app.use((err, req, res, next) => {
    res.status(500).send({ message: err.message });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`serve at http://localhost:${port}`);
});


