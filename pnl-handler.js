// pnl-handler.js - Functions for handling PnL data with cumulative chart

// Global variables for chart
let chart = null;
let hiddenStrategies = new Set();

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
        const yearMatch = cleanLine.match(/^(\d{4})(.*?)(-?\d+\.?\d*\s*K)$/);
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

// NEW: Generate cumulative PnL data for chart
function generateCumulativePnLData(strategies) {
    const allDataPoints = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    strategies.forEach(strategy => {
        const strategyData = {
            name: strategy.name,
            points: [],
            color: getStrategyColor(strategy.name)
        };
        
        let cumulativePnL = 0;
        
        // Sort years to ensure chronological order
        const sortedYears = strategy.years.sort((a, b) => parseInt(a.year) - parseInt(b.year));
        
        sortedYears.forEach(yearData => {
            months.forEach((month, monthIndex) => {
                const value = yearData.months[month];
                if (value && value !== '-') {
                    const numericValue = parseFloat(value.replace(/[K\s]/g, ''));
                    if (!isNaN(numericValue)) {
                        cumulativePnL += numericValue;
                        strategyData.points.push({
                            date: `${yearData.year}-${String(monthIndex + 1).padStart(2, '0')}`,
                            value: cumulativePnL,
                            monthlyValue: numericValue,
                            month: month,
                            year: yearData.year
                        });
                    }
                }
            });
        });
        
        if (strategyData.points.length > 0) {
            allDataPoints.push(strategyData);
        }
    });
    
    return allDataPoints;
}

