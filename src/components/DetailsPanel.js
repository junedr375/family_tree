import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Form, Button, Card, Image, Modal } from 'react-bootstrap';
import { NODE_TYPE, GENDER } from '../constants';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Helper function to get a cropped image from a canvas
const getCroppedImg = (image, crop) => {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return canvas.toDataURL('image/jpeg');
};

const DetailsPanel = ({ selectedNode, updateNodeData, deleteNode }) => {
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [childOrder, setChildOrder] = useState('');
  const [spouseOrder, setSpouseOrder] = useState('');

  const [upImg, setUpImg] = useState();
  const imgRef = useRef(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  useEffect(() => {
    if (selectedNode) {
      setName(selectedNode.data.name);
      setImageUrl(selectedNode.data.imageUrl);
      setChildOrder(selectedNode.data.childOrder || '');
      setSpouseOrder(selectedNode.data.spouseOrder || '');
    } else {
      setName('');
      setImageUrl('');
      setChildOrder('');
    }
  }, [selectedNode]);

  const handleUpdate = () => {
    if (selectedNode) {
      updateNodeData(selectedNode.id, { 
        name, 
        imageUrl, 
        childOrder: childOrder ? parseInt(childOrder) : null,
        spouseOrder: spouseOrder ? parseInt(spouseOrder) : null
      });
    }
  };

  const handleDelete = () => {
    if (selectedNode) {
      deleteNode(selectedNode.id);
    }
  }

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setUpImg(reader.result));
      reader.readAsDataURL(e.target.files[0]);
      setShowCropper(true);
    }
  };

  const onLoad = useCallback((img) => {
    imgRef.current = img;
  }, []);

  const makeClientCrop = useCallback(async () => {
    if (imgRef.current && completedCrop.width && completedCrop.height) {
      const croppedImageUrl = getCroppedImg(imgRef.current, completedCrop);
      setImageUrl(croppedImageUrl);
      setShowCropper(false);
      setUpImg(null);
    }
  }, [completedCrop]);

  return (
    <>
      {!selectedNode ? (
        <Card style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderRadius: '8px' }}><Card.Body>Select a node to see details.</Card.Body></Card>
      ) : (
        <Card style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
      <Card.Header>Edit Details</Card.Header>
      <Card.Body>
        <div className="text-center mb-3">
          <Image src={imageUrl || (selectedNode.data.gender === GENDER.MALE ? 'https://avatar.iran.liara.run/public/boy' : 'https://avatar.iran.liara.run/public/girl')} roundedCircle className='img-preview' style={{ width: '80px', height: '80px' }} />
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
            <Form.Label>Image Upload</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={onSelectFile}
            />
          </Form.Group>
          {selectedNode.data.nodeType === NODE_TYPE.CHILD && (
            <Form.Group className="mb-3">
              <Form.Label>Child Order</Form.Label>
              <Form.Control
                type="number"
                value={childOrder}
                onChange={(e) => setChildOrder(e.target.value)}
              />
            </Form.Group>
          )}
          {selectedNode.data.nodeType === NODE_TYPE.SPOUSE && (
            <Form.Group className="mb-3">
              <Form.Label>Spouse Order</Form.Label>
              <Form.Control
                type="number"
                value={spouseOrder}
                onChange={(e) => setSpouseOrder(e.target.value)}
              />
            </Form.Group>
          )}
          <Button variant="primary" onClick={handleUpdate} disabled={!selectedNode} className="me-2">
            Update
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={!selectedNode || selectedNode.data.nodeType === NODE_TYPE.ROOT}>
            Delete
          </Button>
        </Form>
      </Card.Body>

      <Modal show={showCropper} onHide={() => setShowCropper(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Crop Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {upImg && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1} // Square aspect ratio
            >
              <img ref={imgRef} alt="Crop me" src={upImg} onLoad={onLoad} />
            </ReactCrop>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCropper(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={makeClientCrop}>
            Crop & Save
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
      )}
    </>
  );
};

export default DetailsPanel;