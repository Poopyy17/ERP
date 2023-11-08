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
  const [editingItemId, setEditingItemId] = useState(null); // Track the currently edited item's ID

  useEffect(() => {
    const fetchDeliveredProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/orders/delivered', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });

        const updatedInventory = {};

        data.forEach((product) => {
          product.orderItems.forEach((orderItem) => {
            const productId = orderItem.product._id;
            if (!updatedInventory[productId]) {
              updatedInventory[productId] = {
                _id: productId, // Add _id to uniquely identify items
                name: orderItem.name,
                category: orderItem.product.category,
                quantity: orderItem.quantity,
              };
            } else {
              updatedInventory[productId].quantity += orderItem.quantity;
            }
          });
        });

        setInventory(Object.values(updatedInventory)); // Convert to an array
        setLoading(false);
      } catch (err) {
        setError(getError(err));
        setLoading(false);
      }
    };

    fetchDeliveredProducts();
  }, [userInfo]);

  const openEditPage = (itemId) => {
    setEditingItemId(itemId); // Update the currently edited item's ID
  };

  const closeEditPage = () => {
    setEditingItemId(null); // Reset the currently edited item's ID
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
                <th>PRODUCT</th>
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
                      <Button variant="light" onClick={() => openEditPage(item._id)}>
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

      {inventory.map((item) => (
        editingItemId === item._id && (
          <EditInventoryItem
            key={item._id}
            itemId={item._id}
            currentQuantity={item.quantity}
            itemName={item.name}
            onUpdate={(itemId, newQuantity) => {
              // Update the quantity in the inventory array
              const updatedInventory = inventory.map((inventoryItem) =>
                inventoryItem._id === itemId
                  ? { ...inventoryItem, quantity: newQuantity }
                  : inventoryItem
              );
              setInventory(updatedInventory);
              closeEditPage(); // Close the modal after the update
            }}
            onClose={closeEditPage}
            userInfo={userInfo}
          />
        )
      ))}
    </div>
  );
}
