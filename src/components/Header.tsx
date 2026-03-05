import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/useAuth";
import { LogOut, Home, Trophy } from "lucide-react";

export function Header() {
  const { isAuthenticated, email, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo e Nome App - Sinistra */}
          <Link to="/" className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">
              Beach Volley Manager
            </span>
          </Link>

          {/* Navigation Links - Centro */}
          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <>
                <Link to="/">
                  <Button variant="ghost" size="sm">
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                </Link>
                <Link to="/create-tournament">
                  <Button variant="ghost" size="sm">
                    <Trophy className="h-4 w-4 mr-2" />
                    Nuovo Torneo
                  </Button>
                </Link>
              </>
            )}
            <Link to="/join">
              <Button variant="ghost" size="sm">
                <Trophy className="h-4 w-4 mr-2" />
                Sfoglia Tornei
              </Button>
            </Link>
          </div>

          {/* Utente Loggato e Logout - Destra */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    {email}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Esci
                </Button>
              </>
            ) : (
              <span className="text-sm text-gray-500">Non autenticato</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
