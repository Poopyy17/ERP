import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productmodel.js';
import { isAuth, isAdmin, isInspector, mailgun, payOrderEmailTemplate, payOrderEmailTemplate1, mailgun1, isSupplier } from '../utils.js';


const orderRouter = express.Router();

orderRouter.get(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find().populate('user', 'name');
    res.send(orders);
  })
);


orderRouter.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const newOrder = new Order({
      orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      itemsPrice: req.body.itemsPrice,
      shippingPrice: req.body.shippingPrice,
      taxPrice: req.body.taxPrice,
      totalPrice: req.body.totalPrice,
      user: req.user._id,
    });

    const order = await newOrder.save();
    res.status(201).send({ message: 'New Order Created', order });
  })
);

orderRouter.get( '/summary', isAuth, isAdmin, expressAsyncHandler(async (req, res) => {
    const orders = await Order.aggregate([
      {
        $group: {
          _id: null,
          numOrders: { $sum: 1 },
          totalSales: { $sum: '$totalPrice' },
        },
      },
    ]);
    const users = await User.aggregate([
      {
        $group: {
          _id: null,
          numUsers: { $sum: 1 },
        }
      }
    ]);
    const dailyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const productCategories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);
    res.send({ users, orders, dailyOrders, productCategories });
  })
);

orderRouter.get(
  '/mine',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.send(orders);
  })
);

orderRouter.get(
  '/delivered',
  isAuth,
  isInspector,
  expressAsyncHandler(async (req, res) => {
    // Fetch the products that are marked as delivered
    const deliveredProducts = await Order.find({ markDelivered: true })
      .populate('orderItems.product', 'name category countInStock'); // Pass fields as a space-separated string

    console.log('Delivered Products:', deliveredProducts); // Add this line for logging

    res.send(deliveredProducts);
  })
);

orderRouter.get(
    '/:id',
    isAuth,
    expressAsyncHandler(async (req, res) => {
      const order = await Order.findById(req.params.id)
      .populate(
        'user',
        'email name'
      );
      if (order) {
        mailgun1()
        .messages()
        .send(
          {
            from: 'CBC <cbc@company.capstone.com>',
            to: `${order.user.name} <${order.user.email}>`,
            subject: `New order ${order._id}`,
            html: payOrderEmailTemplate1(order),
          },
          (error, body) => {
            if (error) {
              console.log(error);
            } else {
              console.log(body);
            }
          }
        );
        res.send(order);
      } else {
        res.status(404).send({ message: 'Order Not Found' });
      }
    })
  );
  
  orderRouter.put(
    '/update/:id',
    isAuth,
    expressAsyncHandler(async (req, res) => {
      const orderId = req.params.id;
      const updatedOrder = req.body;
  
      const order = await Order.findById(orderId);
  
      if (order) {
        order.orderItems = updatedOrder.orderItems;
        order.totalPrice = updatedOrder.totalPrice;
  
        const updatedOrderInfo = await order.save();
  
        res.send(updatedOrderInfo);
      } else {
        res.status(404).send({ message: 'Order Not Found' });
      }
    })
  );

orderRouter.put(
    '/:id/deliver',
    isAuth,
    expressAsyncHandler(async (req, res) => {
      const order = await Order.findById(req.params.id);
      if (order) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        await order.save();
        res.send({ message: 'Order Delivered' });
      } else {
        res.status(404).send({ message: 'Order Not Found' });
      }
    })
);


orderRouter.put(
  '/:id/markdeliver',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.markDelivered = true;
      order.deliveredAt = Date.now();
      await order.save();
      res.send({ message: 'Order Marked as Delivered' });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);


orderRouter.put(
  '/:id/pay',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
    .populate(
      'user',
      'email name'
    );
    if(order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();
      mailgun()
        .messages()
        .send(
          {
            from: 'CBC <cbc@company.capstone.com>',
            to: `${order.user.name} <${order.user.email}>`,
            subject: `New order ${order._id}`,
            html: payOrderEmailTemplate(order),
          },
          (error, body) => {
            if (error) {
              console.log(error);
            } else {
              console.log(body);
            }
          }
        );

      res.send({ message: 'Order Paid', order: updatedOrder });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);


orderRouter.delete(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { orderIds } = req.body;

    try {
      // Use the `deleteMany` method to delete multiple orders
      const result = await Order.deleteMany({ _id: { $in: orderIds } });

      if (result.deletedCount > 0) {
        res.send({ message: 'Selected orders deleted successfully' });
      } else {
        res.status(404).send({ message: 'No orders were deleted' });
      }
    } catch (error) {
      res.status(500).send({ message: 'Internal Server Error' });
    }
  })
);


export default orderRouter;