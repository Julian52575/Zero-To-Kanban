import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import TodoList from './components/TodoListV2';

function App() {
    return (
        <Container>
            <Row>
                <Col md={{ offset: 3, span: 6 }}>
                    <TodoList />
                </Col>
            </Row>
        </Container>
    );
}

export default App;