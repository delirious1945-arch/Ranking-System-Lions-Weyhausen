/**
 * Central Configuration for Lions Weyhausen Website
 * Usage: Import these constants instead of hardcoding them in APIs or scripts.
 */

export const LIONS_NAMES = [
    "André Rathje",
    "Dirk Ostermann",
    "Erik Schremmer",
    "Jannik Baier",
    "Jens Goltermann",
    "Joachim Koch",
    "Karen Schulz",
    "Karsten Kohnert",
    "Kevin Emde",
    "Maik Feuerhahn",
    "Malte Wolnik",
    "Martin Wolnik",
    "Michael Gehrt",
    "Michael Kranz",
    "Nicholas Stedman",
    "Sebastian Kirste",
    "Timo Feuerhahn"
];

export const SCRAPE_EVENTS = [
    { eventId: 247, phaseId: 231, name: "Lions Weyhausen A" },
    { eventId: 251, phaseId: 235, name: "Lions Weyhausen B" },
    { eventId: 239, phaseId: 230, name: "DC Wettmershagen A" }, // Only Jens Goltermann
];

export const DEFAULT_WEIGHTS = {
    weight_k1: 0.20, // Avg Total
    weight_k2: 0.15, // Avg 9-Dart
    weight_k3: 0.15, // Avg 18-Dart
    weight_k4: 0.25, // Siegquote
    weight_k5: 0.25, // High Scores per Leg
};
