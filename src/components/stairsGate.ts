type StairsGate = {
  cover: () => Promise<void>;
  reveal: () => Promise<void>;
};

let gate: StairsGate | null = null;

export function setStairsGate(next: StairsGate | null) {
  gate = next;
}

/** Drop the panels over the current page once the load curtain is ready. */
export function coverStairs() {
  return gate?.cover() ?? Promise.resolve();
}

/** Lift the panels off the newly rendered page. */
export function revealStairs() {
  return gate?.reveal() ?? Promise.resolve();
}
