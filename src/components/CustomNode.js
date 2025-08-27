
import React from 'react';
import { Handle, Position } from 'reactflow';
import { Card, Image, Badge } from 'react-bootstrap';
import { NODE_TYPE, GENDER } from '../constants';

const CrownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="gold" style={{ position: 'absolute', top: '5px', right: '5px' }}>
        <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3v-2H5v2h14z"/>
    </svg>
);

const CustomNode = ({ data }) => {
  const isFamilyHead = data.nodeType === NODE_TYPE.ROOT;
  
  let cardBgColor = '#fff'; // Default white background
  if (data.nodeType === NODE_TYPE.SPOUSE) {
    cardBgColor = 'lightyellow'; // Yellowish background for spouse
  } else if (data.nodeType === NODE_TYPE.CHILD) {
    if (data.gender === GENDER.MALE) {
      cardBgColor = 'lightblue'; // Bluish background for son
    } else if (data.gender === GENDER.FEMALE) {
      cardBgColor = 'lightgreen'; // Greenish background for daughter
    } else if (data.nodeType === NODE_TYPE.ROOT) {
        cardBgColor = 'lightgray'; // Grayish background for Family Head
    }
  }

  const cardStyle = {
    width: data.nodeType === NODE_TYPE.SPOUSE ? '200px' : '150px',
    position: 'relative',
    backgroundColor: cardBgColor, // Apply background color
  };

  if (data.nodeType === NODE_TYPE.SPOUSE) {
    return (
      <Card style={cardStyle}>
        <Card.Body className="d-flex align-items-center p-2">
          <Image src={data.imageUrl || (data.gender === GENDER.MALE ? 'https://avatar.iran.liara.run/public/boy' : 'https://avatar.iran.liara.run/public/girl')} roundedCircle style={{width: '60px', height: '60px', marginRight: '10px'}} />
          <Card.Title style={{fontSize: '1rem', marginBottom: '0'}}>{data.name}</Card.Title>
        </Card.Body>
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />
      </Card>
    );
  }

  return (
    <Card style={cardStyle}>
        {isFamilyHead && <CrownIcon />}
        {data.childOrder && <Badge pill bg="info" style={{ position: 'absolute', top: '5px', left: '5px' }}>{data.childOrder}</Badge>}
        <Card.Body className="text-center">
            <Image src={data.imageUrl || (data.gender === GENDER.MALE ? 'https://avatar.iran.liara.run/public/boy' : 'https://avatar.iran.liara.run/public/girl')} roundedCircle style={{width: '70px', height: '70px'}} className="mb-2" />
            <Card.Title style={{fontSize: '1rem'}}>{data.name}</Card.Title>
        </Card.Body>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
};

export default CustomNode;
