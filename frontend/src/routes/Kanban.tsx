import { Container, Row, Col } from "react-bootstrap";
import TodoList from "../components/TodoList";
import { Navigate, useParams } from "react-router-dom";

function Kanban() {
  const { projectId } = useParams<{ projectId: string }>();
  if (!projectId) return <Navigate to="/" replace />;
  return (
    <Container>
      <Row>
        <Col md={{ offset: 3, span: 6 }}>
          <TodoList projectId={projectId} />
        </Col>
      </Row>
    </Container>
  );
}

export default Kanban;
