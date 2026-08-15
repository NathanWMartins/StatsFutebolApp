import { Navigate, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Groups from "./pages/Groups";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/groups" element={<Groups />} />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default App;