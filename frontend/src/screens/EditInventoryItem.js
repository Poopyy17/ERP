import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';

const EditInventoryItem = ({ itemId, currentQuantity, onUpdate, onClose, userInfo, itemName }) => {
  const [newQuantity, setNewQuantity] = useState(currentQuantity);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if userInfo and token are defined
    const token = userInfo ? userInfo.token : null;
    if (!token) {
      // Handle the case when userInfo or token is not defined
      console.error('User is not authenticated or userInfo is undefined.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(`/api/items/${itemId}`, { quantity: newQuantity }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setSuccess('Item updated successfully');
        onUpdate(itemId, newQuantity);
      } else {
        setError(`Failed to update item. Server returned status ${response.status}`);
      }
    } catch (err) {
      console.error('Failed to update item:', err);
      setError('Failed to update item. Please try again later.');
    }
    setLoading(false);
  };

  return (
    <Modal show={true} onHide={onClose} backdropClassName="dimmed-backdrop">
      <Modal.Header closeButton>
        <Modal.Title>{itemName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Label>New Quantity</Form.Label>
            <Form.Control
              type="number"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              min="0"
            />
          </Form.Group>
          <div className="my-2">
            <Button type="submit" disabled={loading}>
              Update
            </Button>
          </div>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditInventoryItem;
