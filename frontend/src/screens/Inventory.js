import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Store } from '../Store';
import { getError } from '../util';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../component/LoadingBox';
import MessageBox from '../component/MessageBox';

export default function Inventory() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    const fetchDeliveredProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/orders/delivered', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        if (Array.isArray(response.data)) {
          const updatedInventory = {};

          response.data.forEach((product) => {
            product.orderItems.forEach((orderItem) => {
              if (orderItem && orderItem.product) {
                const productId = orderItem.product._id;
                if (!updatedInventory[productId]) {
                  updatedInventory[productId] = {
                    _id: productId,
                    name: orderItem.product.name,
                    category: orderItem.product.category,
                    quantity: orderItem.quantity,
                  };
                } else {
                  updatedInventory[productId].quantity += orderItem.quantity;
                }
              }
            });
          });

          setInventory(Object.values(updatedInventory));
          setLoading(false);
        } else {
          setError('Invalid data structure in the API response');
          setLoading(false);
        }
      } catch (err) {
        setError(getError(err));
        setLoading(false);
      }
    };

    fetchDeliveredProducts();
  }, [userInfo]);

  return (
    <div>
      <Helmet>
        <title>Inventory</title>
      </Helmet>
      <h1>Inventory</h1>
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <div>
          <table className="table">
            <thead>
              <tr>
                <th>MATERIAL</th>
                <th>CATEGORY</th>
                <th>STOCK</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
