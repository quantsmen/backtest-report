// report-parser.js - Functions for parsing backtest reports

function parseReport(text, name) {
    const report = {
        name: name || `Report ${reports.length + 1}`,
        metrics: {},
        pnlData: '' // Initialize with empty string
    };
    
    // Remove newlines and normalize spaces
    const normalizedText = text.replace(/\n/g, ' ').replace(/\t/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Extract metrics using specific patterns for your data format
    const patterns = [
        // Basic metrics
        { name: 'Net Profit', pattern: /Net Profit\s+([\d.-]+)(?:\s+[\d.-]+){2}/ },
        { name: 'Net Profit %', pattern: /Net Profit %\s+([\d.-]+%)/ },
        { name: 'Annual Return %', pattern: /Annual Return %\s+([\d.-]+%)/ },
        { name: 'Exposure %', pattern: /Exposure %\s+([\d.-]+%)/ },
        { name: 'Initial capital', pattern: /Initial capital\s+([\d.-]+)/ },
        { name: 'Ending capital', pattern: /Ending capital\s+([\d.-]+)/ },
        { name: 'Transaction costs', pattern: /Transaction costs\s+([\d.-]+)/ },
        
        // Trade statistics from **sections**
        { name: 'Total Trades', pattern: /All trades\s+([\d.-]+)/ },
        { name: 'Winners', pattern: /Winners\s+([\d.-]+)/ },
        { name: 'Losers', pattern: /Losers\s+([\d.-]+)/ },
        
        // Avg metrics
        { name: 'Avg. Profit/Loss', pattern: /Avg\. Profit\/Loss\s+([\d.-]+)(?:\s+-nan\(ind\))?\s+([\d.-]+)/ },
        { name: 'Avg. Profit/Loss %', pattern: /Avg\. Profit\/Loss %\s+([\d.-]+%)/ },
        { name: 'Avg. Bars Held', pattern: /Avg\. Bars Held\s+([\d.-]+)/ },
        
        // Profit/Loss details
        { name: 'Total Profit', pattern: /Total Profit\s+([\d.-]+)/ },
        { name: 'Total Loss', pattern: /Total Loss\s+([\d.-]+)/ },
        { name: 'Avg. Profit', pattern: /Avg\. Profit\s+([\d.-]+)/ },
        { name: 'Avg. Loss', pattern: /Avg\. Loss\s+([\d.-]+)/ },
        { name: 'Largest win', pattern: /Largest win\s+([\d.-]+)/ },
        { name: 'Largest loss', pattern: /Largest loss\s+([\d.-]+)/ },
        
        // Risk metrics
        { name: 'Max. trade drawdown', pattern: /Max\. trade drawdown\s+([\d.-]+)/ },
        { name: 'Max. system drawdown', pattern: /Max\. system drawdown\s+([\d.-]+)/ },
        { name: 'Max. system % drawdown', pattern: /Max\. system % drawdown\s+([\d.-]+%)/ },
        { name: 'Recovery Factor', pattern: /Recovery Factor\s+([\d.-]+)/ },
        { name: 'CAR/MaxDD', pattern: /CAR\/MaxDD\s+([\d.-]+)/ },
        
        // Performance ratios
        { name: 'Profit Factor', pattern: /Profit Factor\s+([\d.-]+)(?:\s+nan)?\s+([\d.-]+)/ },
        { name: 'Payoff Ratio', pattern: /Payoff Ratio\s+([\d.-]+)/ },
        { name: 'Risk-Reward Ratio', pattern: /Risk-Reward Ratio\s+([\d.-]+)/ },
        { name: 'Sharpe Ratio of trades', pattern: /Sharpe Ratio of trades\s+([\d.-]+)/ },
        { name: 'Ulcer Index', pattern: /Ulcer Index\s+([\d.-]+)/ },
        { name: 'K-Ratio', pattern: /K-Ratio\s+([\d.-]+)/ }
    ];

    patterns.forEach(({ name, pattern }) => {
        const match = normalizedText.match(pattern);
        if (match) {
            let value = match[1];
            // If we have multiple capture groups, try to get the first valid one
            if (match[2] && (value === 'nan' || value.includes('nan') || value === '0' || value === '0.00')) {
                value = match[2];
            }
            
            // Only store valid values
            if (value && value !== 'nan' && value !== '-nan(ind)' && 
                value !== '0.00' && !value.includes('nan') && value !== '-inf') {
                report.metrics[name] = value;
            }
        }
    });

    return report;
}