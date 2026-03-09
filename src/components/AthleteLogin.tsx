import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader, AlertCircle, Search } from "lucide-react";

interface AthleteLoginProps {
  surname: string;
  isLoading: boolean;
  error: string | null;
  onSurnameChange: (value: string) => void;
  onLogin: () => void;
  onErrorClear: () => void;
}

export function AthleteLogin({
  surname,
  isLoading,
  error,
  onSurnameChange,
  onLogin,
  onErrorClear,
}: AthleteLoginProps) {
  return (
    <div className="min-h-screen p-4 flex items-center justify-center bg-gradient-to-b from-blue-50 to-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-lg sm:text-xl\">
            Portale Atleti
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4\">
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Inserisci il tuo cognome per accedere al portale e visualizzare le
              tue informazioni
            </p>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Input
              placeholder="Es: Rossi"
              value={surname}
              onChange={(e) => {
                onSurnameChange(e.target.value);
                onErrorClear();
              }}
              onKeyDown={(e) => e.key === "Enter" && !isLoading && onLogin()}
              disabled={isLoading}
              autoFocus
            />
          </div>
          <Button onClick={onLogin} className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Ricerca in corso...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Accedi
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
