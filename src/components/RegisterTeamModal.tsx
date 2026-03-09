import React, { useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { registerTeamToTournament } from "../lib/supabase";
import { useAuth } from "../context/useAuth";

interface RegisterTeamModalProps {
  tournamentId: number;
  tournamentName: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function RegisterTeamModal({
  tournamentId,
  tournamentName,
  onSuccess,
  onClose,
}: RegisterTeamModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    team_name: "",
    player1_name: "",
    player2_name: "",
    email: user?.email || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.team_name.trim()) {
      setError("Team name is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await registerTeamToTournament(tournamentId, {
        team_name: formData.team_name,
        player1_name: formData.player1_name || undefined,
        player2_name: formData.player2_name || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register team");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div
        className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
        <Card className="w-full max-w-md p-6">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Registration Successful!
            </h3>
            <p className="text-gray-600 mb-4">
              Your team has been registered for{" "}
              <strong>{tournamentName}</strong>
            </p>
            <p className="text-sm text-gray-500">Redirecting...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
      <Card className="w-full max-w-md p-0">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold">Register Team</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {tournamentName}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="team_name"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Team Name *
            </label>
            <Input
              id="team_name"
              name="team_name"
              type="text"
              placeholder="e.g., Beach Legends"
              value={formData.team_name}
              onChange={handleInputChange}
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label
              htmlFor="player1_name"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Player 1 Name
            </label>
            <Input
              id="player1_name"
              name="player1_name"
              type="text"
              placeholder="First player name (optional)"
              value={formData.player1_name}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="player2_name"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Player 2 Name
            </label>
            <Input
              id="player2_name"
              name="player2_name"
              type="text"
              placeholder="Second player name (optional)"
              value={formData.player2_name}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          {!user && (
            <div>
              <label
                htmlFor="email"
                className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                required={!user}
              />
            </div>
          )}

          <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Registering..." : "Register Team"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
