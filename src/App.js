import React, { useState, useCallback, useEffect } from 'react';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges
} from 'reactflow';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'reactflow/dist/style.css';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import TreeView from './components/TreeView';
import DetailsPanel from './components/DetailsPanel';
import { CSVLink } from "react-csv";

const App = () => {
  const [nodes, setNodes] = useState([
    { id: uuidv4(), type: 'custom', data: { name: 'Family Head', imageUrl: '', gender: 'male', nodeType: 'root' }, position: { x: 250, y: 5 } }
  ]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  const onNodeClick = (event, node) => {
    setSelectedNode(node);
  };

  const addNode = (type, gender) => {
    if (!selectedNode) {
      alert('Please select a node first to add a new member.');
      return;
    }

    const parentNode = nodes.find(n => n.id === selectedNode.id);
    if (!parentNode) return;

    const newNodeId = uuidv4();
    const genderName = type === 'spouse' ? 'Spouse' : (gender === 'male' ? 'Son' : 'Daughter');
    
    let newNode;
    if (type === 'spouse') {
        newNode = {
            id: newNodeId,
            type: 'custom',
            data: { 
                name: `New ${genderName}`,
                imageUrl: '',
                gender: gender,
                nodeType: 'spouse',
                childIds: []
            },
            position: {
                x: parentNode.position.x,
                y: parentNode.position.y + 150,
            },
        };
    } else { // child
        const childCount = parentNode.data.childIds.length;
        newNode = {
            id: newNodeId,
            type: 'custom',
            data: { 
                name: `New ${genderName}`,
                imageUrl: '',
                gender: gender,
                nodeType: 'child',
                childOrder: childCount + 1,
                parentId: parentNode.id
            },
            position: {
                x: parentNode.position.x + (childCount * 150),
                y: parentNode.position.y + 150,
            },
        };
    }

    setNodes(nds => nds.concat(newNode));

    if (type === 'child') {
        setNodes(nds => nds.map(n => {
            if (n.id === parentNode.id) {
                return { ...n, data: { ...n.data, childIds: [...n.data.childIds, newNodeId] } };
            }
            return n;
        }));
    }

    const newEdge = {
        id: `${parentNode.id}-${newNodeId}`,
        source: parentNode.id,
        target: newNodeId,
        type: 'smoothstep',
    };
    setEdges((eds) => eds.concat(newEdge));
  };

  const updateNodeData = (nodeId, data) => {
    setNodes(nds => nds.map(node => {
        if (node.id === nodeId) {
            return { ...node, data: { ...node.data, ...data } };
        }
        return node;
    }));
    setSelectedNode(prev => {
        if(prev) {
            return { ...prev, data: { ...prev.data, ...data } };
        }
        return null;
    });
  };

  const deleteNode = (nodeId) => {
    if (!nodeId) return;
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    if (!nodeToDelete) return;

    if (nodeToDelete.data.nodeType === 'root') {
        alert('The Family Head cannot be deleted.');
        return;
    }

    if (window.confirm('Are you sure you want to delete this node?')) {
        const edgeChanges = edges.filter(e => e.source === nodeId || e.target === nodeId).map(edge => ({type: 'remove', id: edge.id}));
        onEdgesChange(edgeChanges);

        const nodeChange = {type: 'remove', id: nodeId};
        onNodesChange([nodeChange]);

        setNodes(nds => nds.filter(n => n.id !== nodeId));

        setSelectedNode(null);
    }
  }

  const getCSVData = () => {
    return nodes.map(node => ({
        id: node.id,
        name: node.data.name,
        imageUrl: node.data.imageUrl,
        gender: node.data.gender,
        nodeType: node.data.nodeType,
        childOrder: node.data.childOrder,
        parentId: node.data.parentId,
        childIds: node.data.childIds ? node.data.childIds.join(';') : ''
    }));
  }

  const importCSV = (e) => {
    // ... (to be implemented later)
  }


  return (
    <Container fluid>
      <Row>
        <Col xs={8} style={{ height: '100vh' }}>
          <TreeView
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
          />
        </Col>
        <Col xs={4} className="bg-light p-4">
            <h3 className="mb-4">Family Tree</h3>
            <div className="mb-3">
                <Button variant="info" onClick={() => addNode('spouse', 'female')} className="me-2" 
                    disabled={!selectedNode || (selectedNode.data.nodeType !== 'root' && selectedNode.data.nodeType !== 'child')}>
                    Add Spouse
                </Button>
                <Button variant="primary" onClick={() => addNode('child', 'male')} className="me-2" 
                    disabled={!selectedNode || selectedNode.data.nodeType !== 'spouse'}>
                    Add Son
                </Button>
                <Button variant="primary" onClick={() => addNode('child', 'female')} className="me-2" 
                    disabled={!selectedNode || selectedNode.data.nodeType !== 'spouse'}>
                    Add Daughter
                </Button>
                <CSVLink data={getCSVData()} filename={"family-tree.csv"} className="btn btn-success me-2">
                    Export CSV
                </CSVLink>
                <Form.Group controlId="formFile" className="d-inline-block">
                    <Form.Control type="file" onChange={importCSV} accept=".csv" />
                </Form.Group>
            </div>
          <DetailsPanel selectedNode={selectedNode} updateNodeData={updateNodeData} deleteNode={deleteNode} />
        </Col>
      </Row>
    </Container>
  );
};

export default App;