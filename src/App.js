import React, { useState, useCallback } from 'react';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges
} from 'reactflow';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'reactflow/dist/style.css';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import TreeView from './components/TreeView';
import DetailsPanel from './components/DetailsPanel';
import { CSVLink } from "react-csv";

const generateUniqueRandomId = (existingIds) => {
    let newId;
    do {
        newId = Math.floor(Math.random() * 1000000);
    } while (existingIds.includes(newId));
    return newId;
}

const App = () => {
  const [nodes, setNodes] = useState([
    { id: generateUniqueRandomId([]), type: 'custom', data: { name: 'Family Head', imageUrl: '', spouseIds: [], childIds: [], gender: 'male', parentId: null, nodeType: 'child' }, position: { x: 250, y: 5 } }
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

    if (type === 'child' && parentNode.data.spouseIds.length === 0) {
        alert('Please add a spouse before adding children.');
        return;
    }

    const existingIds = nodes.map(n => n.id);
    const newNodeId = generateUniqueRandomId(existingIds);
    const genderName = gender === 'male' ? 'Son' : (gender === 'female' ? 'Daughter' : 'Spouse');
    const childCount = parentNode.data.childIds.length;
    const spouseCount = parentNode.data.spouseIds.length;

    const newNode = {
      id: newNodeId,
      type: 'custom',
      data: { 
          name: `New ${genderName}`, 
          imageUrl: '', 
          spouseIds: type === 'spouse' ? [parentNode.id] : [], 
          childIds: [], 
          gender: gender, 
          childOrder: type === 'child' ? childCount + 1 : null, 
          parentId: type === 'child' ? parentNode.id : null,
          nodeType: type
        },
      position: {
        x: parentNode.position.x + (type === 'spouse' ? 250 + (spouseCount * 150) : 0),
        y: parentNode.position.y + (type === 'spouse' ? 0 : 150),
      },
    };

    setNodes(nds => {
        const newNodes = nds.map(n => {
            if (n.id === parentNode.id) {
                if (type === 'child') {
                    return {...n, data: {...n.data, childIds: [...n.data.childIds, newNodeId]}};
                }
                if (type === 'spouse') {
                    return {...n, data: {...n.data, spouseIds: [...n.data.spouseIds, newNodeId]}};
                }
            }
            return n;
        });
        return [...newNodes, newNode];
    });

    let newEdge;
    if (type === 'spouse') {
      newEdge = {
        id: `${parentNode.id}-${newNodeId}`,
        source: parentNode.id,
        target: newNodeId,
        type: 'smoothstep',
        sourceHandle: 'right-source',
        targetHandle: 'left-target',
      };
    } else { // child
        newEdge = {
            id: `${parentNode.id}-${newNodeId}`,
            source: parentNode.id,
            target: newNodeId,
            type: 'smoothstep',
            sourceHandle: 'bottom-source',
            targetHandle: 'top-target',
          };
    }
    setEdges((eds) => [...eds, newEdge]);
  };

  const updateNodeData = (nodeId, data) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      })
    );
    setSelectedNode(prev => ({...prev, data: {...prev.data, ...data}}));
  };

  const deleteNode = (nodeId) => {
    if (!nodeId) return;
    const nodeToDelete = nodes.find(n => n.id === nodeId);
    if (!nodeToDelete) return;

    if (nodeToDelete.data.parentId === null) {
        alert('The Family Head cannot be deleted.');
        return;
    }

    if (window.confirm('Are you sure you want to delete this node?')) {
        const edgeChanges = edges.filter(e => e.source === nodeId || e.target === nodeId).map(edge => ({type: 'remove', id: edge.id}));
        onEdgesChange(edgeChanges);

        const nodeChange = {type: 'remove', id: nodeId};
        onNodesChange([nodeChange]);

        setNodes(nds => nds.map(n => ({
            ...n,
            data: {
                ...n.data,
                spouseIds: n.data.spouseIds.filter(id => id !== nodeId),
                childIds: n.data.childIds.filter(id => id !== nodeId),
            }
        })));

        setSelectedNode(null);
    }
  }

  const getCSVData = () => {
    return nodes.map(node => ({
        id: node.id,
        name: node.data.name,
        imageUrl: node.data.imageUrl,
        spouseIds: node.data.spouseIds.join(';'),
        childIds: node.data.childIds.join(';'),
        x: node.position.x,
        y: node.position.y,
        gender: node.data.gender,
        childOrder: node.data.childOrder,
        parentId: node.data.parentId,
        nodeType: node.data.nodeType
    }));
  }

  const importCSV = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
        const text = event.target.result;
        const lines = text.split('\n').filter(l => l.trim() !== '');
        const headers = lines[0].split(',');
        const newNodes = lines.slice(1).map(line => {
            const values = line.split(',');
            const node = {
                id: parseInt(values[0]),
                type: 'custom',
                position: {x: parseFloat(values[5]), y: parseFloat(values[6])},
                data: {
                    name: values[1],
                    imageUrl: values[2],
                    spouseIds: values[3] ? values[3].split(';').map(id => parseInt(id)) : [],
                    childIds: values[4] ? values[4].split(';').map(id => parseInt(id)) : [],
                    gender: values[7],
                    childOrder: values[8] ? parseInt(values[8]) : null,
                    parentId: values[9] ? parseInt(values[9]) : null,
                    nodeType: values[10]
                }
            };
            return node;
        });
        setNodes(newNodes);

        const newEdges = [];
        newNodes.forEach(node => {
            node.data.childIds.forEach((childId, index) => {
                newEdges.push({id: `${node.id}-${childId}`, source: node.id, target: childId, type: 'smoothstep', sourceHandle: 'bottom-source', targetHandle: 'top-target'});
            });
            node.data.spouseIds.forEach(spouseId => {
                // to avoid duplicate edges
                if (!newEdges.find(edge => (edge.source === spouseId && edge.target === node.id))) {
                    newEdges.push({id: `${node.id}-${spouseId}`, source: node.id, target: spouseId, type: 'smoothstep', sourceHandle: 'right-source', targetHandle: 'left-target'});
                }
            });
        });
        setEdges(newEdges);
    };
    reader.readAsText(file);
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
                <Button variant="primary" onClick={() => addNode('child', 'male')} className="me-2" disabled={!selectedNode || selectedNode.data.spouseIds.length === 0}>
                    Add Son
                </Button>
                <Button variant="primary" onClick={() => addNode('child', 'female')} className="me-2" disabled={!selectedNode || selectedNode.data.spouseIds.length === 0}>
                    Add Daughter
                </Button>
                <Button variant="info" onClick={() => addNode('spouse', 'spouse')} className="me-2">
                    Add Spouse
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