// Generate distinct colors for strategies
function getStrategyColor(strategyName) {
    const colors = [
        '#4299e1', '#48bb78', '#ed8936', '#9f7aea', '#f56565',
        '#38b2ac', '#ecc94b', '#667eea', '#f093fb', '#4fd1c7'
    ];
    
    let hash = 0;
    for (let i = 0; i < strategyName.length; i++) {
        hash = strategyName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
}

// NEW: Create cumulative PnL chart
function createCumulativePnLChart(container, cumulativeData) {
    if (cumulativeData.length === 0) return;

    const chartHtml = `
        <div class="cumulative-chart-container">
            <div class="cumulative-chart-header">
                <h3 class="cumulative-chart-title">📈 Cumulative PnL Performance</h3>
                <div class="chart-controls">
                    <button class="chart-toggle active" onclick="toggleChartView('cumulative')">Cumulative</button>
                    <button class="chart-toggle" onclick="toggleChartView('monthly')">Monthly</button>
                </div>
            </div>
            <div class="chart-canvas-container">
                <canvas id="cumulativeChart" width="800" height="400"></canvas>
                <div class="chart-tooltip" id="chartTooltip"></div>
            </div>
            <div class="chart-legend" id="chartLegend"></div>
        </div>
    `;

    container.insertAdjacentHTML('afterbegin', chartHtml);
    
    drawChart(cumulativeData, 'cumulative');
    createLegend(cumulativeData);
    
    // Setup tooltip after chart is created
    setTimeout(() => {
        setupChartTooltip();
    }, 100);
}

// Draw the actual chart - FIXED to handle single month data
function drawChart(data, viewType = 'cumulative') {
    const canvas = document.getElementById('cumulativeChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Set canvas size to match display size
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    
    const width = rect.width;
    const height = rect.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    if (data.length === 0) return;
    
    // Calculate margins
    const margin = { top: 20, right: 60, bottom: 60, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    // Find all unique dates and value ranges
    const allDates = new Set();
    let minValue = Infinity;
    let maxValue = -Infinity;
    
    data.forEach(strategy => {
        if (hiddenStrategies.has(strategy.name)) return;
        
        strategy.points.forEach(point => {
            allDates.add(point.date);
            const value = viewType === 'cumulative' ? point.value : point.monthlyValue;
            minValue = Math.min(minValue, value);
            maxValue = Math.max(maxValue, value);
        });
    });
    
    const sortedDates = Array.from(allDates).sort();
    
    if (sortedDates.length === 0) return;
    
    // Add some padding to value range
    const valueRange = maxValue - minValue;
    const padding = valueRange > 0 ? valueRange * 0.1 : Math.max(Math.abs(maxValue), Math.abs(minValue)) * 0.1;
    minValue -= padding;
    maxValue += padding;
    
    // FIXED: Handle single date case
    const createXScale = () => {
        if (sortedDates.length === 1) {
            // For single point, center it in the chart
            return (dateIndex) => margin.left + chartWidth / 2;
        } else {
            // Normal scale for multiple points
            return (dateIndex) => margin.left + (dateIndex / (sortedDates.length - 1)) * chartWidth;
        }
    };
    
    const xScale = createXScale();
    const yScale = (value) => margin.top + ((maxValue - value) / (maxValue - minValue)) * chartHeight;
    
    // Draw background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid lines
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;
    
    // Vertical grid lines
    const gridLines = sortedDates.length === 1 ? 3 : 10; // Fewer grid lines for single point
    for (let i = 0; i <= gridLines; i++) {
        const x = margin.left + (i / gridLines) * chartWidth;
        ctx.beginPath();
        ctx.moveTo(x, margin.top);
        ctx.lineTo(x, height - margin.bottom);
        ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
        const y = margin.top + (i / 5) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(margin.left, y);
        ctx.lineTo(width - margin.right, y);
        ctx.stroke();
    }
    
    // Draw zero line if zero is in range
    if (minValue <= 0 && maxValue >= 0) {
        ctx.strokeStyle = '#dee2e6';
        ctx.lineWidth = 2;
        const zeroY = yScale(0);
        ctx.beginPath();
        ctx.moveTo(margin.left, zeroY);
        ctx.lineTo(width - margin.right, zeroY);
        ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = '#495057';
    ctx.lineWidth = 2;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, height - margin.bottom);
    ctx.stroke();
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, height - margin.bottom);
    ctx.lineTo(width - margin.right, height - margin.bottom);
    ctx.stroke();
    
    // Draw Y-axis labels
    ctx.fillStyle = '#495057';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i <= 5; i++) {
        const value = minValue + (i / 5) * (maxValue - minValue);
        const y = margin.top + ((5 - i) / 5) * chartHeight;
        ctx.fillText(Math.round(value) + 'K', margin.left - 10, y);
    }
    
    // Draw X-axis labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    if (sortedDates.length === 1) {
        // For single date, just show that date
        const date = sortedDates[0];
        const x = xScale(0);
        const [year, month] = date.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        ctx.fillText(monthNames[parseInt(month) - 1] + ' ' + year, x, height - margin.bottom + 5);
    } else {
        // Multiple dates - use existing logic
        const labelInterval = Math.max(1, Math.floor(sortedDates.length / 8));
        for (let i = 0; i < sortedDates.length; i += labelInterval) {
            const date = sortedDates[i];
            const x = xScale(i);
            const [year, month] = date.split('-');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            ctx.fillText(monthNames[parseInt(month) - 1] + ' ' + year, x, height - margin.bottom + 5);
        }
    }
    
    // Draw strategy data
    data.forEach(strategy => {
        if (hiddenStrategies.has(strategy.name)) return;
        
        if (strategy.points.length === 0) return;
        
        ctx.strokeStyle = strategy.color;
        ctx.fillStyle = strategy.color;
        
        if (strategy.points.length === 1) {
            // FIXED: Handle single point case - draw as a larger dot with label
            const point = strategy.points[0];
            const dateIndex = sortedDates.indexOf(point.date);
            if (dateIndex !== -1) {
                const x = xScale(dateIndex);
                const value = viewType === 'cumulative' ? point.value : point.monthlyValue;
                const y = yScale(value);
                
                // Draw larger point for single data
                ctx.beginPath();
                ctx.arc(x, y, 8, 0, 2 * Math.PI);
                ctx.fill();
                
                // Add value label above the point
                ctx.fillStyle = '#495057';
                ctx.font = 'bold 12px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(value.toFixed(1) + 'K', x, y - 12);
                
                // Reset fill style
                ctx.fillStyle = strategy.color;
            }
        } else {
            // FIXED: Multiple points - draw lines and points as before
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            ctx.beginPath();
            let firstPoint = true;
            
            strategy.points.forEach(point => {
                const dateIndex = sortedDates.indexOf(point.date);
                if (dateIndex === -1) return;
                
                const x = xScale(dateIndex);
                const value = viewType === 'cumulative' ? point.value : point.monthlyValue;
                const y = yScale(value);
                
                if (firstPoint) {
                    ctx.moveTo(x, y);
                    firstPoint = false;
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
            
            // Draw data points
            strategy.points.forEach(point => {
                const dateIndex = sortedDates.indexOf(point.date);
                if (dateIndex === -1) return;
                
                const x = xScale(dateIndex);
                const value = viewType === 'cumulative' ? point.value : point.monthlyValue;
                const y = yScale(value);
                
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fill();
            });
        }
    });
    
    // Add chart title
    ctx.fillStyle = '#212529';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const title = viewType === 'cumulative' ? 'Cumulative PnL Over Time' : 'Monthly PnL Performance';
    const subtitle = sortedDates.length === 1 ? ' (Single Month)' : '';
    ctx.fillText(title + subtitle, width / 2, 5);
    
    // Store chart data for tooltip
    canvas.chartData = {
        data: data,
        sortedDates: sortedDates,
        xScale: xScale,
        yScale: yScale,
        margin: margin,
        viewType: viewType
    };
}

// Create interactive legend
function createLegend(data) {
    const legendContainer = document.getElementById('chartLegend');
    if (!legendContainer) return;
    
    legendContainer.innerHTML = '';
    
    data.forEach(strategy => {
        const legendItem = document.createElement('div');
        legendItem.className = `legend-item ${hiddenStrategies.has(strategy.name) ? 'disabled' : ''}`;
        legendItem.onclick = () => toggleStrategy(strategy.name);
        
        legendItem.innerHTML = `
            <div class="legend-color" style="background: ${strategy.color};"></div>
            <span>${strategy.name}</span>
        `;
        
        legendContainer.appendChild(legendItem);
    });
}

// Toggle strategy visibility
function toggleStrategy(strategyName) {
    if (hiddenStrategies.has(strategyName)) {
        hiddenStrategies.delete(strategyName);
    } else {
        hiddenStrategies.add(strategyName);
    }
    
    // Update legend
    const legendItems = document.querySelectorAll('.legend-item');
    legendItems.forEach(item => {
        const name = item.querySelector('span').textContent;
        if (name === strategyName) {
            item.classList.toggle('disabled');
        }
    });
    
    // Redraw chart
    const canvas = document.getElementById('cumulativeChart');
    if (canvas && canvas.chartData) {
        drawChart(canvas.chartData.data, canvas.chartData.viewType);
    }
}

// Toggle chart view (cumulative vs monthly)
function toggleChartView(viewType) {
    const toggles = document.querySelectorAll('.chart-toggle');
    toggles.forEach(toggle => {
        toggle.classList.remove('active');
        if (toggle.textContent.toLowerCase() === viewType) {
            toggle.classList.add('active');
        }
    });
    
    const canvas = document.getElementById('cumulativeChart');
    if (canvas && canvas.chartData) {
        drawChart(canvas.chartData.data, viewType);
    }
}

// Chart tooltip functionality
function setupChartTooltip() {
    const canvas = document.getElementById('cumulativeChart');
    const tooltip = document.getElementById('chartTooltip');
    
    if (!canvas || !tooltip) return;
    
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (!canvas.chartData) return;
        
        const { data, sortedDates, xScale, yScale, margin, viewType } = canvas.chartData;
        
        // Find closest data point
        let closestPoint = null;
        let closestDistance = Infinity;
        let closestStrategy = null;
        
        data.forEach(strategy => {
            if (hiddenStrategies.has(strategy.name)) return;
            
            strategy.points.forEach(point => {
                const dateIndex = sortedDates.indexOf(point.date);
                if (dateIndex === -1) return;
                
                const pointX = xScale(dateIndex);
                const value = viewType === 'cumulative' ? point.value : point.monthlyValue;
                const pointY = yScale(value);
                
                const distance = Math.sqrt((x - pointX) ** 2 + (y - pointY) ** 2);
                
                if (distance < closestDistance && distance < 20) {
                    closestDistance = distance;
                    closestPoint = point;
                    closestStrategy = strategy;
                }
            });
        });
        
        if (closestPoint && closestStrategy) {
            const value = viewType === 'cumulative' ? closestPoint.value : closestPoint.monthlyValue;
            tooltip.innerHTML = `
                <strong>${closestStrategy.name}</strong><br>
                ${closestPoint.month} ${closestPoint.year}<br>
                ${viewType === 'cumulative' ? 'Cumulative' : 'Monthly'}: ${value.toFixed(1)}K
            `;
            tooltip.style.display = 'block';
            tooltip.style.left = (e.clientX + 10) + 'px';
            tooltip.style.top = (e.clientY - 10) + 'px';
        } else {
            tooltip.style.display = 'none';
        }
    });
    
    canvas.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
    });
}

