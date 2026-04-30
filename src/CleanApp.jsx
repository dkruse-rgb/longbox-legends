import AppPrototype from "./AppV24.jsx";

// Longbox Legends clean entry point.
//
// The current playable game still lives in the prototype stack while the app is
// being safely refactored into modules under src/game and src/components.
// Keeping this compatibility layer lets us improve the architecture without
// breaking the deployed GitHub Pages build.
export default function CleanApp() {
  return <AppPrototype />;
}
