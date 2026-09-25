import { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import { getProjects, deleteProject, createProject } from "../services/ProjectApi";
import type { Project } from "../types/Project";

function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setError(null);
    getProjects()
      .then((data) => setProjects(data))
      .catch((error) => {
        console.error("Erreur lors de la récupération des projets :", error);
        setError("Impossible de récupérer les projets. Veuillez réessayer plus tard.");
      });
  }, []);

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    createProject(trimmed)
      .then((createdProject) => {
        setProjects([...projects, createdProject]);
        setName("");
      })
      .catch((error) => {
        console.error("Erreur lors de la création du projet :", error);
        setError("Impossible de créer le projet. Veuillez réessayer plus tard.");
      });
  };

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation(); 
    if (!window.confirm("Supprimer ce projet et toutes ses tâches ?")) return;
    deleteProject(id)
      .then(() => {
        setProjects(projects.filter((p) => p.id !== id));
      })
      .catch((error) => {
        console.error("Erreur lors de la suppression du projet :", error);
        setError("Impossible de supprimer le projet. Veuillez réessayer plus tard.");
      });
  };

  if (error) {
    return (
      <Container className="py-4">
        <Row>
          <Col md={{ offset: 3, span: 6 }}>
            <p className="text-danger">{error}</p>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        <Col md={{ offset: 3, span: 6 }}>
          <h2 className="mb-4">Projets en cours</h2>

          <Form onSubmit={handleCreate} className="d-flex gap-2 mb-4">
            <Form.Control
              type="text"
              placeholder="Nom du nouveau projet"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button type="submit" variant="primary">
              Créer
            </Button>
          </Form>

          {projects.length === 0 ? (
            <p className="text-muted">Aucun projet pour le moment.</p>
          ) : (
            <ListGroup>
              {projects.map((project) => (
                <ListGroup.Item
                  key={project.id}
                  as="div"
                  action
                  role="button"
                  className="d-flex justify-content-between align-items-center"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <span>{project.name}</span>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={(e) => handleDelete(e, project.id)}
                  >
                    Supprimer
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Projects;
