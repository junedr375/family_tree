import React, { useState } from 'react';
import { Button, Form, Row, Col, InputGroup, ProgressBar, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { NODE_TYPE, GENDER } from '../constants';

const TreeControls = ({
  selectedNode,
  familyTreeName,
  isEditingTreeName,
  setIsEditingTreeName,
  addNode,
  addNewFamilyHead,
  onLayout,
  onExportClick,
  importCSV,
  searchQuery,
  onSearchChange,
  setFamilyTreeName,
  isExporting,
  isImporting
}) => {
  const [isSpouseHovered, setIsSpouseHovered] = useState(false);
  const [isSonHovered, setIsSonHovered] = useState(false);
  const [isDaughterHovered, setIsDaughterHovered] = useState(false);

  const renderAddSpouseButton = () => {
    const isDisabled = !selectedNode || (selectedNode.data.nodeType !== NODE_TYPE.ROOT && selectedNode.data.nodeType !== NODE_TYPE.CHILD);
    const tooltipText = !selectedNode ? 'Select a node to add a spouse' : 'You can only add a spouse to the Family Head or a child';

    return (
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id="tooltip-add-spouse">{isDisabled ? tooltipText : 'Add a spouse to the selected person'}</Tooltip>}
      >
        <span className="d-inline-block">
          <Button 
            size="sm" 
            variant="" 
            onClick={() => addNode(NODE_TYPE.SPOUSE, GENDER.FEMALE)} 
            className="d-inline-flex flex-row align-items-center py-2 px-2 me-1"
            disabled={isDisabled}
            style={{
              pointerEvents: isDisabled ? 'none' : 'auto',
              backgroundColor: '#ffe0b2',
              color: '#e65100',
              border: '1px solid #ffcc80',
              boxShadow: isDisabled ? 'none' : (isSpouseHovered ? '0 4px 8px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)'),
              transform: isDisabled ? 'translateY(0)' : (isSpouseHovered ? 'translateY(-2px)' : 'translateY(0)'),
              transition: 'all 0.2s ease-in-out',
              opacity: isDisabled ? 0.6 : 1,
            }}
            onMouseEnter={() => setIsSpouseHovered(true)}
            onMouseLeave={() => setIsSpouseHovered(false)}
          >
            <span style={{ fontSize: '1.2rem', marginRight: '5px' }}>♀</span> Add Spouse
          </Button>
        </span>
      </OverlayTrigger>
    );
  };

  const renderAddSonButton = () => {
    const isDisabled = !selectedNode || selectedNode.data.nodeType !== NODE_TYPE.SPOUSE;
    const tooltipText = !selectedNode ? 'Select a spouse to add a son' : 'You can only add a son to a spouse';

    return (
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id="tooltip-add-son">{isDisabled ? tooltipText : 'Add a son to the selected spouse'}</Tooltip>}
      >
        <span className="d-inline-block">
          <Button 
            size="sm" 
            variant="" 
            onClick={() => addNode(NODE_TYPE.CHILD, GENDER.MALE)} 
            className="d-inline-flex flex-row align-items-center py-2 px-2 me-1"
            disabled={isDisabled}
            style={{
              pointerEvents: isDisabled ? 'none' : 'auto',
              backgroundColor: '#bbdefb',
              color: '#1976d2',
              border: '1px solid #90caf9',
              boxShadow: isDisabled ? 'none' : (isSonHovered ? '0 4px 8px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)'),
              transform: isDisabled ? 'translateY(0)' : (isSonHovered ? 'translateY(-2px)' : 'translateY(0)'),
              transition: 'all 0.2s ease-in-out',
              opacity: isDisabled ? 0.6 : 1,
            }}
            onMouseEnter={() => setIsSonHovered(true)}
            onMouseLeave={() => setIsSonHovered(false)}
          >
            <span style={{ fontSize: '1.2rem', marginRight: '5px' }}>♂</span> Add Son
          </Button>
        </span>
      </OverlayTrigger>
    );
  };

  const renderAddDaughterButton = () => {
    const isDisabled = !selectedNode || selectedNode.data.nodeType !== NODE_TYPE.SPOUSE;
    const tooltipText = !selectedNode ? 'Select a spouse to add a daughter' : 'You can only add a daughter to a spouse';

    return (
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id="tooltip-add-daughter">{isDisabled ? tooltipText : 'Add a daughter to the selected spouse'}</Tooltip>}
      >
        <span className="d-inline-block">
          <Button 
            size="sm" 
            variant="" 
            onClick={() => addNode(NODE_TYPE.CHILD, GENDER.FEMALE)} 
            className="d-inline-flex flex-row align-items-center py-2 px-2"
            disabled={isDisabled}
            style={{
              pointerEvents: isDisabled ? 'none' : 'auto',
              backgroundColor: '#c8e6c9',
              color: '#388e3c',
              border: '1px solid #a5d6a7',
              boxShadow: isDisabled ? 'none' : (isDaughterHovered ? '0 4px 8px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)'),
              transform: isDisabled ? 'translateY(0)' : (isDaughterHovered ? 'translateY(-2px)' : 'translateY(0)'),
              transition: 'all 0.2s ease-in-out',
              opacity: isDisabled ? 0.6 : 1,
            }}
            onMouseEnter={() => setIsDaughterHovered(true)}
            onMouseLeave={() => setIsDaughterHovered(false)}
          >
            <span style={{ fontSize: '1.2rem', marginRight: '5px' }}>♀</span> Add Daughter
          </Button>
        </span>
      </OverlayTrigger>
    );
  };

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
            {renderAddSpouseButton()}
            {renderAddSonButton()}
            {renderAddDaughterButton()}
          </Col>
        </Row>

        {/* CSV Import/Export */}
        <Row className="mb-2">
          <Col>
            <Button 
              onClick={onExportClick} 
              className="btn btn-success w-100" 
              style={{ border: '1px solid #28a745', opacity: (isExporting || isImporting) ? 0.6 : 1 }}
              disabled={isExporting || isImporting}
            >
              Export CSV
            </Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label className="btn btn-primary w-100">
                Import CSV
                <Form.Control type="file" onChange={importCSV} accept=".csv" hidden />
              </Form.Label>
            </Form.Group>
          </Col>
        </Row>
        {(isExporting || isImporting) && (
          <div className="mt-3">
            <ProgressBar animated now={100} variant="primary" />
            <p className="text-center mt-1">{isExporting ? 'Exporting...' : 'Importing...'}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default TreeControls;
