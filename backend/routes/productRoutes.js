import express from 'express';
import Product from '../models/productmodel.js';
import expressAsyncHandler from 'express-async-handler';
import { isAuth, isInspector, isSupplier } from '../utils.js'

const productRouter = express.Router();


productRouter.get('/', async (req, res) => {
    const products = await Product.find();
    res.send(products);
});

productRouter.post(
  '/', 
  isAuth, 
  isSupplier,
  expressAsyncHandler(async (req, res) => {
    const newProduct = new Product({
      name: 'product name' + Date.now(),
      slug: 'product-name-' + Date.now(),
      image: '/images/plywood.png',
      price: 0,
      category: 'product category',
      brand: 'product brand',
      countInStock: 0,
      description: 'product description',
    });
    const product = await newProduct.save();
    res.send({ message: 'Product Created', product });
  })
  );

  productRouter.put(
    '/:id',
    isAuth,
    isSupplier,
    expressAsyncHandler(async (req, res) => {
      const productId = req.params.id;
      const product = await Product.findById(productId);
      if (product) {
        product.name = req.body.name;
        product.slug = req.body.slug;
        product.price = req.body.price;
        product.image = req.body.image;
        product.images = req.body.images;
        product.category = req.body.category;
        product.brand = req.body.brand;
        product.countInStock = req.body.countInStock;
        product.description = req.body.description;
        await product.save();
        res.send({ message: 'Product Updated' });
      } else {
        res.status(404).send({ message: 'Product Not Found' });
      }
    })
  );

  productRouter.delete(
    '/:id',
    isAuth,
    isSupplier,
    expressAsyncHandler(async (req, res) => {
      const product = await Product.findById(req.params.id);
      if (product) {
        await product.deleteOne();
        res.send({ message: 'Product Deleted' });
      } else {
        res.status(404).send({ message: 'Product Not Found' });
      }
    })
  );

const PAGE_SIZE = 7;

productRouter.get(
  '/supplier',
  isAuth, 
  isSupplier,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;
    const products = await Product.find()
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    const countProducts = await Product.countDocuments();
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

productRouter.get(
    '/search',
    expressAsyncHandler(async (req, res) => {
      const { query } = req;
      const pageSize = query.pageSize || PAGE_SIZE;
      const page = query.page || 1;
      const category = query.category || '';
      const price = query.price || '';
      const order = query.order || '';
      const searchQuery = query.query || '';
  
      const queryFilter =
        searchQuery && searchQuery !== 'all'
          ? {
              name: {
                $regex: searchQuery,
                $options: 'i',
              },
            }
          : {};
      const categoryFilter = category && category !== 'all' ? { category } : {};
      const priceFilter =
        price && price !== 'all'
          ? {
              // 1-50
              price: {
                $gte: Number(price.split('-')[0]),
                $lte: Number(price.split('-')[1]),
              },
            }
          : {};
      const sortOrder =
        order === 'featured'
          ? { featured: -1 }
          : order === 'lowest'
          ? { price: 1 }
          : order === 'highest'
          ? { price: -1 }
          : order === 'toprated'
          ? { rating: -1 }
          : order === 'newest'
          ? { createdAt: -1 }
          : { _id: -1 };
  
      const products = await Product.find({
        ...queryFilter,
        ...categoryFilter,
        ...priceFilter,
      })
        .sort(sortOrder)
        .skip(pageSize * (page - 1))
        .limit(pageSize);
  
      const countProducts = await Product.countDocuments({
        ...queryFilter,
        ...categoryFilter,
        ...priceFilter,
      });
      res.send({
        products,
        countProducts,
        page,
        pages: Math.ceil(countProducts / pageSize),
      });
    })
  );

productRouter.get(
    '/categories',
    expressAsyncHandler(async (req, res) => {
      const categories = await Product.find().distinct('category');
      res.send(categories);
    })
  );
  
productRouter.get("/slug/:slug", async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug });
    if(product) {
        res.send(product);
    }else {
        res.status(404).send({message: "Product not found"});
    }
});

productRouter.get("/:id", async (req, res) => {
    const product = await Product.findById(req.params.id);
    if(product) {
        res.send(product);
    }else {
        res.status(404).send({message: "Product not found"});
    }
});

export default productRouter;