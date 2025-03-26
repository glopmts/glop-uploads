import { Route, HashRouter as Router, Routes } from "react-router-dom";
import Home from "./pages/home/home";

function App(): JSX.Element {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
