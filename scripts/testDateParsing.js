/**
 * Test Date Parsing in Enhanced AI
 * Verifies that date-specific queries are detected correctly
 */

import { format, subDays, parseISO } from 'date-fns';

// Simplified version of analyzeQuery for testing (without OpenAI dependency)
function analyzeQuery(query) {
  const lowerQuery = query.toLowerCase();
  
  let timePeriod = 'general';
  let specificDate = null;
  
  // Check for specific date patterns first (ordinals first for priority)
  const datePatterns = [
    /(\d{1,2})(st|nd|rd|th)\s+(january|february|march|april|may|june|july|august|september|october|november|december)/i,
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(st|nd|rd|th)/i,
    /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)/i,
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})/i,
    /(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/,
    /(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/,
  ];

  const getMonthNumber = (monthName) => {
    const months = {
      january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2,
      april: 3, apr: 3, may: 4, june: 5, jun: 5, july: 6, jul: 6,
      august: 7, aug: 7, september: 8, sep: 8, sept: 8,
      october: 9, oct: 9, november: 10, nov: 10, december: 11, dec: 11,
    };
    return months[monthName.toLowerCase()] || 0;
  };

  for (const pattern of datePatterns) {
    const match = query.match(pattern);
    if (match) {
      try {
        let day, month, year = new Date().getFullYear();
        
        if (pattern.source.includes('january|february')) {
          if (pattern.source.includes('st|nd|rd|th')) {
            // Ordinal patterns
            if (match[1] && !isNaN(match[1])) {
              day = parseInt(match[1]);
              month = getMonthNumber(match[3]);
            } else {
              month = getMonthNumber(match[1]);
              day = parseInt(match[2]);
            }
          } else {
            // Simple patterns
            if (match[1] && !isNaN(match[1])) {
              day = parseInt(match[1]);
              month = getMonthNumber(match[2]);
            } else {
              month = getMonthNumber(match[1]);
              day = parseInt(match[2]);
            }
          }
        } else if (pattern.source.includes('\\d{4}')) {
          if (match[1].length === 4) {
            year = parseInt(match[1]);
            month = parseInt(match[2]) - 1;
            day = parseInt(match[3]);
          } else {
            day = parseInt(match[1]);
            month = parseInt(match[2]) - 1;
            year = parseInt(match[3]);
          }
        }
        
        const dateObj = new Date(year, month, day);
        if (!isNaN(dateObj.getTime())) {
          specificDate = format(dateObj, 'yyyy-MM-dd');
          timePeriod = 'specific_date';
          break;
        }
      } catch (e) {
        console.log('⚠️ Date parsing failed:', e.message);
      }
    }
  }
  
  if (!specificDate) {
    if (lowerQuery.includes('today')) {
      timePeriod = 'today';
      specificDate = format(new Date(), 'yyyy-MM-dd');
    } else if (lowerQuery.includes('yesterday')) {
      timePeriod = 'yesterday';
      specificDate = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    }
  }

  const metrics = [];
  if (lowerQuery.includes('revenue') || lowerQuery.includes('sales')) metrics.push('revenue');
  if (lowerQuery.includes('order')) metrics.push('orders');
  if (lowerQuery.includes('profit')) metrics.push('profit');

  return {
    timePeriod,
    specificDate,
    metrics: metrics.length > 0 ? metrics : ['all'],
    intent: query,
  };
}

const testQueries = [
  // Specific date formats
  "What was the profit on 2 October?",
  "2 October profit",
  "October 2 profit",
  "Show me revenue for 15 October",
  "October 15 revenue",
  "2nd October profit",
  "October 2nd profit",
  "15th October revenue",
  "October 15th revenue",
  
  // ISO date formats
  "What was revenue on 2023-10-02?",
  "Show me 02-10-2023 profit",
  "2023/10/02 revenue",
  "02/10/2023 profit",
  
  // Relative dates (should still work)
  "What was yesterday's profit?",
  "Show me today's revenue",
  "This week's orders",
  "Last 30 days profit",
  
  // General queries (should not detect specific dates)
  "What's my total revenue?",
  "How many orders do I have?",
  "Show me profit margin",
];

console.log('🧪 Testing Date Parsing in Enhanced AI\n');
console.log('='.repeat(80));

testQueries.forEach((query, index) => {
  console.log(`\n${index + 1}. Query: "${query}"`);
  
  const analysis = analyzeQuery(query);
  
  console.log(`   Time Period: ${analysis.timePeriod}`);
  console.log(`   Specific Date: ${analysis.specificDate || 'None'}`);
  console.log(`   Metrics: ${analysis.metrics.join(', ')}`);
  
  // Validation
  if (query.includes('2 October') || query.includes('October 2') || 
      query.includes('2nd October') || query.includes('October 2nd') ||
      query.includes('2023-10-02') || query.includes('02-10-2023') ||
      query.includes('2023/10/02') || query.includes('02/10/2023')) {
    if (analysis.specificDate && analysis.specificDate.includes('10-02')) {
      console.log('   ✅ PASS - Correctly detected October 2');
    } else {
      console.log('   ❌ FAIL - Should detect October 2');
    }
  } else if (query.includes('15 October') || query.includes('October 15') ||
             query.includes('15th October') || query.includes('October 15th')) {
    if (analysis.specificDate && analysis.specificDate.includes('10-15')) {
      console.log('   ✅ PASS - Correctly detected October 15');
    } else {
      console.log('   ❌ FAIL - Should detect October 15');
    }
  } else if (query.includes('yesterday')) {
    if (analysis.timePeriod === 'yesterday') {
      console.log('   ✅ PASS - Correctly detected yesterday');
    } else {
      console.log('   ❌ FAIL - Should detect yesterday');
    }
  } else if (query.includes('today')) {
    if (analysis.timePeriod === 'today') {
      console.log('   ✅ PASS - Correctly detected today');
    } else {
      console.log('   ❌ FAIL - Should detect today');
    }
  } else {
    console.log('   ℹ️  General query - no specific date expected');
  }
});

console.log('\n' + '='.repeat(80));
console.log('\n✅ Date parsing test complete!\n');
