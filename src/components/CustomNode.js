import React from 'react';
import { Handle, Position } from 'reactflow';
import { Card, Image, Badge } from 'react-bootstrap';

const CrownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="gold" style={{ position: 'absolute', top: '5px', right: '5px' }}>
        <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3v-2H5v2h14z"/>
    </svg>
);

const CustomNode = ({ data }) => {
  const isFamilyHead = data.nodeType === 'root';
  
  if (data.nodeType === 'spouse') {
    return (
      <Card style={{ width: '200px', position: 'relative' }}>
        <Card.Body className="d-flex align-items-center p-2">
          <Image src={data.imageUrl || 'https://avatar.iran.liara.run/public/girl'} roundedCircle style={{width: '40px', height: '40px', marginRight: '10px'}} />
          <Card.Title style={{fontSize: '1rem', marginBottom: '0'}}>{data.name}</Card.Title>
        </Card.Body>
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />
      </Card>
    );
  }

  return (
    <Card style={{ width: '150px', position: 'relative' }}>
        {isFamilyHead && <CrownIcon />}
        {data.childOrder && <Badge pill bg="info" style={{ position: 'absolute', top: '5px', left: '5px' }}>{data.childOrder}</Badge>}
        <Card.Body className="text-center">
            <Image src={data.imageUrl || (data.gender === 'male' ? 'https://avatar.iran.liara.run/public/boy' : 'https://avatar.iran.liara.run/public/girl')} roundedCircle style={{width: '50px', height: '50px'}} className="mb-2" />
            <Card.Title style={{fontSize: '1rem'}}>{data.name}</Card.Title>
        </Card.Body>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
};

export default CustomNode;