import React from 'react';
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
            <Button variant="outline-primary" onClick={onLayout} className="w-100" size="sm">
              Format Tree
            </Button>
          </Col>
          <Col>
            <Button variant="outline-primary" onClick={addNewFamilyHead} className="w-100" size="sm">
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
        <Row className="mb-1">
          <Col>
            <Button size="sm" variant="outline-warning" onClick={() => addNode(NODE_TYPE.SPOUSE, GENDER.FEMALE)} className="d-flex flex-column align-items-center justify-content-center flex-grow-1 py-1"
              disabled={!selectedNode || (selectedNode.data.nodeType !== NODE_TYPE.ROOT && selectedNode.data.nodeType !== NODE_TYPE.CHILD)}>
              <span style={{ fontSize: '1.2rem' }}>♀</span> Add Spouse
            </Button>
          </Col>
          <Col>
            <Button size="sm" variant="outline-primary" onClick={() => addNode(NODE_TYPE.CHILD, GENDER.MALE)} className="d-flex flex-column align-items-center justify-content-center flex-grow-1 py-1"
              disabled={!selectedNode || selectedNode.data.nodeType !== NODE_TYPE.SPOUSE}>
              <span style={{ fontSize: '1.2rem' }}>♂</span> Add Son
            </Button>
          </Col>
          <Col>
            <Button size="sm" variant="outline-success" onClick={() => addNode(NODE_TYPE.CHILD, GENDER.FEMALE)} className="d-flex flex-column align-items-center justify-content-center flex-grow-1 py-1"
              disabled={!selectedNode || selectedNode.data.nodeType !== NODE_TYPE.SPOUSE}>
              <span style={{ fontSize: '1.2rem' }}>♀</span> Add Daughter
            </Button>
          </Col>
        </Row>

        {/* CSV Import/Export */}
        <Row className="mb-2">
          <Col>
            <CSVLink data={getCSVData()} filename={`${familyTreeName}.csv`} className="btn btn-success w-100">
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