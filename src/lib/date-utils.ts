/**
 * Date and Week Utilities for Snapshot Management
 */

/**
 * Calculates the current "Spieltag" based on the ISO week number.
 * Can be overridden with an offset or manual input.
 */
export function getWeekId(dateInput: Date = new Date()): string {
    const d = new Date(Date.UTC(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    
    return `Spieltag ${weekNo}`;
}

/**
 * Formats a Date object for display in the UI
 */
export function formatDate(date: Date): string {
    return date.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}
