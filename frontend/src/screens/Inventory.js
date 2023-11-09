import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Store } from '../Store';
import { getError } from '../util';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../component/LoadingBox';
import MessageBox from '../component/MessageBox';
import EditInventoryItem from './EditInventoryItem';
import { Button } from 'react-bootstrap';

export default function Inventory() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inventory, setInventory] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItemDetails, setEditingItemDetails] = useState(null);

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

  const openEditPage = (item) => {
    setEditingItemDetails(item);
    setEditingItemId(item._id);
  };

  const closeEditPage = () => {
    setEditingItemId(null);
    setEditingItemDetails(null);
  };

  const handleUpdateItem = async (itemId, newQuantity) => {
    try {
      const response = await axios.put(
        `/api/orders/updateInventory/${itemId}`,
        {
          name: editingItemDetails.name,
          category: editingItemDetails.category,
          quantity: newQuantity,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      if (response.data) {
        // Update the local inventory state with the new data
        const updatedInventory = inventory.map((inventoryItem) =>
          inventoryItem._id === itemId
            ? { ...inventoryItem, quantity: newQuantity }
            : inventoryItem
        );
        setInventory(updatedInventory);
        closeEditPage();
      } else {
        setError('Failed to update item. Please try again later.');
      }
    } catch (error) {
      setError(getError(error));
    }
  };

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
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.quantity}</td>
                  <td>
                    {editingItemId === item._id ? (
                      <Button variant="light" onClick={closeEditPage}>
                        Close
                      </Button>
                    ) : (
                      <Button
                        variant="light"
                        onClick={() => openEditPage(item)}
                      >
                        Edit
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editingItemDetails && (
        <EditInventoryItem
          itemId={editingItemDetails._id}
          currentQuantity={editingItemDetails.quantity}
          onUpdate={handleUpdateItem}
          onClose={closeEditPage}
          userInfo={userInfo}
          itemName={editingItemDetails.name}
        />
      )}
    </div>
  );
}
