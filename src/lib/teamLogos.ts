// lib/teamLogos.ts

export const teamLogos: Record<string, string> = {
  "McLaren": "/teams/mclaren.png",
  "Ferrari": "/teams/ferrari.png",
  "Red Bull Racing": "/teams/redbull.png",
  "Mercedes": "/teams/mercedes.png",
  "Mercedes-AMG Petronas Formula One Team": "/teams/mercedes.png",
  "Aston Martin": "/teams/astonmartin.png",
  "Aston Martin Aramco Formula One Team": "/teams/astonmartin.png",
  "Alpine": "/teams/alpine.png",
  "BWT Alpine Formula One Team": "/teams/alpine.png",
  "Racing Bulls": "/teams/racingbulls.png",
  "Visa Cash App Racing Bulls Formula One Team": "/teams/racingbulls.png",
  "Haas": "/teams/haas.png",
  "MoneyGram Haas F1 Team": "/teams/haas.png",
  "Williams": "/teams/williams.png",
  "Williams F1 Team": "/teams/williams.png",
  "Audi": "/teams/audi.png",
  "Stake F1 Team Kick Sauber": "/teams/audi.png",
  "Cadillac": "/teams/cadillac.png",
  "Cadillac Formula One Team": "/teams/cadillac.png",
};

export function getTeamLogo(teamName?: string) {
  if (!teamName) return "/teams/default.svg";

  return (
    teamLogos[teamName] ||
    Object.entries(teamLogos).find(([key]) =>
      teamName.toLowerCase().includes(key.toLowerCase())
    )?.[1] ||
    "/teams/default.png"
  );
}