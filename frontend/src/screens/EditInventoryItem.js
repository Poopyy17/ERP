import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

const EditInventoryItem = ({ itemId, currentQuantity, onUpdate, onClose, itemName }) => {
  const [newQuantity, setNewQuantity] = useState(currentQuantity);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    setLoading(true);

    // Simulate a delay to mimic an asynchronous operation
    setTimeout(() => {
      setSuccess('Item updated successfully');
      onUpdate(itemId, newQuantity);
      setLoading(false);
    }, 1000); // You can adjust the delay as needed
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
