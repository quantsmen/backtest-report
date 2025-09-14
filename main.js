// main.js - Main application logic with Enhanced Print All Views functionality and NEW tabs support

let reports = [];
let currentView = 'table';

// Add new report with both backtest and PnL data
function addReport() {
    const name = document.getElementById('reportName').value.trim();
    const data = document.getElementById('reportData').value.trim();
    const pnlData = document.getElementById('pnlData').value.trim(); // Get PnL data

    if (!data) {
        showNotification('Please paste the backtest report data', 'error');
        return;
    }

    // Parse the report
    const report = parseReport(data, name);
    
    // Add PnL data to the report
    report.pnlData = pnlData; // Store PnL data with the report
    
    // Initialize additional data fields for new tabs
    report.formulaData = '';
    report.settingsData = '';
    report.symbolsData = [];
    
    reports.push(report);

    // Clear input fields
    document.getElementById('reportName').value = '';
    document.getElementById('reportData').value = '';
    document.getElementById('pnlData').value = '';

    // Update display
    updateComparison();
    updateReportList();
    
    console.log('Report added with PnL data:', report.name, 'Has PnL:', !!report.pnlData);
    showNotification(`Added strategy: ${report.name}`, 'success');
}

// Remove a report from main list
function removeReport(index) {
    const reportName = reports[index].name;
    reports.splice(index, 1);
    updateComparison();
    updateReportList();
    
    // If no reports left, show empty state
    if (reports.length === 0) {
        document.getElementById('comparisonSection').classList.remove('active');
        document.getElementById('emptyState').style.display = 'flex';
    }
    
    showNotification(`Removed strategy: ${reportName}`, 'success');
}

// Clear all reports
function clearAll() {
    if (reports.length > 0 && confirm('Are you sure you want to clear all reports?')) {
        const count = reports.length;
        reports = [];
        document.getElementById('comparisonSection').classList.remove('active');
        document.getElementById('emptyState').style.display = 'flex';
        updateReportList();
        showNotification(`Cleared ${count} strategies`, 'success');
    }
}

// Update the report list display
function updateReportList() {
    const reportCount = document.getElementById('reportCount');
    reportCount.textContent = reports.length;

    if (reports.length === 0) {
        document.getElementById('reportList').innerHTML = '<div class="no-reports-message">No reports added yet</div>';
        return;
    }

    const listHtml = reports.map((report, index) => {
        const hasPnL = report.pnlData && report.pnlData.trim();
        const hasFormula = report.formulaData && report.formulaData.trim();
        const hasSettings = report.settingsData;
        const hasSymbols = report.symbolsData && report.symbolsData.length > 0;
        
        let indicators = '';
        if (hasPnL) indicators += '📈';
        if (hasFormula) indicators += '📄';
        if (hasSettings) indicators += '⚙️';
        if (hasSymbols) indicators += '🏷️';
        
        return `
            <div class="report-item">
                <span>${report.name} ${indicators}</span>
                <span class="delete-btn" onclick="removeReport(${index})" title="Remove this report">×</span>
            </div>
        `;
    }).join('');
    document.getElementById('reportList').innerHTML = listHtml;
}

// Update comparison displays
function updateComparison() {
    if (reports.length === 0) {
        document.getElementById('comparisonSection').classList.remove('active');
        document.getElementById('emptyState').style.display = 'flex';
        return;
    }

    document.getElementById('comparisonSection').classList.add('active');
    document.getElementById('emptyState').style.display = 'none';
    
    // Create displays based on current view
    if (currentView === 'table') {
        createComparisonTable();
    } else if (currentView === 'charts') {
        createCharts();
    } else if (currentView === 'pnl') {
        createPnLView();
    } else if (currentView === 'symbols') {
        createSymbolsView();
    } else if (currentView === 'formula') {
        createFormulaView();
    } else if (currentView === 'settings') {
        createSettingsView();
    }
    
    showView(currentView);
    autoSave(); // Auto-save after updates
}

