import { useState } from "react";
import { Alert, Spinner, Button, Card, Container, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";


export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call
      console.log({
        email,
        password,
      });
      const res = true
      if (!res) {
        throw new Error("Identifiants invalides");
      }
      login("dummyToken", {id: 1, email: email });
      navigate("/project");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Une erreur est survenue",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <Card style={{ width: "100%", maxWidth: "420px" }} className="shadow">
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <h1 className="h3 mb-2">Connexion</h1>
            <p className="text-muted mb-0">Connectez-vous à votre compte</p>
          </div>

          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="loginEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="nom@exemple.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-4" controlId="loginPassword">
              <Form.Label>Mot de passe</Form.Label>

              <div className="position-relative">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="pe-5"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent me-2"
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  <i
                    className={`fa-solid ${
                      showPassword ? "fa-eye-slash" : "fa-eye"
                    }`}
                  />
                </button>
              </div>
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    style={{marginRight: "0.5rem"}}
                  />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>

            <div className="text-center mt-3">
              <span className="text-muted">
                Vous n’avez pas encore de compte ?{" "}
              </span>
              <Link to="/register">Créer un compte</Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
