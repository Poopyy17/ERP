import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import seedRouter from './routes/seedRoutes.js';
import productRouter from './routes/productRoutes.js';
import userRouter from './routes/userRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import uploadRouter from './routes/UploadRoutes.js';
// import InventoryItem from './models/inventoryItemModel.js';

dotenv.config();

mongoose
.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('connected to db')
}).catch(err => {
    console.log(err.message);
});

// mongoose.connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });

//   const db = mongoose.connection;

//   db.on('error', (error) => console.error('MongoDB connection error:', error));
//   db.once('open', () => console.log('Connected to MongoDB'));

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// app.put('/api/items/:id', async (req, res) => {
//   try {
//     const itemId = req.params.id;
//     const { quantity } = req.body;

//     // Find the inventory item by its ID
//     const item = await InventoryItem.findById(itemId);

//     if (!item) {
//       // If the item doesn't exist, respond with an error message
//       return res.status(404).json({ message: 'Inventory item not found' });
//     }

//     // Update the quantity of the inventory item
//     item.quantity = quantity;

//     // Save the updated item back to the database
//     await item.save();

//     res.json({ message: 'Item updated successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// app.post('/api/inventory', async (req, res) => {
//   try {
//     const { name, category, quantity } = req.body;

//     let item = await InventoryItem.findOne({ name });

//     if (!item) {
//       item = new InventoryItem({ name, category, quantity });
//     } else {
//       item.quantity = quantity;
//     }

//     await item.save();

//     res.json({ message: 'Inventory item added/updated successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// app.get('/api/inventory', async (req, res) => {
//   try {
//     const items = await InventoryItem.find({});
//     res.json(items);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

app.get('/api/keys/paypal', (req, res) => {
    res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
});

app.use("/api/upload", uploadRouter);
app.use('/api/seed', seedRouter);
app.use('/api/products', productRouter);
app.use('/api/users', userRouter);
app.use('/api/orders', orderRouter);


app.use((err, req, res, next) => {
    res.status(500).send({ message: err.message });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`serve at http://localhost:${port}`);
});


