import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CTI from "./pages/CTI";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/cti" element={<CTI />} />
    </Routes>
  );
}

export default App;