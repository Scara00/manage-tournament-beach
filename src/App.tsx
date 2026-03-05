import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { CreateTournament } from "@/pages/CreateTournament";
import { TournamentDetail } from "@/pages/TournamentDetail";
import TournamentManagement from "./pages/TournamentManagement";
import { AthletePortal } from "./pages/AthletePortal";
import { BrowseTournaments } from "@/pages/BrowseTournaments";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Header } from "@/components/Header";

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/join" element={<BrowseTournaments />} />
            <Route
              path="/create-tournament"
              element={
                <ProtectedRoute>
                  <CreateTournament />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tournament/:id"
              element={
                <ProtectedRoute>
                  <TournamentDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tournament/:id/manage"
              element={
                <ProtectedRoute>
                  <TournamentManagement />
                </ProtectedRoute>
              }
            />
            <Route path="/athlete" element={<AthletePortal />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
