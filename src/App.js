import React, { useState, useCallback, useEffect } from 'react';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges
} from 'reactflow';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'reactflow/dist/style.css';
import { Container, Row, Col } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import Papa from 'papaparse';
import TreeView from './components/TreeView';
import DetailsPanel from './components/DetailsPanel';
import TreeControls from './components/TreeControls';
import { NODE_TYPE, GENDER } from './constants';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getLayoutedElements } from './utils/layout';
import {
  handleSpouseToChildConnection,
  handleChildToSpouseConnection,
  createSpouseNode,
  createChildNode,
} from './utils/treeUtils';

const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [nodes, setNodes] = useState([
    { id: uuidv4(), type: 'custom', data: { name: 'Family Head', imageUrl: '', gender: GENDER.MALE, nodeType: NODE_TYPE.ROOT, childIds: [] }, position: { x: 250, y: 5 } }
  ]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [familyTreeName, setFamilyTreeName] = useState('My Family Tree');
  const [isEditingTreeName, setIsEditingTreeName] = useState(false);

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

      // Prevent duplicate edges
      const edgeExists = edges.some(e =>
        (e.source === connection.source && e.target === connection.target) ||
        (e.source === connection.target && e.target === connection.source)
      );
      if (edgeExists) {
        alert("A connection already exists between these two nodes.");
        return;
      }

      let result;
      if (sourceNode.data.nodeType === NODE_TYPE.SPOUSE && targetNode.data.nodeType === NODE_TYPE.CHILD) {
        result = handleSpouseToChildConnection(nodes, edges, connection);
      } else if (sourceNode.data.nodeType === NODE_TYPE.CHILD && targetNode.data.nodeType === NODE_TYPE.SPOUSE) {
        result = handleChildToSpouseConnection(nodes, edges, connection);
      } else {
        alert("Invalid connection: Only Spouse to Child or Child to Spouse connections are allowed.");
        return;
      }

      if (result.error) {
        toast.error(result.error);
        return;
      }

      const { updatedNodes, updatedEdges } = result;

      // Add the new edge
      const newEdge = { ...connection, type: 'straight' };
      const finalEdges = addEdge(newEdge, updatedEdges);

      setNodes(updatedNodes);
      setEdges(finalEdges);
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

    let newNode;
    if (type === NODE_TYPE.SPOUSE) {
      newNode = createSpouseNode(parentNode, nodes);
    } else {
      newNode = createChildNode(parentNode, gender);
    }

    setNodes(nds => nds.concat(newNode));

    if (type === NODE_TYPE.CHILD) {
      setNodes(nds => nds.map(n => {
        if (n.id === parentNode.id) {
          return { ...n, data: { ...n.data, childIds: [...n.data.childIds, newNode.id] } };
        }
        return n;
      }));
    }

    const newEdge = {
      id: `${parentNode.id}-${newNode.id}`,
      source: parentNode.id,
      target: newNode.id,
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
      if (prev) {
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
      const edgeChanges = edges.filter(e => e.source === nodeId || e.target === nodeId).map(edge => ({ type: 'remove', id: edge.id }));
      onEdgesChange(edgeChanges);

      const nodeChange = { type: 'remove', id: nodeId };
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

  const onLayout = useCallback(() => {
    const layouted = getLayoutedElements(nodes, edges);
    setNodes([...layouted.nodes]);
    setEdges([...layouted.edges]);
  }, [nodes, edges]);

  const calculateChecksum = useCallback((data) => {
    const dataString = JSON.stringify(data.map(row => {
      const { _checksum, ...rest } = row; // Exclude checksum from calculation
      return rest;
    }));
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return hash.toString();
  }, []);

  const getCSVData = useCallback(async () => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

    const data = nodes.map(node => ({
      id: node.id,
      name: node.data.name,
      imageUrl: node.data.imageUrl,
      gender: node.data.gender,
      nodeType: node.data.nodeType,
      childOrder: node.data.childOrder,
      parentId: node.data.parentId,
      spouseOrder: node.data.spouseOrder,
      childIds: node.data.childIds ? node.data.childIds.join(';') : '',
      // Only export base64 image data if it's a data URL
      imageData: node.data.imageUrl && node.data.imageUrl.startsWith('data:image') ? node.data.imageUrl : ''
    }));

    const checksum = calculateChecksum(data);
    const dataWithChecksum = data.map(row => ({ ...row, _checksum: checksum }));

    setIsExporting(false);
    return dataWithChecksum;
  }, [nodes, calculateChecksum]);

  const importCSV = useCallback(async (event) => {
    setIsImporting(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

    const file = event.target.files[0];
    if (!file) {
      setIsImporting(false);
      return;
    }

    const fileName = file.name.replace(/\.csv$/, '');
    setFamilyTreeName(fileName);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      comments: '#',
      complete: async (results) => {
        const importedData = results.data.filter(row => row.id); // Filter out empty rows
        if (importedData.length === 0) {
          toast.error("CSV file is empty or invalid.");
          setIsImporting(false);
          return;
        }

        const importedChecksum = importedData.length > 0 ? importedData[0]._checksum : null;
        const dataWithoutChecksum = importedData.map(row => {
          const { _checksum, ...rest } = row;
          return rest;
        });
        const calculatedChecksum = calculateChecksum(dataWithoutChecksum);

        if (importedChecksum && importedChecksum !== calculatedChecksum) {
          toast.error("Import failed: CSV file has been tampered with or is corrupted.");
          setIsImporting(false);
          return;
        }

        const newNodes = [];
        const newEdges = [];

        // First, create all nodes
        importedData.forEach(nodeData => {
          const id = nodeData.id || uuidv4();
          const imageUrl = nodeData.imageData || nodeData.imageUrl;
          const childIds = nodeData.childIds ? nodeData.childIds.split(';').filter(Boolean) : [];

          newNodes.push({
            id: id,
            type: 'custom',
            data: {
              name: nodeData.name,
              imageUrl: imageUrl,
              gender: nodeData.gender,
              nodeType: nodeData.nodeType,
              childOrder: nodeData.childOrder ? parseInt(nodeData.childOrder) : null,
              parentId: nodeData.parentId || null,
              spouseOrder: nodeData.spouseOrder ? parseInt(nodeData.spouseOrder) : null,
              childIds: childIds,
            },
            position: { x: 0, y: 0 }, // Positions will be recalculated by layout
          });
        });

        // Then, reconstruct edges based on parentId from the fully populated newNodes
        newNodes.forEach(node => {
          if (node.data.parentId && node.data.parentId !== '') {
            const sourceNodeExists = newNodes.some(n => n.id === node.data.parentId);
            const targetNodeExists = newNodes.some(n => n.id === node.id);
            if (sourceNodeExists && targetNodeExists) {
              newEdges.push({
                id: `${node.data.parentId}-${node.id}`,
                source: node.data.parentId,
                target: node.id,
                type: 'straight',
              });
            }
          }
        });

        const layouted = getLayoutedElements(newNodes, newEdges);
        setNodes([...layouted.nodes]);
        setEdges([...layouted.edges]);
        setSelectedNode(null);
        setIsImporting(false);
        toast.success("Family tree imported successfully!");
      }
    });
  }, [onLayout, calculateChecksum, setFamilyTreeName]);

  const handleExport = useCallback(async () => {
    const data = await getCSVData();
    if (data.length === 0) {
      alert("There is no data to export.");
      return;
    }

    const csv = Papa.unparse(data);
    const csvWithWarning = `# WARNING: This file is for machine import only. Do NOT edit manually. Editing may corrupt the data.\n${csv}`;

    const blob = new Blob([csvWithWarning], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${familyTreeName}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [getCSVData, familyTreeName]);


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
            searchQuery={searchQuery}
          />
        </Col>
        <Col xs={4} className="p-4" style={{ backgroundColor: '#f8f9fa', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
          <TreeControls
            selectedNode={selectedNode}
            familyTreeName={familyTreeName}
            isEditingTreeName={isEditingTreeName}
            setIsEditingTreeName={setIsEditingTreeName}
            addNode={addNode}
            addNewFamilyHead={addNewFamilyHead}
            onLayout={onLayout}
            onExportClick={handleExport}
            importCSV={importCSV}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            setFamilyTreeName={setFamilyTreeName}
            isExporting={isExporting}
            isImporting={isImporting}
          />
          <DetailsPanel key={selectedNode ? selectedNode.id : 'no-node'} selectedNode={selectedNode} updateNodeData={updateNodeData} deleteNode={deleteNode} />
        </Col>
      </Row>
    </Container>
  );
};


export default App;
