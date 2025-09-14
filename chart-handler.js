// chart-handler.js - Functions for creating charts and comparison tables

function createComparisonTable() {
    // Create comparison table
    const allMetrics = new Set();
    reports.forEach(report => {
        Object.keys(report.metrics).forEach(metric => allMetrics.add(metric));
    });

    let tableHtml = '<table class="comparison-table"><thead><tr><th>Metric</th>';
    reports.forEach(report => {
        tableHtml += `<th>${report.name}</th>`;
    });
    tableHtml += '</tr></thead><tbody>';

    // Group metrics by category
    const categories = {
        'Performance': ['Net Profit', 'Net Profit %', 'Annual Return %', 'Sharpe Ratio of trades', 'Profit Factor'],
        'Risk': ['Max. system drawdown', 'Max. system % drawdown', 'Risk-Reward Ratio', 'Ulcer Index'],
        'Trade Statistics': ['Total Trades', 'Winners', 'Losers', 'Avg. Profit/Loss', 'Avg. Profit/Loss %'],
        'Other': []
    };

    // Categorize metrics
    allMetrics.forEach(metric => {
        let categorized = false;
        for (let category in categories) {
            if (categories[category].some(cat => metric.includes(cat))) {
                if (!categories[category].includes(metric)) {
                    categories[category].push(metric);
                }
                categorized = true;
                break;
            }
        }
        if (!categorized) {
            categories['Other'].push(metric);
        }
    });

    // Build table by category
    for (let category in categories) {
        if (categories[category].length > 0) {
            tableHtml += `<tr><td colspan="${reports.length + 1}" class="section-header">${category}</td></tr>`;
            
            categories[category].forEach(metric => {
                tableHtml += `<tr><td class="metric-name">${metric}</td>`;
                
		const values = reports.map(report => {
		    const value = report.metrics[metric] || '-';
 		    const numericValue = parseFloat(String(value).replace(/[^0-9.-]/g, '')) || 0;
   		    return { value: value, numeric: numericValue };
		});

                // Find best and worst values for highlighting
                const numericValues = values.map(v => v.numeric).filter(v => !isNaN(v) && v !== 0);
                const maxValue = Math.max(...numericValues);
                const minValue = Math.min(...numericValues);

                values.forEach(v => {
                    let className = 'metric-value';
                    let extraClass = '';
                    
                    if (v.value.includes('-') && v.value !== '-') {
                        className += ' negative';
                    } else if (v.numeric > 0) {
                        className += ' positive';
                    }

                    if (numericValues.length > 1) {
                        if (metric.includes('Transaction') || metric.includes('Trades') || metric.includes('Losers')) {
                            if (v.numeric === minValue && v.numeric !== 0) extraClass = 'best-value';
                            if (v.numeric === maxValue && v.numeric !== 0) extraClass = 'worst-value';
                        } else {
                            if (v.numeric === maxValue && v.numeric !== 0) extraClass = 'best-value';
                            if (v.numeric === minValue && v.numeric !== 0) extraClass = 'worst-value';
                        }
                    }

                    let displayValue = v.value;
                    if (v.value !== '-' && !isNaN(v.numeric)) {
                        // Preserve percentage and other suffixes
                        if (v.value.includes('%')) {
                            displayValue = formatIndianNumber(v.numeric) + '%';
                        } else if (!v.value.includes('.') || v.value.split('.')[1].length <= 2) {
                            // Only format if it's not a ratio or has reasonable decimal places
                            displayValue = formatIndianNumber(v.numeric);
                        } else {
                            displayValue = v.value; // Keep original for ratios like 1.70
                        }
                    }

                    tableHtml += `<td class="${className}"><span class="${extraClass}">${displayValue}</span></td>`;
                });
                
                tableHtml += '</tr>';
            });
        }
    }

    tableHtml += '</tbody></table>';
    document.getElementById('tableContainer').innerHTML = tableHtml;
}

function createCharts() {
    const chartMetrics = [
        { name: 'Net Profit', label: 'Net Profit' },
        { name: 'Net Profit %', label: 'Net Profit %' },
        { name: 'Annual Return %', label: 'Annual Return %' },
        { name: 'Total Trades', label: 'Total Trades' },
        { name: 'Max. system drawdown', label: 'Max. System Drawdown', inverse: true },
        { name: 'Max. system % drawdown', label: 'Max. System % Drawdown', inverse: true },
        { name: 'Avg. Profit/Loss', label: 'Avg. Profit/Loss' },
        { name: 'Recovery Factor', label: 'Recovery Factor' },
        { name: 'CAR/MaxDD', label: 'CAR/MaxDD' }
    ];

    let chartsHtml = '<div class="charts-grid">';
    
    chartMetrics.forEach(metric => {
        const values = reports.map(report => {
            const value = report.metrics[metric.name] || '0';
            return parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
        });

        const maxValue = Math.max(...values.map(Math.abs));
        
        chartsHtml += `
            <div class="chart-card">
                <h4>${metric.label}</h4>
                <div class="chart-bars">
                    ${reports.map((report, index) => {
                        const value = values[index];
                        const height = maxValue > 0 ? Math.max(12, (Math.abs(value) / maxValue * 100)) : 12;
                        
                        // Determine bar color with gradients
                        const barColor = metric.inverse ? 
                           (value < 0 ? 'linear-gradient(135deg, #ffab91, #ff8a65)' : 'linear-gradient(135deg, #a5d6a7, #81c784)') :
                           (value > 0 ? 'linear-gradient(135deg, #a5d6a7, #81c784)' : 'linear-gradient(135deg, #ffab91, #ff8a65)');
                        
                        // Determine number color
                        const numberColor = metric.inverse ?
                            (value < 0 ? '#c62828' : '#2d7d32') :
                            (value > 0 ? '#2d7d32' : '#c62828');
                        
                        let chartValue;
                        if (metric.name.includes('%')) {
                            chartValue = value.toFixed(2) + '%';
                        } else if (Math.abs(value) >= 1000) {
                            chartValue = formatIndianNumber(Math.round(value));
                        } else {
                            chartValue = value.toFixed(2);
                        }
                        
                        return `
                            <div class="chart-bar-container">
                                <div class="chart-bar-value" style="color: ${numberColor};">${chartValue}</div>
                                <div class="chart-bar" style="height: ${height}px; background: ${barColor};"></div>
                                <div class="chart-bar-label">${report.name}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    });

    chartsHtml += '</div>';
    document.getElementById('chartsContainer').innerHTML = chartsHtml;
}