/**
 * Shared Date Parsing Utility
 * Used by all AI systems to detect and parse date queries
 */

import { format, subDays } from 'date-fns';

/**
 * Convert month name to month number (0-11)
 */
function getMonthNumber(monthName) {
  const months = {
    january: 0, jan: 0,
    february: 1, feb: 1,
    march: 2, mar: 2,
    april: 3, apr: 3,
    may: 4,
    june: 5, jun: 5,
    july: 6, jul: 6,
    august: 7, aug: 7,
    september: 8, sep: 8, sept: 8,
    october: 9, oct: 9,
    november: 10, nov: 10,
    december: 11, dec: 11,
  };
  return months[monthName.toLowerCase()] || 0;
}

/**
 * Analyze query to detect specific dates and time periods
 * @param {string} query - User's question
 * @returns {Object} - Analysis result with timePeriod and specificDate
 */
export function analyzeQuery(query) {
  const lowerQuery = query.toLowerCase();
  
  let timePeriod = 'general';
  let specificDate = null;
  let dateDetected = false;
  
  // Check for specific date patterns first (highest priority)
  const datePatterns = [
    // "2nd October", "15th October" (check ordinals first)
    /(\d{1,2})(st|nd|rd|th)\s+(january|february|march|april|may|june|july|august|september|october|november|december)/i,
    // "October 2nd", "October 15th"
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(st|nd|rd|th)/i,
    // "2 October", "15 October", "October 2", "October 15"
    /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)/i,
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})/i,
    // "2023-10-02", "2023/10/02", "02-10-2023", "02/10/2023"
    /(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/,
    /(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/,
  ];

  for (const pattern of datePatterns) {
    const match = query.match(pattern);
    if (match) {
      try {
        let day, month, year = new Date().getFullYear();
        
        if (pattern.source.includes('january|february')) {
          // Month name patterns
          if (pattern.source.includes('st|nd|rd|th')) {
            // Ordinal patterns: "2nd October" or "October 2nd"
            if (match[1] && !isNaN(match[1])) {
              // "2nd October" format
              day = parseInt(match[1]);
              month = getMonthNumber(match[3]);
            } else {
              // "October 2nd" format
              month = getMonthNumber(match[1]);
              day = parseInt(match[2]);
            }
          } else {
            // Simple patterns: "2 October" or "October 2"
            if (match[1] && !isNaN(match[1])) {
              // "2 October" format
              day = parseInt(match[1]);
              month = getMonthNumber(match[2]);
            } else {
              // "October 2" format
              month = getMonthNumber(match[1]);
              day = parseInt(match[2]);
            }
          }
        } else if (pattern.source.includes('\\d{4}')) {
          // ISO date patterns
          if (match[1].length === 4) {
            // YYYY-MM-DD
            year = parseInt(match[1]);
            month = parseInt(match[2]) - 1;
            day = parseInt(match[3]);
          } else {
            // DD-MM-YYYY
            day = parseInt(match[1]);
            month = parseInt(match[2]) - 1;
            year = parseInt(match[3]);
          }
        }
        
        const dateObj = new Date(year, month, day);
        if (!isNaN(dateObj.getTime())) {
          specificDate = format(dateObj, 'yyyy-MM-dd');
          timePeriod = 'specific_date';
          dateDetected = true;
          console.log(`🗓️ Detected specific date: ${specificDate}`);
          break;
        }
      } catch (e) {
        console.log('⚠️ Date parsing failed:', e.message);
      }
    }
  }
  
  // If no specific date found, check for relative time periods
  if (!dateDetected) {
    if (lowerQuery.includes('today') || lowerQuery.includes("today's")) {
      timePeriod = 'today';
      specificDate = format(new Date(), 'yyyy-MM-dd');
    } else if (lowerQuery.includes('yesterday')) {
      timePeriod = 'yesterday';
      specificDate = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    } else if (lowerQuery.includes('this week') || lowerQuery.includes('weekly')) {
      timePeriod = 'this_week';
    } else if (lowerQuery.includes('this month') || lowerQuery.includes('monthly')) {
      timePeriod = 'this_month';
    } else if (lowerQuery.includes('last month')) {
      timePeriod = 'last_month';
    } else if (lowerQuery.includes('last 7 days') || lowerQuery.includes('past week')) {
      timePeriod = 'last_7_days';
    } else if (lowerQuery.includes('last 30 days') || lowerQuery.includes('past month')) {
      timePeriod = 'last_30_days';
    }
  }

  // Metric detection
  const metrics = [];
  if (lowerQuery.includes('revenue') || lowerQuery.includes('sales')) metrics.push('revenue');
  if (lowerQuery.includes('order')) metrics.push('orders');
  if (lowerQuery.includes('profit')) metrics.push('profit');
  if (lowerQuery.includes('roas') || lowerQuery.includes('ad')) metrics.push('roas');
  if (lowerQuery.includes('aov') || lowerQuery.includes('average order')) metrics.push('aov');

  return {
    timePeriod,
    specificDate,
    dateDetected,
    metrics: metrics.length > 0 ? metrics : ['all'],
    intent: query,
  };
}

/**
 * Format a date for display
 * @param {string} dateStr - Date string in yyyy-MM-dd format
 * @returns {string} - Formatted date like "October 2, 2023"
 */
export function formatDateForDisplay(dateStr) {
  try {
    const date = new Date(dateStr);
    return format(date, 'MMMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export default {
  analyzeQuery,
  formatDateForDisplay,
  getMonthNumber,
};
