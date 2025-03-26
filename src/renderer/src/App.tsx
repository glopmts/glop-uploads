import { Route, HashRouter as Router, Routes } from "react-router-dom";
import EditeImage from "./pages/edite-image/image-edit";
import Home from "./pages/home/home";

function App(): JSX.Element {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/edite-image" element={<EditeImage />} />
      </Routes>
    </Router>
  );
}

export default App;
