import { calculateWeightedTotal } from "../src/lib/scoring";
import { DEFAULT_WEIGHTS } from "../src/lib/lions-config";

const testPoints = { p1: 10, p2: 10, p3: 10, p4: 10, p5: 10 };
const result = calculateWeightedTotal(testPoints, DEFAULT_WEIGHTS);

console.log("Input Points:", testPoints);
console.log("Result (Expected 50.0):", result);

if (result === 50) {
    console.log("VERIFICATION SUCCESS: Weighted total is correct.");
} else {
    console.error("VERIFICATION FAILED: Expected 50, got", result);
}
