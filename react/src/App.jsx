import LiveFeed from "./LiveFeed";
import {MemoryRouter as Router, Routes, Route} from "react-router-dom";
import InsightsPage from "./InsightsPage";
import SystemLogsPage from "./SystemLogsPage";
import { EegStreamProvider } from "./EegStreamContext";

function App() {
  return (
    <EegStreamProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LiveFeed />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/system-logs" element={<SystemLogsPage />} />
        </Routes>
      </Router>
    </EegStreamProvider>
  );
}

export default App;