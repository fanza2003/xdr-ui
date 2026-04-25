import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CTI from "./pages/CTI";
import AIAnalysis from "./pages/AIAnalysis";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/cti" element={<CTI />} />
      <Route path="/ai" element={<AIAnalysis />} />
    </Routes>
  );
}

export default App;