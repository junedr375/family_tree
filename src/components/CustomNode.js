
import React from 'react';
import { Handle, Position } from 'reactflow';
import { Card, Image, Badge } from 'react-bootstrap';

const CrownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="gold" style={{ position: 'absolute', top: '5px', right: '5px' }}>
        <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3v-2H5v2h14z"/>
    </svg>
);

const CustomNode = ({ data, id }) => {
  const isFamilyHead = id === '1';

  return (
    <Card style={{ width: '150px', position: 'relative' }}>
        {isFamilyHead && <CrownIcon />}
        {data.childOrder && <Badge pill bg="info" style={{ position: 'absolute', top: '5px', left: '5px' }}>{data.childOrder}</Badge>}
        <Card.Body className="text-center">
            <Image src={data.imageUrl || (data.gender === 'male' ? 'https://avatar.iran.liara.run/public/boy' : 'https://avatar.iran.liara.run/public/girl')} roundedCircle style={{width: '50px', height: '50px'}} className="mb-2" />
            <Card.Title style={{fontSize: '1rem'}}>{data.name}</Card.Title>
        </Card.Body>
      <Handle type="target" position={Position.Top} id="top-target" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" />
      <Handle type="target" position={Position.Left} id="left-target" />
      <Handle type="source" position={Position.Right} id="right-source" />
    </Card>
  );
};

export default CustomNode;