// Show specific view - ENHANCED to support new tabs
function showView(viewType) {
    currentView = viewType;
    
    // Update tab states
    const tabs = document.querySelectorAll('.view-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Hide all containers
    document.getElementById('tableContainer').style.display = 'none';
    document.getElementById('chartsContainer').classList.remove('active');
    document.getElementById('pnlContainer').classList.remove('active');
    document.getElementById('symbolsContainer').classList.remove('active');
    document.getElementById('formulaContainer').classList.remove('active');
    document.getElementById('settingsContainer').classList.remove('active');
    
    if (viewType === 'table') {
        tabs[0].classList.add('active');
        document.getElementById('tableContainer').style.display = 'block';
        createComparisonTable();
    } else if (viewType === 'charts') {
        tabs[1].classList.add('active');
        document.getElementById('chartsContainer').classList.add('active');
        createCharts();
    } else if (viewType === 'pnl') {
        tabs[2].classList.add('active');
        document.getElementById('pnlContainer').classList.add('active');
        createPnLView();
    } else if (viewType === 'symbols') {
        tabs[3].classList.add('active');
        document.getElementById('symbolsContainer').classList.add('active');
        createSymbolsView();
    } else if (viewType === 'formula') {
        tabs[4].classList.add('active');
        document.getElementById('formulaContainer').classList.add('active');
        createFormulaView();
    } else if (viewType === 'settings') {
        tabs[5].classList.add('active');
        document.getElementById('settingsContainer').classList.add('active');
        createSettingsView();
    }
    
    autoSave(); // Auto-save view changes
}

// NEW: Create symbols view
function createSymbolsView() {
    const container = document.getElementById('symbolsContainer');
    
    // Filter reports that have symbols data
    const symbolReports = reports.filter(report => report.symbolsData && report.symbolsData.length > 0);
    
    if (symbolReports.length === 0) {
        container.innerHTML = `
            <div class="empty-data-state">
                <h3>No Symbols Data Available</h3>
                <p>Load Amibroker reports with symbols.html files to see trading symbols here.</p>
            </div>
        `;
        return;
    }

    let html = '';
    
    symbolReports.forEach(report => {
        html += `
            <div class="data-view-card">
                <div class="data-view-header">
                    <h3 class="data-view-title">🏷️ ${report.name} - Trading Symbols</h3>
                    <span class="data-badge">${report.symbolsData.length} symbols</span>
                </div>
                <div class="symbols-grid">
                    ${report.symbolsData.map(symbol => 
                        `<div class="symbol-item">${symbol}</div>`
                    ).join('')}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// NEW: Create formula view
function createFormulaView() {
    const container = document.getElementById('formulaContainer');
    
    // Filter reports that have formula data
    const formulaReports = reports.filter(report => report.formulaData && report.formulaData.trim());
    
    if (formulaReports.length === 0) {
        container.innerHTML = `
            <div class="empty-data-state">
                <h3>No Formula Data Available</h3>
                <p>Load Amibroker reports with formula.html files to see AFL code here.</p>
            </div>
        `;
        return;
    }

    let html = '';
    
    formulaReports.forEach(report => {
        html += `
            <div class="data-view-card">
                <div class="data-view-header">
                    <h3 class="data-view-title">📄 ${report.name} - AFL Formula Code</h3>
                    <span class="data-badge">Formula</span>
                </div>
                <div class="formula-content">${report.formulaData}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ENHANCED: Create settings view with FIXED scroll issue
function createSettingsView() {
    const container = document.getElementById('settingsContainer');
    
    // Get all reports and check their settings data
    console.log('Total reports:', reports.length);
    reports.forEach((report, index) => {
        console.log(`Report ${index + 1}: ${report.name}`, {
            hasSettings: !!report.settingsData,
            settingsType: typeof report.settingsData,
            settingsKeys: report.settingsData ? Object.keys(report.settingsData) : 'none'
        });
    });
    
    // Filter reports that have settings data
    const settingsReports = reports.filter(report => report.settingsData);
    
    if (settingsReports.length === 0) {
        container.innerHTML = `
            <div class="empty-data-state">
                <h3>No Settings Data Available</h3>
                <p>Load Amibroker reports with settings.html files to see backtest settings here.</p>
                <p><strong>Debug Info:</strong> Found ${reports.length} total reports, but none have settings data.</p>
            </div>
        `;
        return;
    }

    // Enhanced table for both single and multiple strategies
    const allBasicSettings = new Set();
    const allParameters = new Set();
    
    // Collect all unique settings from all strategies
    settingsReports.forEach(report => {
        if (report.settingsData.basic) {
            Object.keys(report.settingsData.basic).forEach(key => allBasicSettings.add(key));
        }
        if (report.settingsData.parameters) {
            Object.keys(report.settingsData.parameters).forEach(key => allParameters.add(key));
        }
    });

    const totalSettings = allBasicSettings.size + allParameters.size;
    const isMultipleStrategies = settingsReports.length > 1;

    let html = `
        <div class="data-view-card">
            <div class="data-view-header">
                <h3 class="data-view-title">⚙️ ${isMultipleStrategies ? 'Settings Comparison' : 'Strategy Settings'}</h3>
                <span class="data-badge">${settingsReports.length} strateg${settingsReports.length === 1 ? 'y' : 'ies'} • ${totalSettings} settings</span>
            </div>
            
            <div class="settings-table-container">
                <table class="settings-comparison-table">
                    <thead>
                        <tr>
                            <th style="min-width: 250px; max-width: 300px;">Setting Name</th>
                            ${settingsReports.map(report => 
                                `<th style="min-width: 120px;">${report.name}</th>`
                            ).join('')}
                        </tr>
                    </thead>
                    <tbody>
    `;

    // Add Basic Settings section
    if (allBasicSettings.size > 0) {
        html += `
            <tr class="settings-section-divider">
                <td colspan="${settingsReports.length + 1}">
                    📊 Basic Settings (${allBasicSettings.size} items)
                </td>
            </tr>
        `;
        
        // Sort settings alphabetically for better organization
        Array.from(allBasicSettings).sort().forEach(setting => {
            html += `<tr>`;
            html += `<td class="settings-metric-name">${setting}</td>`;
            
            settingsReports.forEach(report => {
                const value = report.settingsData.basic && report.settingsData.basic[setting] 
                    ? report.settingsData.basic[setting] 
                    : '-';
                
                // Apply different styling based on value type
                let cellClass = 'settings-metric-value';
                if (value !== '-') {
                    if (value.toLowerCase().includes('true') || value.toLowerCase().includes('yes')) {
                        cellClass += ' positive-value';
                    } else if (value.toLowerCase().includes('false') || value.toLowerCase().includes('no')) {
                        cellClass += ' negative-value';
                    } else if (!isNaN(parseFloat(value))) {
                        cellClass += ' numeric-value';
                    }
                }
                
                html += `<td class="${cellClass}">${value}</td>`;
            });
            
            html += `</tr>`;
        });
    }

    // Add Parameters section
    if (allParameters.size > 0) {
        html += `
            <tr class="settings-section-divider">
                <td colspan="${settingsReports.length + 1}">
                    🔧 Parameters (${allParameters.size} items)
                </td>
            </tr>
        `;
        
        // Sort parameters alphabetically
        Array.from(allParameters).sort().forEach(param => {
            html += `<tr>`;
            html += `<td class="settings-metric-name">${param}</td>`;
            
            settingsReports.forEach(report => {
                const value = report.settingsData.parameters && report.settingsData.parameters[param] 
                    ? report.settingsData.parameters[param] 
                    : '-';
                
                // Apply styling for parameter values
                let cellClass = 'settings-metric-value';
                if (value !== '-') {
                    if (!isNaN(parseFloat(value))) {
                        cellClass += ' numeric-value';
                    } else if (value.toLowerCase().includes('true') || value.toLowerCase().includes('yes')) {
                        cellClass += ' positive-value';
                    } else if (value.toLowerCase().includes('false') || value.toLowerCase().includes('no')) {
                        cellClass += ' negative-value';
                    }
                }
                
                html += `<td class="${cellClass}">${value}</td>`;
            });
            
            html += `</tr>`;
        });
    }

    // Add summary row if multiple strategies
    if (isMultipleStrategies) {
        html += `
            <tr style="background: #f1f5f9; border-top: 2px solid #cbd5e0;">
                <td style="font-weight: 700; color: #2d3748; padding: 8px;">
                    📋 Summary
                </td>
                ${settingsReports.map(report => {
                    const basicCount = report.settingsData.basic ? Object.keys(report.settingsData.basic).length : 0;
                    const paramCount = report.settingsData.parameters ? Object.keys(report.settingsData.parameters).length : 0;
                    return `
                        <td style="text-align: center; font-weight: 600; color: #4a5568; padding: 8px;">
                            ${basicCount + paramCount} total settings<br>
                            <small style="color: #718096;">${basicCount} basic • ${paramCount} params</small>
                        </td>
                    `;
                }).join('')}
            </tr>
        `;
    }

    html += `
                    </tbody>
                </table>
            </div>
                
            ${isMultipleStrategies ? `
            <div style="background: #e6fffa; border: 1px solid #38b2ac; border-radius: 6px; padding: 10px; margin-top: 15px; font-size: 0.85em;">
                <strong>💡 Comparison Tips:</strong>
                <ul style="margin: 5px 0 0 20px; color: #2c7a7b;">
                    <li>Green values typically indicate enabled features</li>
                    <li>Red values typically indicate disabled features</li>
                    <li>Numeric values are highlighted for easy comparison</li>
                    <li>Settings marked with "-" are not present in that strategy</li>
                </ul>
            </div>
            ` : ''}
        </div>
    `;
    
    container.innerHTML = html;
}

// Move PnL strategy up in the order
function movePnLStrategyUp(pnlIndex) {
    // Get the filtered reports that have PnL data
    const pnlReports = reports.filter(report => report.pnlData && report.pnlData.trim());
    
    if (pnlIndex <= 0 || pnlIndex >= pnlReports.length) {
        return; // Can't move up if it's already first or invalid index
    }
    
    // Get the current and previous PnL reports
    const currentReport = pnlReports[pnlIndex];
    const previousReport = pnlReports[pnlIndex - 1];
    
    // Find their indices in the main reports array
    const currentMainIndex = reports.findIndex(r => r.name === currentReport.name);
    const previousMainIndex = reports.findIndex(r => r.name === previousReport.name);
    
    // Swap them in the main reports array
    if (currentMainIndex !== -1 && previousMainIndex !== -1) {
        [reports[currentMainIndex], reports[previousMainIndex]] = [reports[previousMainIndex], reports[currentMainIndex]];
        
        // Update all views
        updateComparison();
        updateReportList();
    }
}

// Move PnL strategy down in the order
function movePnLStrategyDown(pnlIndex) {
    // Get the filtered reports that have PnL data
    const pnlReports = reports.filter(report => report.pnlData && report.pnlData.trim());
    
    if (pnlIndex < 0 || pnlIndex >= pnlReports.length - 1) {
        return; // Can't move down if it's already last or invalid index
    }
    
    // Get the current and next PnL reports
    const currentReport = pnlReports[pnlIndex];
    const nextReport = pnlReports[pnlIndex + 1];
    
    // Find their indices in the main reports array
    const currentMainIndex = reports.findIndex(r => r.name === currentReport.name);
    const nextMainIndex = reports.findIndex(r => r.name === nextReport.name);
    
    // Swap them in the main reports array
    if (currentMainIndex !== -1 && nextMainIndex !== -1) {
        [reports[currentMainIndex], reports[nextMainIndex]] = [reports[nextMainIndex], reports[currentMainIndex]];
        
        // Update all views
        updateComparison();
        updateReportList();
    }
}

// Remove entire strategy completely (both backtest and PnL data)
function removePnLStrategy(index) {
    // Get the filtered reports that have PnL data
    const pnlReports = reports.filter(report => report.pnlData && report.pnlData.trim());
    
    if (pnlReports[index] && confirm(`Remove entire strategy "${pnlReports[index].name}" completely? This will delete all data including backtest results.`)) {
        // Find the report to remove in the main reports array
        const reportToRemove = pnlReports[index];
        const mainArrayIndex = reports.findIndex(r => r.name === reportToRemove.name);
        
        // Remove the entire report from the main reports array
        if (mainArrayIndex !== -1) {
            reports.splice(mainArrayIndex, 1);
        }
        
        // Update all views and report list
        updateComparison();
        updateReportList();
        
        // If no reports left, show empty state
        if (reports.length === 0) {
            document.getElementById('comparisonSection').classList.remove('active');
            document.getElementById('emptyState').style.display = 'flex';
        }
        
        showNotification(`Removed strategy: ${reportToRemove.name}`, 'success');
    }
}

// Save functionality - ENHANCED to include new tab data
function saveSession() {
    if (reports.length === 0) {
        showNotification('No reports to save. Please add some reports first.', 'error');
        return;
    }

    try {
        // Create save data object
        const saveData = {
            version: '2.0', // Updated version to include new tabs
            timestamp: new Date().toISOString(),
            reportCount: reports.length,
            currentView: currentView,
            reports: reports.map(report => ({
                name: report.name,
                metrics: report.metrics,
                pnlData: report.pnlData || '',
                formulaData: report.formulaData || '',
                settingsData: report.settingsData || '',
                symbolsData: report.symbolsData || []
            }))
        };

        // Convert to JSON
        const jsonString = JSON.stringify(saveData, null, 2);
        
        // Create and download file
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `backtest-analysis-${timestamp}.json`;
        
        // Create download link
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);
        
        showNotification(`Session saved as ${filename}`, 'success');
        
    } catch (error) {
        console.error('Save error:', error);
        showNotification('Error saving session. Please try again.', 'error');
    }
}

// Load functionality - ENHANCED to handle new tab data
function loadSession() {
    const fileInput = document.getElementById('loadFileInput');
    fileInput.click();
}

function handleLoadFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.name.endsWith('.json')) {
        showNotification('Please select a valid JSON file.', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const loadedData = JSON.parse(e.target.result);
            
            // Validate loaded data structure
            if (!loadedData.reports || !Array.isArray(loadedData.reports)) {
                throw new Error('Invalid file format');
            }
            
            // Show confirmation dialog
            const reportCount = loadedData.reports.length;
            const timestamp = loadedData.timestamp ? 
                new Date(loadedData.timestamp).toLocaleDateString() : 'Unknown';
            
            const confirmMessage = `Load ${reportCount} reports from ${timestamp}?\n\nThis will replace your current analysis.`;
            
            if (confirm(confirmMessage)) {
                // Clear existing reports
                reports = [];
                
                // Load reports with validation
                loadedData.reports.forEach((reportData, index) => {
                    try {
                        const report = {
                            name: reportData.name || `Loaded Report ${index + 1}`,
                            metrics: reportData.metrics || {},
                            pnlData: reportData.pnlData || '',
                            formulaData: reportData.formulaData || '',
                            settingsData: reportData.settingsData || '',
                            symbolsData: reportData.symbolsData || []
                        };
                        
                        // Validate metrics object
                        if (typeof report.metrics === 'object' && report.metrics !== null) {
                            reports.push(report);
                        }
                    } catch (reportError) {
                        console.warn(`Error loading report ${index}:`, reportError);
                    }
                });
                
                // Restore view if specified
                if (loadedData.currentView && ['table', 'charts', 'pnl', 'symbols', 'formula', 'settings'].includes(loadedData.currentView)) {
                    currentView = loadedData.currentView;
                }
                
                // Update display
                updateComparison();
                updateReportList();
                
                // Show appropriate view
                showView(currentView);
                
                showNotification(`Successfully loaded ${reports.length} reports from ${file.name}`, 'success');
                
            }
            
        } catch (error) {
            console.error('Load error:', error);
            showNotification('Error loading file. Please check the file format.', 'error');
        }
    };
    
    reader.onerror = function() {
        showNotification('Error reading file. Please try again.', 'error');
    };
    
    reader.readAsText(file);
    
    // Clear file input
    event.target.value = '';
}

// Show notification
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existing = document.querySelector('.save-notification');
    if (existing) {
        existing.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `save-notification${type === 'error' ? ' error' : ''}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, type === 'error' ? 4000 : 3000);
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+P for print all views
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        printAllViews();
    }
    
    // Ctrl+S for save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveSession();
    }
    
    // Ctrl+O for load
    if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        loadSession();
    }
});

// Auto-save functionality (optional - saves to localStorage) - ENHANCED
function autoSave() {
    if (reports.length > 0) {
        try {
            const autoSaveData = {
                timestamp: new Date().toISOString(),
                reports: reports,
                currentView: currentView
            };
            localStorage.setItem('backtestAnalysisAutoSave', JSON.stringify(autoSaveData));
        } catch (error) {
            console.warn('Auto-save failed:', error);
        }
    }
}

// Load auto-saved data on startup
function loadAutoSave() {
    try {
        const autoSaveData = localStorage.getItem('backtestAnalysisAutoSave');
        if (autoSaveData) {
            const data = JSON.parse(autoSaveData);
            if (data.reports && data.reports.length > 0) {
                // Show option to restore
                const restoreMessage = `Found auto-saved session with ${data.reports.length} reports.\nWould you like to restore it?`;
                if (confirm(restoreMessage)) {
                    reports = data.reports;
                    currentView = data.currentView || 'table';
                    updateComparison();
                    updateReportList();
                    showView(currentView);
                    showNotification('Auto-saved session restored', 'success');
                }
            }
        }
    } catch (error) {
        console.warn('Auto-restore failed:', error);
    }
}

// Initialize the application
window.addEventListener('load', () => {
    updateReportList();
    
    // Load sample data
    const sampleData = `**Statistics** | Charts | Trades | Formula | Settings | Symbols | Monte Carlo
**Statistics**
 **All tradesLong tradesShort trades**Initial capital400000.00400000.00400000.00Ending capital33985662.95400000.0033985662.95Net Profit33585662.950.0033585662.95Net Profit %8396.42%0.00%8396.42%Exposure %0.41%0.00%0.41%Net Risk Adjusted Return %2065833.88%-nan(ind)%2065833.88%Annual Return %30.68%0.00%30.68%Risk Adjusted Return %7549.17%-nan(ind)%7549.17%Transaction costs6795791.720.006795791.72
**All trades**134590 (0.00 %)13459 (100.00 %) Avg. Profit/Loss2495.41-nan(ind)2495.41 Avg. Profit/Loss %0.59%-nan(ind)0.59% Avg. Bars Held30.83-nan(ind)30.83
**Winners**7176 (53.32 %)0 (0.00 %)7176 (53.32 %) Total Profit81898959.440.0081898959.44 Avg. Profit11412.90-nan(ind)11412.90 Avg. Profit %2.69%-nan(ind)2.69% Avg. Bars Held42.20-nan(ind)42.20 Max. Consecutive14014 Largest win132797.370.00132797.37 # bars in largest win42042
**Losers**6283 (46.68 %)0 (0.00 %)6283 (46.68 %) Total Loss-48313296.480.00-48313296.48 Avg. Loss-7689.53-nan(ind)-7689.53 Avg. Loss %-1.82%-nan(ind)%-1.82% Avg. Bars Held17.84-nan(ind)17.84 Max. Consecutive14014 Largest loss-49638.740.00-49638.74# bars in largest loss202
Max. trade drawdown-59293.300.00-59293.30Max. trade % drawdown-12.260.00-12.26Max. system drawdown-218007.860.00-218007.86Max. system % drawdown-8.13%0.00%-8.13%Recovery Factor154.06-nan(ind)154.06CAR/MaxDD3.77-nan(ind)3.77RAR/MaxDD928.74-nan(ind)928.74Profit Factor1.70nan1.70Payoff Ratio1.48nan1.48Standard Error1188256.350.001188256.35Risk-Reward Ratio1.68-nan(ind)1.68Ulcer Index0.440.000.44Ulcer Performance Index57.69-inf57.69Sharpe Ratio of trades4.290.004.29K-Ratio0.02-nan(ind)0.02`;

    const samplePnLData = `**2020**22.9 K 87.8 K 148.6 K 82.2 K 90.6 K 89.0 K 30.5 K 144.6 K 7.2 K 25.5 K 27.2 K 9.2 K **765.4 K
**2021**107.4 K 22.0 K 84.7 K 74.2 K 53.2 K 27.8 K 31.1 K 39.8 K -14.8 K 57.2 K 40.1 K -7.8 K **514.9 K
**2022**26.5 K 8.4 K 47.0 K 16.4 K 131.3 K 92.4 K 36.9 K -11.2 K 31.0 K 46.0 K 15.8 K 40.0 K **480.7 K
**2023**26.9 K 12.2 K 6.9 K 28.3 K 62.9 K 3.1 K 12.7 K 55.0 K 83.4 K 67.3 K 37.8 K 53.3 K **449.7 K
**2024**-19.1 K 25.3 K 42.7 K 38.1 K 55.2 K 67.8 K **210.0 K
**Avg**32.9 K 31.1 K 65.9 K 47.8 K 78.6 K 56.0 K 27.8 K 57.0 K 26.7 K 49.0 K 30.2 K 23.9 K`;

    document.getElementById('reportData').value = sampleData;
    document.getElementById('reportName').value = 'Sample Strategy';
    document.getElementById('pnlData').value = samplePnLData;
    
    // Load auto-saved data if available
    setTimeout(() => {
        loadAutoSave();
    }, 1000);
});