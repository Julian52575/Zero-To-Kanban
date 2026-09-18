import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import TodoList from './components/TodoList';

function App() {
    return (
        <Container>
            <Row>
                <Col md={{ offset: 0, span: 4 }}>
                    <TodoList />
                </Col>
                <Col md={{ offset: 1, span: 4 }}> </Col>
                <Col md={{ offset: 2, span: 4 }}> </Col>
                <Col md={{ offset: 3, span: 4 }}> </Col>
            </Row>
        </Container>
    );
}

export default App;