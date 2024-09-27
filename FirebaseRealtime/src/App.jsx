import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./components/auth";
import Profile from "./components/profile";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />

      </Routes>
    </Router>

  );
};

export default App;
