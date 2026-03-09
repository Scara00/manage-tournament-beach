import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Trophy } from "lucide-react";
import { useAuth } from "@/context/useAuth";

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(null);

    try {
      await login(email, password);
      setEmail("");
      setPassword("");
    } catch (error: any) {
      const errorMessage =
        error.message || "Errore di login. Verifica le credenziali.";
      setLoginError(errorMessage);
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 flex items-center justify-center bg-gradient-to-b from-blue-50 to-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <div className="rounded-lg bg-blue-100 p-3">
              <Trophy className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl">
            Beach Volley Manager
          </CardTitle>
          <p className="text-sm text-muted-foreground">Accesso Organizzatore</p>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {loginError && (
            <div className="flex gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Errore Login</p>
                <p className="text-sm text-red-700">{loginError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                placeholder="Es: organizer@example.com"
                type="email"
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                placeholder="Password"
                type="password"
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full text-xs sm:text-sm"
              disabled={isLoading || !email || !password}
              size="sm">
              {isLoading ? "Accesso in corso..." : "Accedi"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground font-medium">
                Credenziali Demo
              </span>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-semibold text-blue-900 line-clamp-2">
              Usa le credenziali di test (create su Supabase):
            </p>
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="text-xs font-medium text-blue-700 min-w-fit">
                  Email:
                </span>
                <code className="bg-white px-3 py-1 rounded text-blue-900 font-mono text-xs border border-blue-200">
                  organizer@example.com
                </code>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="text-xs font-medium text-blue-700 min-w-fit">
                  Password:
                </span>
                <code className="bg-white px-3 py-1 rounded text-blue-900 font-mono text-xs border border-blue-200">
                  Test!123456
                </code>
              </div>
            </div>
            <p className="text-xs text-blue-700 mt-3">
              💡 Se non hai credenziali, accedi a Supabase e crea un nuovo
              utente in Authentication.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