function createPnLView() {
    const container = document.getElementById('pnlContainer');
    
    // Filter reports that have PnL data
    const pnlReports = reports.filter(report => report.pnlData && report.pnlData.trim());
    
    console.log('Reports with PnL data:', pnlReports.length);
    
    if (pnlReports.length === 0) {
        container.innerHTML = `
            <div class="pnl-empty-state">
                <h3>No PnL Data Available</h3>
                <p>Add PnL data to your reports to see monthly performance analysis here.</p>
                <p style="font-size: 0.9em; margin-top: 10px;">PnL data format example:</p>
                <pre style="background: #f7fafc; padding: 10px; border-radius: 8px; margin-top: 10px; text-align: left;">
**2024**22.9 K 87.8 K 148.6 K ... **765.4 K
**2025**107.4 K 22.0 K 84.7 K ... **514.9 K
**Avg**32.9 K 31.1 K 65.9 K ...</pre>
            </div>
        `;
        return;
    }

    // Parse strategies and create cumulative data
    const strategies = pnlReports.map(report => parsePnLData(report.pnlData, report.name)).filter(s => s);
    const cumulativeData = generateCumulativePnLData(strategies);
    
    // Create main container
    container.innerHTML = '<div class="pnl-strategies-container"></div>';
    
    // Create cumulative chart at the top
    createCumulativePnLChart(container, cumulativeData);
    
    // Add individual strategy tables below the chart
    const strategiesContainer = container.querySelector('.pnl-strategies-container');
    
    let html = '';
    strategies.forEach((strategy, index) => {
        if (strategy && strategy.years.length > 0) {
            html += createPnLStrategyHTML(strategy, index, strategies.length);
        }
    });
    
    strategiesContainer.innerHTML = html;
}

