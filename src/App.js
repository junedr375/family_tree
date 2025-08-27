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
import { NODE_TYPE, GENDER } from './constants';
import { getLayoutedElements } from './utils/layout';

const App = () => {
  const [nodes, setNodes] = useState([
    { id: uuidv4(), type: 'custom', data: { name: 'Family Head', imageUrl: '', gender: GENDER.MALE, nodeType: NODE_TYPE.ROOT, childIds: [] }, position: { x: 250, y: 5 } }
  ]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    const parents = nodes.filter(n => n.data.childIds && n.data.childIds.length > 0);
    if (parents.length === 0) return;

    let changed = false;
    const newNodes = [...nodes];

    parents.forEach(parent => {
        const children = parent.data.childIds.map(id => newNodes.find(n => n.id === id)).filter(Boolean);
        
        const sortedChildren = [...children].sort((a, b) => (a.data.childOrder || 0) - (b.data.childOrder || 0));
        
        const sortedChildIds = sortedChildren.map(c => c.id);

        if (JSON.stringify(parent.data.childIds) !== JSON.stringify(sortedChildIds)) {
            const parentIndex = newNodes.findIndex(n => n.id === parent.id);
            newNodes[parentIndex] = {
                ...parent,
                data: {
                    ...parent.data,
                    childIds: sortedChildIds
                }
            };
            
            sortedChildren.forEach((child, index) => {
                const childIndex = newNodes.findIndex(n => n.id === child.id);
                if (newNodes[childIndex].data.childOrder !== index + 1) {
                    newNodes[childIndex] = {
                        ...newNodes[childIndex],
                        data: {
                            ...newNodes[childIndex].data,
                            childOrder: index + 1
                        }
                    };
                }
            });

            changed = true;
        }
    });

    if (changed) {
        setNodes(newNodes);
    }
}, [nodes, setNodes]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect = useCallback(
    (connection) => {
        const sourceNode = nodes.find(n => n.id === connection.source);
        const targetNode = nodes.find(n => n.id === connection.target);

        if (!sourceNode || !targetNode) {
            console.error("Source or target node not found.");
            return;
        }

        // Validation
        if (sourceNode.data.nodeType !== NODE_TYPE.SPOUSE) {
            alert("Only spouse nodes can be parents.");
            return;
        }
        if (targetNode.data.nodeType !== NODE_TYPE.CHILD) {
            alert("Only child nodes can be linked as children.");
            return;
        }

        // Handle existing parent
        let updatedNodes = nodes;
        let updatedEdges = edges;

        if (targetNode.data.parentId) {
            const oldParent = nodes.find(n => n.id === targetNode.data.parentId);
            if (oldParent) {
                // Remove child from old parent's childIds
                updatedNodes = updatedNodes.map(n => {
                    if (n.id === oldParent.id) {
                        return { ...n, data: { ...n.data, childIds: n.data.childIds.filter(id => id !== targetNode.id) } };
                    }
                    return n;
                });
                // Remove old edge
                updatedEdges = updatedEdges.filter(e => !(e.source === oldParent.id && e.target === targetNode.id));
            }
        }

        // Update data model for new parent
        updatedNodes = updatedNodes.map(n => {
            if (n.id === targetNode.id) {
                return { ...n, data: { ...n.data, parentId: sourceNode.id } };
            }
            if (n.id === sourceNode.id) {
                return { ...n, data: { ...n.data, childIds: [...n.data.childIds, targetNode.id] } };
            }
            return n;
        });

        // Add the new edge
        updatedEdges = addEdge({ ...connection, type: 'straight' }, updatedEdges);

        setNodes(updatedNodes);
        setEdges(updatedEdges);
    },
    [nodes, edges, setNodes, setEdges] 
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
    let newSpouseGender;
    let newChildGenderName;

    if (type === NODE_TYPE.SPOUSE) {
        if (parentNode.data.gender === GENDER.MALE || parentNode.data.nodeType === NODE_TYPE.ROOT) { 
            newSpouseGender = GENDER.FEMALE;
        } else if (parentNode.data.gender === GENDER.FEMALE) {
            newSpouseGender = GENDER.MALE;
        } else {
            newSpouseGender = GENDER.FEMALE; 
        }
        newChildGenderName = GENDER.SPOUSE; 
    } else { 
        newSpouseGender = gender; 
        newChildGenderName = gender === GENDER.MALE ? 'Son' : 'Daughter';
    }
    
    let newNode;
    if (type === NODE_TYPE.SPOUSE) {
        newNode = {
            id: newNodeId,
            type: 'custom',
            data: { 
                name: `New ${newChildGenderName}`,
                imageUrl: '',
                gender: newSpouseGender,
                nodeType: NODE_TYPE.SPOUSE,
                childIds: []
            },
            position: {
                x: parentNode.position.x,
                y: parentNode.position.y + 150,
            },
        };
    } else { 
        const childCount = parentNode.data.childIds.length;
        newNode = {
            id: newNodeId,
            type: 'custom',
            data: { 
                name: `New ${newChildGenderName}`,
                imageUrl: '',
                gender: newSpouseGender,
                nodeType: NODE_TYPE.CHILD,
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

    if (type === NODE_TYPE.CHILD) {
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
        type: 'straight',
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

    if (nodeToDelete.data.nodeType === NODE_TYPE.ROOT) {
        alert('The Family Head cannot be deleted.');
        return;
    }

    if (window.confirm('Are you sure you want to delete this node(? This will also delete its children and spouses)')) {
        const edgeChanges = edges.filter(e => e.source === nodeId || e.target === nodeId).map(edge => ({type: 'remove', id: edge.id}));
        onEdgesChange(edgeChanges);

        const nodeChange = {type: 'remove', id: nodeId};
        onNodesChange([nodeChange]);

        setNodes(nds => {
            let newNodes = nds.filter(n => n.id !== nodeId); 

            newNodes = newNodes.map(n => {
                if (n.data.parentId === nodeId) {
                    return { ...n, data: { ...n.data, parentId: null } };
                }
                return n;
            });

            newNodes = newNodes.map(n => {
                if (n.type === 'custom') { 
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            spouseIds: n.data.spouseIds ? n.data.spouseIds.filter(id => id !== nodeId) : [],
                            childIds: n.data.childIds ? n.data.childIds.filter(id => id !== nodeId) : [],
                        }
                    };
                }
                return n;
            });
            return newNodes;
        });

        setSelectedNode(null);
    }
  }

  const addNewFamilyHead = () => {
    const newRootId = uuidv4();
    const newRootSpouseId = uuidv4();

    const currentRoot = nodes.find(n => n.data.nodeType === NODE_TYPE.ROOT);

    const newRoot = {
        id: newRootId,
        type: 'custom',
        data: { name: 'New Family Head', imageUrl: '', gender: GENDER.MALE, nodeType: NODE_TYPE.ROOT, childIds: [] },
        position: { x: 250, y: 5 },
    };

    const newRootSpouse = {
        id: newRootSpouseId,
        type: 'custom',
        data: { name: 'New Spouse', imageUrl: '', gender: GENDER.FEMALE, nodeType: NODE_TYPE.SPOUSE, childIds: [] },
        position: { x: 250, y: 150 },
    };

    setNodes(nds => {
        const updatedNodes = nds.map(n => {
            if (n.id === currentRoot.id) {
                return { ...n, data: { ...n.data, nodeType: NODE_TYPE.CHILD, parentId: newRootSpouseId } };
            }
            return n;
        });
        return [...updatedNodes, newRoot, newRootSpouse];
    });

    setEdges(eds => {
        const newEdges = [...eds];
        newEdges.push({
            id: `${newRootId}-${newRootSpouseId}`,
            source: newRootId,
            target: newRootSpouseId,
            type: 'straight',
        });
        newEdges.push({
            id: `${newRootSpouseId}-${currentRoot.id}`,
            source: newRootSpouseId,
            target: currentRoot.id,
            type: 'straight',
        });
        return newEdges;
    });
  };

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

  const onLayout = useCallback(() => {
    const layouted = getLayoutedElements(nodes, edges);
    setNodes([...layouted.nodes]);
    setEdges([...layouted.edges]);
}, [nodes, edges]);


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
                <Row className="mb-2">
                    <Col>
                        <Button variant="info" onClick={() => addNode(NODE_TYPE.SPOUSE, GENDER.FEMALE)} className="w-100" 
                            disabled={!selectedNode || (selectedNode.data.nodeType !== NODE_TYPE.ROOT && selectedNode.data.nodeType !== NODE_TYPE.CHILD)}>
                            Add Spouse
                        </Button>
                    </Col>
                </Row>
                <Row className="mb-2">
                    <Col>
                        <Button variant="primary" onClick={() => addNode(NODE_TYPE.CHILD, GENDER.MALE)} className="w-100" 
                            disabled={!selectedNode || selectedNode.data.nodeType !== NODE_TYPE.SPOUSE}>
                            Add Son
                        </Button>
                    </Col>
                    <Col>
                        <Button variant="primary" onClick={() => addNode(NODE_TYPE.CHILD, GENDER.FEMALE)} className="w-100" 
                            disabled={!selectedNode || selectedNode.data.nodeType !== NODE_TYPE.SPOUSE}>
                            Add Daughter
                        </Button>
                    </Col>
                </Row>
                <Row className="mb-2">
                    <Col>
                        <Button variant="success" onClick={addNewFamilyHead} className="w-100">
                            Add New Family Head
                        </Button>
                    </Col>
                </Row>
                <Row className="mb-2">
                    <Col>
                        <Button variant="secondary" onClick={onLayout} className="w-100">
                            Format Tree
                        </Button>
                    </Col>
                </Row>
                <Row className="mb-2">
                    <Col>
                        <CSVLink data={getCSVData()} filename={"family-tree.csv"} className="btn btn-success w-100">
                            Export CSV
                        </CSVLink>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Group controlId="formFile">
                            <Form.Control type="file" onChange={importCSV} accept=".csv" />
                        </Form.Group>
                    </Col>
                </Row>
            </div>
          <DetailsPanel key={selectedNode ? selectedNode.id : 'no-node'} selectedNode={selectedNode} updateNodeData={updateNodeData} deleteNode={deleteNode} />
        </Col>
      </Row>
    </Container>
  );
};

export default App;