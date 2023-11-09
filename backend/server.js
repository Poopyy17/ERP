import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import seedRouter from './routes/seedRoutes.js';
import productRouter from './routes/productRoutes.js';
import userRouter from './routes/userRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import uploadRouter from './routes/UploadRoutes.js';

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

// Define a route for updating items by ID
app.put('/api/items/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const { name, category, quantity } = req.body;

    // Find the item by ID
    const item = await InventoryItem.findById(itemId);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Update the item properties
    if (name) {
      item.name = name;
    }
    if (category) {
      item.category = category;
    }
    if (quantity !== undefined) {
      item.quantity = quantity;
    }

    // Save the updated item
    const updatedItem = await item.save();

    res.json({ success: true, message: 'Item updated successfully', updatedItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


app.use((err, req, res, next) => {
    res.status(500).send({ message: err.message });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`serve at http://localhost:${port}`);
});


