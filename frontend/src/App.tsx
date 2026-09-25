import { Routes, Route, Navigate } from "react-router-dom";
import Kanban from "./routes/Kanban";
import Projects from "./routes/Projects";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Projects />} />
      <Route path="/projects/:projectId" element={<Kanban />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
