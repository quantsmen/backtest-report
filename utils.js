// utils.js - Utility functions

// Format numbers according to Indian numbering system
function formatIndianNumber(num) {
    if (isNaN(num) || num === 0) return num.toString();
    
    const isNegative = num < 0;
    const absNum = Math.abs(num);
    
    // Handle decimal places
    const parts = absNum.toString().split('.');
    let integerPart = parts[0];
    const decimalPart = parts[1];
    
    // Apply Indian formatting only if number is >= 1000
    if (absNum >= 1000) {
        // Convert to string and reverse for easier processing
        let digits = integerPart.split('').reverse();
        let formatted = [];
        
        // Add first 3 digits
        for (let i = 0; i < Math.min(3, digits.length); i++) {
            formatted.push(digits[i]);
        }
        
        // Add comma after first 3 digits if more digits exist
        if (digits.length > 3) {
            formatted.push(',');
        }
        
        // Add remaining digits in groups of 2
        for (let i = 3; i < digits.length; i += 2) {
            formatted.push(digits[i]);
            if (i + 1 < digits.length) {
                formatted.push(digits[i + 1]);
            }
            
            // Add comma if more digits exist
            if (i + 2 < digits.length) {
                formatted.push(',');
            }
        }
        
        integerPart = formatted.reverse().join('');
    }
    
    // Reconstruct the number
    let result = integerPart;
    if (decimalPart) {
        result += '.' + decimalPart;
    }
    
    return (isNegative ? '-' : '') + result;
}

// Get value class for PnL display
function getPnLValueClass(value) {
    if (value === '-' || !value) return '';
    if (value.includes('-')) return 'pnl-negative';
    return 'pnl-positive';
}

// Get metric class for PnL display
function getPnLMetricClass(value) {
    if (value === 'N/A' || !value) return '';
    if (value.includes('-')) return 'pnl-negative';
    return 'pnl-positive';
}