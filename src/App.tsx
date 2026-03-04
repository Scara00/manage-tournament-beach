import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { CreateTournament } from "@/pages/CreateTournament";
import { TournamentDetail } from "@/pages/TournamentDetail";
import TournamentManagement from "./pages/TournamentManagement";

export function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create-tournament" element={<CreateTournament />} />
          <Route path="/tournament/:id" element={<TournamentDetail />} />
          <Route
            path="/tournament/:id/manage"
            element={<TournamentManagement />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
