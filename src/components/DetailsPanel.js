import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Image } from 'react-bootstrap';

const DetailsPanel = ({ selectedNode, updateNodeData, deleteNode }) => {
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [childOrder, setChildOrder] = useState('');

  useEffect(() => {
    if (selectedNode) {
      setName(selectedNode.data.name);
      setImageUrl(selectedNode.data.imageUrl);
      setChildOrder(selectedNode.data.childOrder || '');
    } else {
        setName('');
        setImageUrl('');
        setChildOrder('');
    }
  }, [selectedNode]);

  const handleUpdate = () => {
    if (selectedNode) {
      updateNodeData(selectedNode.id, { name, imageUrl, childOrder: childOrder ? parseInt(childOrder) : null });
    }
  };

  const handleDelete = () => {
      if(selectedNode) {
          deleteNode(selectedNode.id);
      }
  }

  if (!selectedNode) {
    return <Card><Card.Body>Select a node to see details.</Card.Body></Card>;
  }

  return (
    <Card>
        <Card.Header>Edit Details</Card.Header>
      <Card.Body>
        <div className="text-center mb-3">
            <Image src={imageUrl || (selectedNode.data.gender === 'male' ? 'https://avatar.iran.liara.run/public/boy' : 'https://avatar.iran.liara.run/public/girl')} roundedCircle fluid className='img-preview' />
        </div>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Image URL</Form.Label>
            <Form.Control
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </Form.Group>
          {selectedNode.data.parentId && (
            <Form.Group className="mb-3">
                <Form.Label>Child Order</Form.Label>
                <Form.Control
                    type="number"
                    value={childOrder}
                    onChange={(e) => setChildOrder(e.target.value)}
                />
            </Form.Group>
          )}
          <Button variant="primary" onClick={handleUpdate} disabled={!selectedNode} className="me-2">
            Update
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={!selectedNode || selectedNode.data.parentId === null}>
            Delete
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default DetailsPanel;