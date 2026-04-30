import CleanGame from "./CleanGame.jsx";

// Longbox Legends clean entry point.
//
// The deployed game now runs through the rebuilt component architecture:
// GameShell, FloorMap, ZoneDetails, LiveDay, MissionSystem, and CollectionModal.
// The older AppV prototype files remain in the repo as fallback/reference while
// new work moves into reusable components under src/components and logic modules
// under src/game.
export default function CleanApp() {
  return <CleanGame />;
}
