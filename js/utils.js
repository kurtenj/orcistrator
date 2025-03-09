// Format modifier for display (e.g., +2 or -1)
export function formatModifier(mod) {
    return mod >= 0 ? `+${mod}` : `${mod}`;
}

// Utility function to roll a die
export function rollDice(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

// Utility function to roll damage dice (e.g., "2d6+2")
export function rollDamageDice(damageDice) {
    // Parse the damage dice string (e.g., "2d6")
    const match = damageDice.match(/(\d+)d(\d+)/);
    
    if (match) {
        const numDice = parseInt(match[1]);
        const diceSides = parseInt(match[2]);
        
        let total = 0;
        for (let i = 0; i < numDice; i++) {
            total += rollDice(diceSides);
        }
        
        return total;
    }
    
    return 0;
}

// Calculate HP from hit dice (e.g., "3d8+6")
export function calculateHpFromHitDice(hitDice, conMod) {
    const match = hitDice.match(/(\d+)d(\d+)(?:\+(\d+))?/);
    
    if (match) {
        const numDice = parseInt(match[1]);
        const diceSides = parseInt(match[2]);
        const bonus = match[3] ? parseInt(match[3]) : 0;
        
        // Calculate average HP: numDice * (diceSides + 1) / 2 + bonus
        // This gives the average roll for each die
        return Math.floor(numDice * ((diceSides + 1) / 2)) + bonus;
    }
    
    return 10; // Fallback
}

// Import Tailwind utilities
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names and resolves Tailwind CSS conflicts
 * @param {...string} inputs - Class names to combine
 * @returns {string} - Combined class names
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
} 