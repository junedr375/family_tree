import { v4 as uuidv4 } from 'uuid';
import { NODE_TYPE, GENDER } from '../constants';

export const handleSpouseToChildConnection = (nodes, edges, connection) => {
  const { source, target } = connection;
  const sourceNode = nodes.find(n => n.id === source);
  const targetNode = nodes.find(n => n.id === target);
  let updatedNodes = [...nodes];
  let updatedEdges = [...edges];

  // If the child already has a parent, remove the old connection
  if (targetNode.data.parentId) {
    const oldParent = nodes.find(n => n.id === targetNode.data.parentId);
    if (oldParent) {
      updatedNodes = updatedNodes.map(n => {
        if (n.id === oldParent.id) {
          return { ...n, data: { ...n.data, childIds: (n.data.childIds || []).filter(id => id !== targetNode.id) } };
        }
        return n;
      });
      updatedEdges = updatedEdges.filter(e => !(e.source === oldParent.id && e.target === targetNode.id));
    }
  }

  // Update data model for new parent
  updatedNodes = updatedNodes.map(n => {
    if (n.id === targetNode.id) {
      return { ...n, data: { ...n.data, parentId: sourceNode.id } };
    }
    if (n.id === sourceNode.id) {
      return { ...n, data: { ...n.data, childIds: [...(n.data.childIds || []), targetNode.id] } };
    }
    return n;
  });

  return { updatedNodes, updatedEdges, error: null };
};

export const handleChildToSpouseConnection = (nodes, edges, connection) => {
  const { source, target } = connection;
  const sourceNode = nodes.find(n => n.id === source);
  const targetNode = nodes.find(n => n.id === target);
  let updatedNodes = [...nodes];
  let updatedEdges = [...edges];

  // Gender validation
  if (sourceNode.data.gender === targetNode.data.gender) {
    return { 
      updatedNodes: nodes, 
      updatedEdges: edges, 
      error: `Invalid connection: A ${sourceNode.data.gender.toLowerCase()} child cannot be connected to a ${targetNode.data.gender.toLowerCase()} spouse.` 
    };
  }

  // If the spouse already has a parent (child), remove the old connection
  if (targetNode.data.parentId) {
    const oldParent = nodes.find(n => n.id === targetNode.data.parentId);
    if (oldParent) {
      updatedNodes = updatedNodes.map(n => {
        if (n.id === oldParent.id) {
          return { ...n, data: { ...n.data, childIds: (n.data.childIds || []).filter(id => id !== targetNode.id) } };
        }
        return n;
      });
      updatedEdges = updatedEdges.filter(e => !(e.source === oldParent.id && e.target === targetNode.id));
    }
  }

  // The child node becomes the parent of the spouse node's children
  updatedNodes = updatedNodes.map(n => {
    if (n.id === targetNode.id) {
      // Set the spouse's parentId to the child's ID
      return { ...n, data: { ...n.data, parentId: sourceNode.id } };
    }
    if (n.id === sourceNode.id) {
      const newChildIds = [...new Set([...(n.data.childIds || []), ...(targetNode.data.childIds || [])])];
      return { ...n, data: { ...n.data, childIds: newChildIds } };
    }
    return n;
  });

  // Assign spouseOrder to the targetNode (spouse)
  const spousesOfSource = updatedNodes.filter(n =>
    n.data.nodeType === NODE_TYPE.SPOUSE &&
    n.data.parentId === sourceNode.id
  );
  updatedNodes = updatedNodes.map(n => {
    if (n.id === targetNode.id) {
      return { ...n, data: { ...n.data, spouseOrder: spousesOfSource.length + 1 } };
    }
    return n;
  });

  return { updatedNodes, updatedEdges, error: null };
};

export const createSpouseNode = (parentNode, nodes) => {
  const newNodeId = uuidv4();
  let newSpouseGender;
  if (parentNode.data.gender === GENDER.MALE || parentNode.data.nodeType === NODE_TYPE.ROOT) {
    newSpouseGender = GENDER.FEMALE;
  } else {
    newSpouseGender = GENDER.MALE;
  }

  const spouseCount = nodes.filter(n =>
    n.data.nodeType === NODE_TYPE.SPOUSE &&
    n.data.parentId === parentNode.id
  ).length;

  const newNode = {
    id: newNodeId,
    type: 'custom',
    data: {
      name: 'New Spouse',
      imageUrl: '',
      gender: newSpouseGender,
      nodeType: NODE_TYPE.SPOUSE,
      childIds: [],
      parentId: parentNode.id,
      spouseOrder: spouseCount + 1
    },
    position: {
      x: parentNode.position.x,
      y: parentNode.position.y + 150,
    },
  };

  return newNode;
};

export const createChildNode = (parentNode, gender) => {
  const newNodeId = uuidv4();
  const newChildGenderName = gender === GENDER.MALE ? 'Son' : 'Daughter';
  const childCount = parentNode.data.childIds.length;

  const newNode = {
    id: newNodeId,
    type: 'custom',
    data: {
      name: `New ${newChildGenderName}`,
      imageUrl: '',
      gender: gender,
      nodeType: NODE_TYPE.CHILD,
      childOrder: childCount + 1,
      parentId: parentNode.id
    },
    position: {
      x: parentNode.position.x + (childCount * 150),
      y: parentNode.position.y + 150,
    },
  };

  return newNode;
};
