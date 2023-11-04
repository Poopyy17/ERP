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
  const [deliveredProducts, setDeliveredProducts] = useState([]);

  useEffect(() => {
    const fetchDeliveredProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/orders/delivered', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        setDeliveredProducts(data);
        setLoading(false);
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
                <th>PRODUCT</th>
                <th>CATEGORY</th>
                <th>STOCK</th>
              </tr>
            </thead>
            <tbody>
            {deliveredProducts.map((product) => (
              product.orderItems.map((orderItem) => (
                <tr key={orderItem._id}>
                  <td>{orderItem.name}</td>
                  <td>{orderItem.product.category}</td>
                  <td>{orderItem.quantity}</td>
                </tr>
              ))
            ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}