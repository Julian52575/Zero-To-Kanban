import { Container, Row, Col } from 'react-bootstrap';
import TodoList from '../components/TodoList';

function Kanban() {
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

export default Kanban;