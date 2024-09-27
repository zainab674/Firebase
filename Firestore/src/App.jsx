import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./components/auth"; // Your Auth component
import Profile from "./components/profile"; // The Profile page
import Data from "./components/data";
import Home from "./components/home";
import CreatorDetails from "./components/creater";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/data" element={<Data />} />
        <Route path="/home" element={<Home />} />
        <Route path="/creator/:creatorId" element={<CreatorDetails />} />
      </Routes>
    </Router>
  );
};

export default App;