function getIntensityColor(value, maxValue, isPositive) {
    if (maxValue === 0) return isPositive ? '#e8f5e8' : '#ffe8e8';
    
    const intensity = Math.min(value / maxValue, 1);
    
    if (isPositive) {
        // Green gradient from light to dark
        const lightness = 95 - (intensity * 50); // 95% to 45%
        return `hsl(120, 60%, ${lightness}%)`;
    } else {
        // Red gradient from light to dark  
        const lightness = 95 - (intensity * 50); // 95% to 45%
        return `hsl(0, 60%, ${lightness}%)`;
    }
}

function createPnLStrategyHTML(strategy, index, totalStrategies) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Calculate strategy metrics
    const metrics = calculatePnLStrategyMetrics(strategy);
    
    // Find max positive and negative counts for color intensity calculation
    const positiveCounts = strategy.years.map(y => y.positiveCount);
    const negativeCounts = strategy.years.map(y => y.negativeCount);
    const maxPositive = Math.max(...positiveCounts);
    const maxNegative = Math.max(...negativeCounts);

    const isFirst = index === 0;
    const isLast = index === totalStrategies - 1;

    let html = `
        <div class="pnl-strategy-container">
            <div class="pnl-strategy-header">
                <div class="pnl-strategy-title-section">
                    <span class="pnl-strategy-position">#${index + 1}</span>
                    <h2 class="pnl-strategy-title">${strategy.name}</h2>
                </div>
                <div class="pnl-strategy-controls">
                    <button class="btn-move" onclick="movePnLStrategyUp(${index})" ${isFirst ? 'disabled' : ''} title="Move Up">
                        ↑
                    </button>
                    <button class="btn-move" onclick="movePnLStrategyDown(${index})" ${isLast ? 'disabled' : ''} title="Move Down">
                        ↓
                    </button>
                    <button class="btn-remove" onclick="removePnLStrategy(${index})" title="Remove entire strategy">Remove</button>
                </div>
            </div>
            <div class="pnl-main-content">
                <div class="pnl-table-wrapper">
                    <table class="pnl-table">
                        <thead>
                            <tr>
                                <th>Year</th>
                                ${months.map(month => `<th>${month}</th>`).join('')}
                                <th>Year Total</th>
                                <th>Year Avg</th>
                                <th>+ve</th>
                                <th>-ve</th>
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
        
        // Year total with dynamic color
        const yearTotalValue = parseFloat(yearData.total.replace(/[K\s]/g, ''));
        const yearTotalClass = yearTotalValue >= 0 ? 'pnl-yearly-total positive' : 'pnl-yearly-total negative';
        html += `<td class="${yearTotalClass}">${yearData.total}</td>`;
        
        html += `<td class="pnl-yearly-avg">${yearData.yearlyAvg}</td>`;
        
        // Positive count with dynamic color intensity
        const positiveColor = getIntensityColor(yearData.positiveCount, maxPositive, true);
        html += `<td class="pnl-positive-count" style="background-color: ${positiveColor};">${yearData.positiveCount}</td>`;
        
        // Negative count with dynamic color intensity
        const negativeColor = getIntensityColor(yearData.negativeCount, maxNegative, false);
        html += `<td class="pnl-negative-count" style="background-color: ${negativeColor};">${yearData.negativeCount}</td>`;
        
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
            avgYearly: 'N/A',
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