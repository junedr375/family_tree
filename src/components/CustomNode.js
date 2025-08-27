
import { Handle, Position } from 'reactflow';
import { Card, Image, Badge } from 'react-bootstrap';
import { NODE_TYPE, GENDER } from '../constants';

const CrownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="gold" style={{ position: 'absolute', top: '5px', right: '5px' }}>
    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3v-2H5v2h14z" />
  </svg>
);

const CustomNode = ({ data, selected }) => {
  const isFamilyHead = data.nodeType === NODE_TYPE.ROOT;
  const isHighlighted = data.isHighlighted;

  let cardBgColor = '#f8f9fa'; // Light gray for default
  if (data.nodeType === NODE_TYPE.SPOUSE) {
    cardBgColor = '#fff3cd'; // Light yellow for spouse
  } else if (data.nodeType === NODE_TYPE.CHILD) {
    if (data.gender === GENDER.MALE) {
      cardBgColor = '#cfe2ff'; // Light blue for son
    } else if (data.gender === GENDER.FEMALE) {
      cardBgColor = '#d1e7dd'; // Light green for daughter
    } else if (data.nodeType === NODE_TYPE.ROOT) {
      cardBgColor = '#e2e3e5'; // Slightly darker gray for Family Head
    }
  }

  const cardStyle = {
    width: data.nodeType === NODE_TYPE.SPOUSE ? '200px' : '150px',
    height: data.nodeType === NODE_TYPE.SPOUSE ? '80px' : '180px', // Fixed height for non-spouse cards
    position: 'relative',
    backgroundColor: cardBgColor, // Apply background color
    display: 'flex',
    flexDirection: 'column',
    border: selected ? '3px solid #007bff' : (isHighlighted ? '2px solid #dc3545' : 'none'), // Highlight border (blue for selected, red for search)
    boxShadow: selected ? '0 6px 12px rgba(0,0,0,0.2)' : '0 4px 8px rgba(0,0,0,0.1)', // More pronounced shadow for selected
    borderRadius: '8px', // Slightly rounded corners
    zIndex: selected ? 1000 : 'auto', // Bring selected node to front
  };

  if (data.nodeType === NODE_TYPE.SPOUSE) {
    return (
      <Card style={cardStyle}>
        <Card.Body className="d-flex align-items-center p-2">
          {data.spouseOrder && <Badge pill bg="secondary" style={{ position: 'absolute', top: '5px', left: '5px' }}>{data.spouseOrder}</Badge>}
          <Image src={data.imageUrl || `https://avatar.iran.liara.run/public/${data.gender === GENDER.MALE ? 'boy' : 'girl'}`} roundedCircle style={{ width: '60px', height: '60px', marginRight: '10px' }} />
          <Card.Title style={{ fontSize: '1rem', marginBottom: '0' }}>{data.name}</Card.Title>
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
      <div style={{ height: '70%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Image src={data.imageUrl || `https://avatar.iran.liara.run/public/${data.gender === GENDER.MALE ? 'boy' : 'girl'}`}
          style={
            data.imageUrl ? { width: '100%', height: '100%', objectFit: 'fill', borderRadius: '0' }
              : { width: '60%', height: '70%', objectFit: 'cover', borderRadius: '50%' }} />
      </div>
      <Card.Body className="text-center" style={{ height: '30%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
        <Card.Title style={{ fontSize: '0.9rem', marginBottom: '0' }}>{data.name}</Card.Title>
      </Card.Body>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
};

export default CustomNode;
