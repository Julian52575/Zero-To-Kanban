import { useState } from "react";
import { Alert, Spinner, Button, Card, Container, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setIsLoading(false);
      return;
    }
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call
      const res = false;
      if (!res) {
        throw new Error("Erreur lors de l'inscription");
      }
      navigate("/login");
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
            <h1 className="h3 mb-2">Créer un compte</h1>
            <p className="text-muted mb-0">Créez votre compte pour commencer</p>
          </div>

          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="registerEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="nom@exemple.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="registerPassword">
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

            <Form.Group className="mb-4" controlId="registerConfirmPassword">
              <Form.Label>Confirmer le mot de passe</Form.Label>

              <div className="position-relative">
                <Form.Control
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmez votre mot de passe"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  isInvalid={
                    confirmPassword.length > 0 && password !== confirmPassword
                  }
                  className="pe-5"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent me-2"
                  aria-label={
                    showConfirmPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  <i
                    className={`fa-solid ${
                      showConfirmPassword ? "fa-eye-slash" : "fa-eye"
                    }`}
                  />
                </button>
              </div>

              {confirmPassword.length > 0 && password !== confirmPassword && (
                <div className="invalid-feedback d-block">
                  Les mots de passe ne correspondent pas.
                </div>
              )}
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
                    className="me-2"
                  />
                  Création en cours...
                </>
              ) : (
                "Créer mon compte"
              )}
            </Button>
          </Form>

          <div className="text-center mt-3">
            <span className="text-muted">Vous avez déjà un compte ? </span>
            <Link to="/login">Se connecter</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
