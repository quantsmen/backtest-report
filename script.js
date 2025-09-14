let reports = [];
let currentView = 'table';

// Add this new function before parseReport()
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

function parseReport(text, name) {
    const report = {
        name: name || `Report ${reports.length + 1}`,
        metrics: {}
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

function addReport() {
    const name = document.getElementById('reportName').value.trim();
    const data = document.getElementById('reportData').value.trim();

    if (!data) {
        alert('Please paste the backtest report data');
        return;
    }

    const report = parseReport(data, name);
    reports.push(report);

    document.getElementById('reportName').value = '';
    document.getElementById('reportData').value = '';

    updateComparison();
    updateReportList();
}

function removeReport(index) {
    reports.splice(index, 1);
    updateComparison();
    updateReportList();
}

function clearAll() {
    if (reports.length > 0 && confirm('Are you sure you want to clear all reports?')) {
        reports = [];
        document.getElementById('comparisonSection').classList.remove('active');
        document.getElementById('emptyState').style.display = 'flex';
        updateReportList();
    }
}

function updateReportList() {
    const reportCount = document.getElementById('reportCount');
    reportCount.textContent = reports.length;

    if (reports.length === 0) {
        document.getElementById('reportList').innerHTML = '<div class="no-reports-message">No reports added yet</div>';
        return;
    }

    const listHtml = reports.map((report, index) => `
        <div class="report-item">
            <span>${report.name}</span>
            <span class="delete-btn" onclick="removeReport(${index})" title="Remove this report">×</span>
        </div>
    `).join('');
    document.getElementById('reportList').innerHTML = listHtml;
}

function updateComparison() {
    if (reports.length === 0) {
        document.getElementById('comparisonSection').classList.remove('active');
        document.getElementById('emptyState').style.display = 'flex';
        return;
    }

    document.getElementById('comparisonSection').classList.add('active');
    document.getElementById('emptyState').style.display = 'none';
    
    createComparisonTable();
    createCharts();
    showView(currentView);
}

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
                    return { value, numeric: parseFloat(value.replace(/[^0-9.-]/g, '')) || 0 };
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
                        if (metric.includes('drawdown') || metric.includes('Loss') || metric.includes('Ulcer')) {
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
                           (value < 0 ? 'linear-gradient(135deg, #a5d6a7, #81c784)' : 'linear-gradient(135deg, #ffab91, #ff8a65)') :
                           (value > 0 ? 'linear-gradient(135deg, #a5d6a7, #81c784)' : 'linear-gradient(135deg, #ffab91, #ff8a65)');
                        
                        // Determine number color
                        const numberColor = metric.inverse ?
                            (value < 0 ? '#2d7d32' : '#c62828') :
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

function showView(viewType) {
    currentView = viewType;
    
    // Update tab states
    const tabs = document.querySelectorAll('.view-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    if (viewType === 'table') {
        tabs[0].classList.add('active');
        document.getElementById('tableContainer').style.display = 'block';
        document.getElementById('chartsContainer').classList.remove('active');
    } else if (viewType === 'charts') {
        tabs[1].classList.add('active');
        document.getElementById('tableContainer').style.display = 'none';
        document.getElementById('chartsContainer').classList.add('active');
    }
}

// Initialize the report list
window.addEventListener('load', () => {
    updateReportList();
    
    const sampleData = `**Statistics** | Charts | Trades | Formula | Settings | Symbols | Monte Carlo
**Statistics**
 **All tradesLong tradesShort trades**Initial capital400000.00400000.00400000.00Ending capital33985662.95400000.0033985662.95Net Profit33585662.950.0033585662.95Net Profit %8396.42%0.00%8396.42%Exposure %0.41%0.00%0.41%Net Risk Adjusted Return %2065833.88%-nan(ind)%2065833.88%Annual Return %30.68%0.00%30.68%Risk Adjusted Return %7549.17%-nan(ind)%7549.17%Transaction costs6795791.720.006795791.72
**All trades**134590 (0.00 %)13459 (100.00 %) Avg. Profit/Loss2495.41-nan(ind)2495.41 Avg. Profit/Loss %0.59%-nan(ind)0.59% Avg. Bars Held30.83-nan(ind)30.83
**Winners**7176 (53.32 %)0 (0.00 %)7176 (53.32 %) Total Profit81898959.440.0081898959.44 Avg. Profit11412.90-nan(ind)11412.90 Avg. Profit %2.69%-nan(ind)2.69% Avg. Bars Held42.20-nan(ind)42.20 Max. Consecutive14014 Largest win132797.370.00132797.37 # bars in largest win42042
**Losers**6283 (46.68 %)0 (0.00 %)6283 (46.68 %) Total Loss-48313296.480.00-48313296.48 Avg. Loss-7689.53-nan(ind)-7689.53 Avg. Loss %-1.82%-nan(ind)%-1.82% Avg. Bars Held17.84-nan(ind)17.84 Max. Consecutive14014 Largest loss-49638.740.00-49638.74# bars in largest loss202
Max. trade drawdown-59293.300.00-59293.30Max. trade % drawdown-12.260.00-12.26Max. system drawdown-218007.860.00-218007.86Max. system % drawdown-8.13%0.00%-8.13%Recovery Factor154.06-nan(ind)154.06CAR/MaxDD3.77-nan(ind)3.77RAR/MaxDD928.74-nan(ind)928.74Profit Factor1.70nan1.70Payoff Ratio1.48nan1.48Standard Error1188256.350.001188256.35Risk-Reward Ratio1.68-nan(ind)1.68Ulcer Index0.440.000.44Ulcer Performance Index57.69-inf57.69Sharpe Ratio of trades4.290.004.29K-Ratio0.02-nan(ind)0.02`;

    const samplePnLData = `**2020**22.9 K87.8 K148.6 K82.2 K90.6 K89.0 K30.5 K144.6 K7.2 K25.5 K27.2 K9.2 K**765.4 K
**2021**107.4 K22.0 K84.7 K74.2 K53.2 K27.8 K31.1 K39.8 K-14.8 K57.2 K40.1 K-7.8 K**514.9 K
**2022**26.5 K8.4 K47.0 K16.4 K131.3 K92.4 K36.9 K-11.2 K31.0 K46.0 K15.8 K40.0 K**480.7 K
**2023**26.9 K12.2 K6.9 K28.3 K62.9 K3.1 K12.7 K55.0 K83.4 K67.3 K37.8 K53.3 K**449.7 K
**2024**-19.1 K25.3 K42.7 K38.1 K55.2 K67.8 K---------**210.0 K
**Avg**32.9 K31.1 K65.9 K47.8 K78.6 K56.0 K27.8 K57.0 K26.7 K49.0 K30.2 K23.9 K**`;

    document.getElementById('reportData').value = sampleData;
    document.getElementById('reportName').value = 'Sample Strategy';
    document.getElementById('pnlData').value = samplePnLData;
});

// PnL Data Functions
function parsePnLData(data, name) {
    if (!data || !data.trim()) return null;
    
    const lines = data.split('\n').filter(line => line.trim());
    const strategy = {
        name: name || `Strategy ${reports.length + 1}`,
        years: [],
        totals: {},
        averages: {}
    };

    lines.forEach(line => {
        // Remove asterisks and normalize
        const cleanLine = line.replace(/\*/g, '').trim();
        
        // Match year pattern
        const yearMatch = cleanLine.match(/^(\d{4})(.*?)(\d+\.?\d*\s*K)$/);
        if (yearMatch) {
            const year = yearMatch[1];
            const monthsData = yearMatch[2];
            const yearTotal = yearMatch[3];
            
            // Extract monthly values
            const monthValues = monthsData.match(/-?\d+\.?\d*\s*K/g) || [];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            const yearData = { year, months: {}, total: yearTotal };
            let validValues = [];
            let positiveCount = 0;
            let negativeCount = 0;
            
            monthValues.forEach((value, index) => {
                if (months[index]) {
                    yearData.months[months[index]] = value.trim();
                    
                    // Calculate statistics
                    const numericValue = parseFloat(value.replace(/[K\s]/g, ''));
                    if (!isNaN(numericValue)) {
                        validValues.push(numericValue);
                        if (numericValue >= 0) {
                            positiveCount++;
                        } else {
                            negativeCount++;
                        }
                    }
                }
            });
            
            // Calculate yearly average
            const yearlyAvg = validValues.length > 0 ? 
                (validValues.reduce((sum, val) => sum + val, 0) / validValues.length).toFixed(1) + ' K' : 
                '-';
            
            yearData.yearlyAvg = yearlyAvg;
            yearData.positiveCount = positiveCount;
            yearData.negativeCount = negativeCount;
            
            strategy.years.push(yearData);
        }
        
        // Match average pattern
        if (cleanLine.startsWith('Avg')) {
            const avgValues = cleanLine.match(/-?\d+\.?\d*\s*K/g) || [];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            avgValues.forEach((value, index) => {
                if (months[index]) {
                    strategy.averages[months[index]] = value.trim();
                }
            });
        }
    });

    return strategy;
}

function createPnLView() {
    const container = document.getElementById('pnlContainer');
    
    // Filter reports that have PnL data
    const pnlReports = reports.filter(report => report.pnlData && report.pnlData.trim());
    
    // Debug: Check what reports we have and their PnL data
    console.log('All reports:', reports);
    console.log('Reports with PnL data:', pnlReports);
    
    if (pnlReports.length === 0) {
        container.innerHTML = `
            <div class="pnl-empty-state">
                <h3>No PnL Data Available</h3>
                <p>Add PnL data to your reports to see monthly performance analysis here.</p>
                <p>PnL data should be in format: **2024**Jan_ValueFeb_Value...Dec_Value**Total_Value</p>
            </div>
        `;
        return;
    }

    let html = '<div class="pnl-strategies-container">';
    
    pnlReports.forEach((report, index) => {
        const strategy = parsePnLData(report.pnlData, report.name);
        console.log('Parsed strategy:', strategy); // Debug
        if (strategy && strategy.years.length > 0) {
            html += createPnLStrategyHTML(strategy, index, pnlReports.length);
        }
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function createPnLStrategyHTML(strategy, index, totalStrategies) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const isFirst = index === 0;
    const isLast = index === totalStrategies - 1;
    
    // Calculate strategy metrics
    const metrics = calculatePnLStrategyMetrics(strategy);

    let html = `
        <div class="pnl-strategy-container">
            <div class="pnl-strategy-header">
                <div class="pnl-strategy-title-section">
                    <span class="pnl-strategy-position">#${index + 1}</span>
                    <h2 class="pnl-strategy-title">${strategy.name}</h2>
                </div>
                <div class="pnl-strategy-controls">
                    <button class="pnl-btn-move" onclick="movePnLStrategyUp(${index})" ${isFirst ? 'disabled' : ''} title="Move Up">
                        ↑
                    </button>
                    <button class="pnl-btn-move" onclick="movePnLStrategyDown(${index})" ${isLast ? 'disabled' : ''} title="Move Down">
                        ↓
                    </button>
                    <button class="pnl-btn-remove" onclick="removePnLStrategy(${index})">Remove</button>
                </div>
            </div>
            <div class="pnl-main-content">
                <div class="pnl-table-container">
                    <table class="pnl-table">
                        <thead>
                            <tr>
                                <th>Year</th>
                                ${months.map(month => `<th>${month}</th>`).join('')}
                                <th>Year Total</th>
                                <th>Year Avg</th>
                                <th>+ve Months</th>
                                <th>-ve Months</th>
                            </tr>
                        </thead>
                        <tbody>
    `;

    // Add data rows
    strategy.years.forEach(yearData => {
        html += `<tr>`;
        html += `<td class="pnl-year-col">${yearData.year}</td>`;
        
        months.forEach(month => {
            const value = yearData.months[month] || '-';
            const className = getPnLValueClass(value);
            html += `<td class="${className}">${value}</td>`;
        });
        
        html += `<td class="pnl-yearly-total">${yearData.total}</td>`;
        html += `<td class="pnl-yearly-avg">${yearData.yearlyAvg}</td>`;
        html += `<td style="background-color: #90EE90; color: #2d3748; font-weight: 700; text-align: center;">${yearData.positiveCount}</td>`;
        html += `<td style="background-color: #FFB6C1; color: #2d3748; font-weight: 700; text-align: center;">${yearData.negativeCount}</td>`;
        html += `</tr>`;
    });

    // Add averages row
    if (Object.keys(strategy.averages).length > 0) {
        html += `<tr class="pnl-average-row">`;
        html += `<td class="pnl-year-col">Avg</td>`;
        months.forEach(month => {
            const value = strategy.averages[month] || '-';
            html += `<td>${value}</td>`;
        });
        html += `<td>-</td>`;
        html += `<td>-</td>`;
        html += `<td>-</td>`;
        html += `<td>-</td>`;
        html += `</tr>`;
    }

    html += `</tbody></table>
                </div>
                
                <div class="pnl-metrics-panel">
                    <h3 class="pnl-metrics-title">📈 Key Metrics</h3>
                    <div class="pnl-metrics-grid">
                        <div class="pnl-metric-item">
                            <span class="pnl-metric-label">Total PnL:</span>
                            <span class="pnl-metric-value ${getPnLMetricClass(metrics.totalPnL)}">${metrics.totalPnL}</span>
                        </div>
                        <div class="pnl-metric-item">
                            <span class="pnl-metric-label">Avg Monthly:</span>
                            <span class="pnl-metric-value ${getPnLMetricClass(metrics.avgMonthly)}">${metrics.avgMonthly}</span>
                        </div>
                        <div class="pnl-metric-item">
                            <span class="pnl-metric-label">Avg Yearly:</span>
                            <span class="pnl-metric-value ${getPnLMetricClass(metrics.avgYearly)}">${metrics.avgYearly}</span>
                        </div>
                        <div class="pnl-metric-item">
                            <span class="pnl-metric-label">Win Rate:</span>
                            <span class="pnl-metric-value">${metrics.winRate}</span>
                        </div>
                        <div class="pnl-metric-item">
                            <span class="pnl-metric-label">Best Month:</span>
                            <span class="pnl-metric-value pnl-positive">${metrics.bestMonth}</span>
                        </div>
                        <div class="pnl-metric-item">
                            <span class="pnl-metric-label">Worst Month:</span>
                            <span class="pnl-metric-value pnl-negative">${metrics.worstMonth}</span>
                        </div>
                        <div class="pnl-metric-item">
                            <span class="pnl-metric-label">Best Year:</span>
                            <span class="pnl-metric-value pnl-positive">${metrics.bestYear}</span>
                        </div>
                        <div class="pnl-metric-item">
                            <span class="pnl-metric-label">Worst Year:</span>
                            <span class="pnl-metric-value pnl-negative">${metrics.worstYear}</span>
                        </div>
                        <div class="pnl-metric-item">
                            <span class="pnl-metric-label">Volatility:</span>
                            <span class="pnl-metric-value">${metrics.volatility}</span>
                        </div>
                        <div class="pnl-metric-item">
                            <span class="pnl-metric-label">Total Months:</span>
                            <span class="pnl-metric-value">${metrics.totalMonths}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    return html;
}

function calculatePnLStrategyMetrics(strategy) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    let allMonthlyValues = [];
    let yearlyTotals = [];
    let totalPositiveMonths = 0;
    let totalNegativeMonths = 0;
    let totalMonths = 0;
    
    // Extract all monthly values and yearly totals
    strategy.years.forEach(yearData => {
        months.forEach(month => {
            const value = yearData.months[month];
            if (value && value !== '-') {
                const numericValue = parseFloat(value.replace(/[K\s]/g, ''));
                if (!isNaN(numericValue)) {
                    allMonthlyValues.push(numericValue);
                    totalMonths++;
                    if (numericValue >= 0) totalPositiveMonths++;
                    else totalNegativeMonths++;
                }
            }
        });
        
        // Extract yearly total
        if (yearData.total && yearData.total !== '-') {
            const yearTotal = parseFloat(yearData.total.replace(/[K\s]/g, ''));
            if (!isNaN(yearTotal)) {
                yearlyTotals.push(yearTotal);
            }
        }
    });
    
    if (allMonthlyValues.length === 0) {
        return {
            totalPnL: 'N/A',
            avgMonthly: 'N/A',
            winRate: 'N/A',
            bestMonth: 'N/A',
            worstMonth: 'N/A',
            volatility: 'N/A',
            bestYear: 'N/A',
            worstYear: 'N/A',
            totalMonths: 0
        };
    }
    
    // Calculate metrics
    const totalPnL = yearlyTotals.reduce((sum, val) => sum + val, 0);
    const avgMonthly = allMonthlyValues.reduce((sum, val) => sum + val, 0) / allMonthlyValues.length;
    const winRate = (totalPositiveMonths / totalMonths) * 100;
    const bestMonth = Math.max(...allMonthlyValues);
    const worstMonth = Math.min(...allMonthlyValues);
    
    // Calculate volatility (standard deviation)
    const variance = allMonthlyValues.reduce((sum, val) => sum + Math.pow(val - avgMonthly, 2), 0) / allMonthlyValues.length;
    const volatility = Math.sqrt(variance);
    
    const bestYear = yearlyTotals.length > 0 ? Math.max(...yearlyTotals) : 0;
    const worstYear = yearlyTotals.length > 0 ? Math.min(...yearlyTotals) : 0;
    
    return {
        totalPnL: totalPnL.toFixed(1) + ' K',
        avgMonthly: avgMonthly.toFixed(1) + ' K',
        winRate: winRate.toFixed(1) + '%',
        bestMonth: bestMonth.toFixed(1) + ' K',
        worstMonth: worstMonth.toFixed(1) + ' K',
        volatility: volatility.toFixed(1) + ' K',
        bestYear: bestYear.toFixed(1) + ' K',
        worstYear: worstYear.toFixed(1) + ' K',
        totalMonths: totalMonths,
        avgYearly: yearlyTotals.length > 0 ? (totalPnL / yearlyTotals.length).toFixed(1) + ' K' : 'N/A'
    };
}

function getPnLValueClass(value) {
    if (value === '-' || !value) return '';
    if (value.includes('-')) return 'pnl-negative';
    return 'pnl-positive';
}

function getPnLMetricClass(value) {
    if (value === 'N/A' || !value) return '';
    if (value.includes('-')) return 'pnl-negative';
    return 'pnl-positive';
}

function movePnLStrategyUp(index) {
    // This function would handle moving PnL strategies, but since they're tied to reports,
    // we'll just rebuild the view for now
    createPnLView();
}

function movePnLStrategyDown(index) {
    // This function would handle moving PnL strategies, but since they're tied to reports,
    // we'll just rebuild the view for now
    createPnLView();
}

function removePnLStrategy(index) {
    // Filter reports that have PnL data and remove the one at the specified index
    const pnlReports = reports.filter(report => report.pnlData && report.pnlData.trim());
    
    if (pnlReports[index] && confirm(`Remove PnL data for ${pnlReports[index].name}?`)) {
        // Find the report in the main reports array and clear its PnL data
        const reportToUpdate = reports.find(r => r.name === pnlReports[index].name);
        if (reportToUpdate) {
            reportToUpdate.pnlData = '';
        }
        updateComparison();
    }
}