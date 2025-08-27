import React, { useState } from 'react';
import { Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { CSVLink } from "react-csv";
import { NODE_TYPE, GENDER } from '../constants';

const TreeControls = ({
  selectedNode,
  familyTreeName,
  isEditingTreeName,
  setIsEditingTreeName,
  addNode,
  addNewFamilyHead,
  onLayout,
  getCSVData,
  importCSV,
  searchQuery,
  onSearchChange,
  setFamilyTreeName
}) => {
  const [isSpouseHovered, setIsSpouseHovered] = useState(false);
  const [isSonHovered, setIsSonHovered] = useState(false);
  const [isDaughterHovered, setIsDaughterHovered] = useState(false);
  return (
    <>
      {isEditingTreeName ? (
        <Form.Control
          type="text"
          style={{ marginBottom: '12px', fontSize: '1.5rem', fontWeight: 'bold' }}
          value={familyTreeName}
          onChange={(e) => setFamilyTreeName(e.target.value)}
          onBlur={() => setIsEditingTreeName(false)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              setIsEditingTreeName(false);
            }
          }}
          autoFocus
        />
      ) : (
        <h3 className="mb-4 text-primary" style={{ cursor: 'pointer', fontWeight: '600', fontSize: '1.8rem' }} onClick={() => setIsEditingTreeName(true)}>
          {familyTreeName}
        </h3>
      )}

      <div className="mb-3 pt-3">
        {/* Top text buttons */}
        <Row className="mb-1">
          <Col>
            <Button 
              variant="light" 
              onClick={onLayout} 
              className="w-100" 
              size="sm"
              style={{ boxShadow: 'none', border: '1px solid #dee2e6', fontWeight: 'normal' }}
            >
              Format Tree
            </Button>
          </Col>
          <Col>
            <Button 
              variant="light" 
              onClick={addNewFamilyHead} 
              className="w-100" 
              size="sm"
              style={{ boxShadow: 'none', border: '1px solid #dee2e6', fontWeight: 'normal' }}
            >
              Add New Family Head
            </Button>
          </Col>
        </Row>

        {/* Search Field */}
        <Row className="mb-2">
          <Col>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search by name"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                size="sm" // Make it smaller
              />
              <Button variant="outline-secondary" size="sm">🔍</Button> {/* Search Icon */}
            </InputGroup>
          </Col>
        </Row>

        {/* Icon-text buttons for adding nodes */}
        <Row className="mb-1 justify-content-center">
          <Col className="d-flex justify-content-center">
            <Button 
              size="sm" 
              variant="" 
              onClick={() => addNode(NODE_TYPE.SPOUSE, GENDER.FEMALE)} 
              className="d-inline-flex flex-row align-items-center py-2 px-2 me-1"
              disabled={!selectedNode || (selectedNode.data.nodeType !== NODE_TYPE.ROOT && selectedNode.data.nodeType !== NODE_TYPE.CHILD)}
              style={{
                backgroundColor: '#ffe0b2', // Light orange
                color: '#e65100', // Darker orange text
                border: '1px solid #ffcc80', // Subtle orange border
                boxShadow: (!selectedNode || (selectedNode.data.nodeType !== NODE_TYPE.ROOT && selectedNode.data.nodeType !== NODE_TYPE.CHILD)) ? 'none' : (isSpouseHovered ? '0 4px 8px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)'),
                transform: (!selectedNode || (selectedNode.data.nodeType !== NODE_TYPE.ROOT && selectedNode.data.nodeType !== NODE_TYPE.CHILD)) ? 'translateY(0)' : (isSpouseHovered ? 'translateY(-2px)' : 'translateY(0)'),
                transition: 'all 0.2s ease-in-out',
                opacity: (!selectedNode || (selectedNode.data.nodeType !== NODE_TYPE.ROOT && selectedNode.data.nodeType !== NODE_TYPE.CHILD)) ? 0.6 : 1,
              }}
              onMouseEnter={() => setIsSpouseHovered(true)}
              onMouseLeave={() => setIsSpouseHovered(false)}
            >
              <span style={{ fontSize: '1.2rem', marginRight: '5px' }}>♀</span> Add Spouse
            </Button>
            <Button 
              size="sm" 
              variant="" 
              onClick={() => addNode(NODE_TYPE.CHILD, GENDER.MALE)} 
              className="d-inline-flex flex-row align-items-center py-2 px-2 me-1"
              disabled={!selectedNode || selectedNode.data.nodeType !== NODE_TYPE.SPOUSE}
              style={{
                backgroundColor: '#bbdefb', // Light blue
                color: '#1976d2', // Darker blue text
                border: '1px solid #90caf9', // Subtle blue border
                boxShadow: (!selectedNode || selectedNode.data.nodeType !== NODE_TYPE.SPOUSE) ? 'none' : (isSonHovered ? '0 4px 8px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)'),
                transform: (!selectedNode || selectedNode.data.nodeType !== NODE_TYPE.SPOUSE) ? 'translateY(0)' : (isSonHovered ? 'translateY(-2px)' : 'translateY(0)'),
                transition: 'all 0.2s ease-in-out',
                opacity: (!selectedNode || selectedNode.data.nodeType !== NODE_TYPE.SPOUSE) ? 0.6 : 1,
              }}
              onMouseEnter={() => setIsSonHovered(true)}
              onMouseLeave={() => setIsSonHovered(false)}
            >
              <span style={{ fontSize: '1.2rem', marginRight: '5px' }}>♂</span> Add Son
            </Button>
            <Button 
              size="sm" 
              variant="" 
              onClick={() => addNode(NODE_TYPE.CHILD, GENDER.FEMALE)} 
              className="d-inline-flex flex-row align-items-center py-2 px-2"
              disabled={!selectedNode || selectedNode.data.nodeType !== NODE_TYPE.SPOUSE}
              style={{
                backgroundColor: '#c8e6c9', // Light green
                color: '#388e3c', // Darker green text
                border: '1px solid #a5d6a7', // Subtle green border
                boxShadow: (!selectedNode || selectedNode.data.nodeType !== NODE_TYPE.SPOUSE) ? 'none' : (isDaughterHovered ? '0 4px 8px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)'),
                transform: (!selectedNode || selectedNode.data.nodeType !== NODE_TYPE.SPOUSE) ? 'translateY(0)' : (isDaughterHovered ? 'translateY(-2px)' : 'translateY(0)'),
                transition: 'all 0.2s ease-in-out',
                opacity: (!selectedNode || selectedNode.data.nodeType !== NODE_TYPE.SPOUSE) ? 0.6 : 1,
              }}
              onMouseEnter={() => setIsDaughterHovered(true)}
              onMouseLeave={() => setIsDaughterHovered(false)}
            >
              <span style={{ fontSize: '1.2rem', marginRight: '5px' }}>♀</span> Add Daughter
            </Button>
          </Col>
        </Row>

        {/* CSV Import/Export */}
        <Row className="mb-2">
          <Col>
            <CSVLink data={getCSVData()} filename={`${familyTreeName}.csv`} className="btn btn-success w-100" style={{ border: '1px solid #28a745', opacity: !getCSVData().length ? 0.6 : 1 }}>
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
    </>
  );
};

export default TreeControls;