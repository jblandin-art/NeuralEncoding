import LiveFeed from "./LiveFeed";
import {MemoryRouter as Router, Routes, Route} from "react-router-dom";
import Insights from "./Insights";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LiveFeed />} />
        <Route path="/insights" element={<Insights />} />
      </Routes>
    </Router>
  );
}

export default App;