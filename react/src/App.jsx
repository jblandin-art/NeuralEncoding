import LiveFeed from "./LiveFeed";
import {MemoryRouter as Router, Routes, Route} from "react-router-dom";
import TrainingPage from "./TrainingPage";
import SystemLogsPage from "./SystemLogsPage";
import { EegStreamProvider } from "./EegStreamContext";

function App() {
  return (
    <EegStreamProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LiveFeed />} />
          <Route path="/training" element={<TrainingPage />} />
          <Route path="/system-logs" element={<SystemLogsPage />} />
        </Routes>
      </Router>
    </EegStreamProvider>
  );
}

export default App;