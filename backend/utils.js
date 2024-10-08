import jwt from 'jsonwebtoken';
import mg from 'mailgun-js';

export const baseUrl = () =>
process.env.BASE_URL
  ? process.env.BASE_URL
  : process.env.NODE_ENV !== 'production'
  ? 'http://localhost:3000'
  : 'http://cbc.com'

export const generateToken = (user) => {
    return jwt.sign(
        {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isSupplier: user.isSupplier,
        isInspector: user.isInspector,
        }, 
        process.env.JWT_SECRET, 
        {
        expiresIn: '30d',
        }
    );
};


export const isAuth = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (authorization) {
        const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
        jwt.verify(
            token,
            process.env.JWT_SECRET,
            (err, decode) => {
                if(err) {
                    res.status(401).send({ message: 'Invalid Token'});
                } else {
                    req.user = decode;
                    next();
                }
            }
        );
    } else {
        res.status(401).send({ message: 'No Token' })
    }
};

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401).send({ message: 'Invalid Admin Token' });
    }
}

export const isSupplier = (req, res, next) => {
    if (req.user && req.user.isSupplier) {
        next();
    } else {
        res.status(401).send({ message: 'Invalid Supplier Token' });
    }
}

export const isInspector = (req, res, next) => {
    if (req.user && req.user.isInspector) {
        next();
    } else {
        res.status(401).send({ message: 'Invalid Inspector Token' });
    }
}


const formatNumber = (number) => {
    return number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };


export const mailgun = () =>
  mg({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  });

  export const payOrderEmailTemplate = (order) => {
    return `<h1>Thanks for shopping with us</h1>
    <p>
    Hi Inspector!,</p>
    <p>We have finished processing your order.</p>
    <h2>[Order ${order._id}] (${order.createdAt.toString().substring(0, 10)})</h2>
    <table>
    <thead>
    <tr>
    <td><strong>Product</strong></td>
    <td><strong>Quantity</strong></td>
    <td><strong align="right">Price</strong></td>
    </thead>
    <tbody>
    ${order.orderItems
      .map(
        (item) => `
      <tr>
      <td>${item.name}</td>
      <td align="center">${item.quantity}</td>
      <td align="right"> ₱${formatNumber(item.price)}</td>
      </tr>
    `
      )
      .join('\n')}
    </tbody>
    <tfoot>
    <tr>
    <td colspan="2">Items Price:</td>
    <td align="right"> ₱${formatNumber(order.itemsPrice)}</td>
    </tr>
    <tr>
    <td colspan="2">Shipping Price:</td>
    <td align="right"> ₱${formatNumber(order.shippingPrice)}</td>
    </tr>
    <tr>
    <td colspan="2"><strong>Total Price:</strong></td>
    <td align="right"><strong> ₱${formatNumber(order.totalPrice)}</strong></td>
    </tr>
    <tr>
    <td colspan="2">Payment Method:</td>
    <td align="right">${order.paymentMethod}</td>
    </tr>
    </table>
  
    <h2>Shipping address</h2>
    <p>
    ${order.shippingAddress.fullName},<br/>
    ${order.shippingAddress.address},<br/>
    ${order.shippingAddress.city},<br/>
    ${order.shippingAddress.country},<br/>
    ${order.shippingAddress.postalCode}<br/>
    </p>
    <hr/>
    <p>
    Thanks for shopping with us.
    </p>
    `;
  };

  export const mailgun1 = () =>
  mg({
    apiKey: process.env.MAILGUN_API1_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  });

  export const payOrderEmailTemplate1 = (order) => {
    return `<h1>New order!</h1>
    <p>
    Hi Supplier!,</p>
    <p>Prepare the items to be ship as soon as possible.</p>
    <h2>[Order ${order._id}] (${order.createdAt.toString().substring(0, 10)})</h2>
    <table>
    <thead>
    <tr>
    <td><strong>Product</strong></td>
    <td><strong>Quantity</strong></td>
    <td><strong align="right">Price</strong></td>
    </thead>
    <tbody>
    ${order.orderItems
      .map(
        (item) => `
      <tr>
      <td>${item.name}</td>
      <td align="center">${item.quantity}</td>
      <td align="right"> ₱${formatNumber(item.price)}</td>
      </tr>
    `
      )
      .join('\n')}
    </tbody>
    <tfoot>
    <tr>
    <td colspan="2">Items Price:</td>
    <td align="right"> ₱${formatNumber(order.itemsPrice)}</td>
    </tr>
    <tr>
    <td colspan="2">Shipping Price:</td>
    <td align="right"> ₱${formatNumber(order.shippingPrice)}</td>
    </tr>
    <tr>
    <td colspan="2"><strong>Total Price:</strong></td>
    <td align="right"><strong> ₱${formatNumber(order.totalPrice)}</strong></td>
    </tr>
    <tr>
    <td colspan="2">Payment Method:</td>
    <td align="right">${order.paymentMethod}</td>
    </tr>
    </table>
  
    <h2>Shipping address</h2>
    <p>
    ${order.shippingAddress.fullName},<br/>
    ${order.shippingAddress.address},<br/>
    ${order.shippingAddress.city},<br/>
    ${order.shippingAddress.country},<br/>
    ${order.shippingAddress.postalCode}<br/>
    </p>
    <hr/>
    <p>
    Thanks for working for us.
    </p>
    `;
  };
