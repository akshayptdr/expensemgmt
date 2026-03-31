/**
 * Robustly parses date values, especially handling DD-MM-YYYY or DD/MM/YYYY
 * formats common in Google Sheets and standardizing browser behavior.
 * 
 * @param {any} dateVal - Date object, string, or number to parse
 * @returns {Date} - Parsed Date object (may be invalid)
 */
export const safelyParseDate = (dateVal) => {
    if (dateVal instanceof Date) return dateVal;
    if (!dateVal) return new Date(NaN);

    const dStr = String(dateVal).trim();
    // Match DD-MM-YYYY or DD/MM/YYYY
    const ddmmyyyy = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/;
    const match = dStr.match(ddmmyyyy);
    if (match) {
        // new Date(year, monthIndex, day)
        return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
    }
    return new Date(dStr);
};
