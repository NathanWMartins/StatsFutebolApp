import { Navigate, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Groups from "./pages/Groups";
import Group from "./pages/Group";
import JoinGroup from "./pages/JoinGroup";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/groups" element={<Groups />} />
      <Route path="/groups/:groupId" element={<Group />} />
      <Route path="/join/:inviteCode" element={<JoinGroup />} />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default App;