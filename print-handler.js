// print-handler.js - Print functionality separated from main.js

// ENHANCED: Print all views as six separate pages with proper handling of new tabs
function printAllViews() {
    if (reports.length === 0) {
        showNotification('No reports to print. Please add some reports first.', 'error');
        return;
    }

    try {
        // Store current view and temporarily hide main content
        const originalView = currentView;
        const originalTitle = document.title;
        const mainContent = document.querySelector('.main-content');
        const header = document.querySelector('.header');
        
        // Hide normal content during print
        if (mainContent) mainContent.style.display = 'none';
        if (header) header.style.display = 'none';
        
        // Generate all content first to ensure it's ready
        showNotification('Preparing 6-page comprehensive report...', 'success');
        
        // Ensure all views are populated with current data
        createComparisonTable();
        createCharts();
        createPnLView();
        createSymbolsView();
        createFormulaView();
        createSettingsView();
        
        // Set document title for print
        document.title = `Complete Backtest Analysis Report - ${reports.length} Strategies - ${new Date().toLocaleDateString()}`;
        
        const timestamp = new Date().toLocaleString();
        
        // Create print container with higher z-index
        const printContainer = document.createElement('div');
        printContainer.className = 'print-all-container';
        printContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: white;
            z-index: 10000;
            overflow: hidden;
            display: none;
        `;
        
        // PAGE 1: Comparison Table
        const tableContent = document.getElementById('tableContainer').innerHTML;
        const page1 = document.createElement('div');
        page1.className = 'print-page print-page-1';
        page1.innerHTML = `
            <div class="print-page-header">
                <h1>Strategy Comparison Analysis</h1>
                <div class="print-page-meta">
                    <span>Generated: ${timestamp}</span>
                    <span>Strategies: ${reports.length}</span>
                    <span>Page 1 of 6</span>
                </div>
            </div>
            <div class="print-page-content">
                ${tableContent || '<p>No comparison data available</p>'}
            </div>
        `;
        printContainer.appendChild(page1);
        
        // PAGE 2: Visual Charts  
        const chartsContent = document.getElementById('chartsContainer').innerHTML;
        const page2 = document.createElement('div');
        page2.className = 'print-page print-page-2';
        page2.innerHTML = `
            <div class="print-page-header">
                <h1>Visual Performance Charts</h1>
                <div class="print-page-meta">
                    <span>Generated: ${timestamp}</span>
                    <span>Strategies: ${reports.length}</span>
                    <span>Page 2 of 6</span>
                </div>
            </div>
            <div class="print-page-content">
                ${chartsContent || '<p>No chart data available</p>'}
            </div>
        `;
        printContainer.appendChild(page2);
        
        // PAGE 3: PnL Analysis with FIXED cumulative chart handling
        let pnlContent = document.getElementById('pnlContainer').innerHTML;
        const pnlReports = reports.filter(report => report.pnlData && report.pnlData.trim());
        
        // FIXED: Replace the cumulative chart canvas with a print-friendly placeholder
        if (pnlContent && pnlContent.includes('cumulativeChart')) {
            const chartPlaceholder = `
                <div class="print-chart-placeholder">
                    📊 Cumulative PnL Performance Chart<br>
                    <small>Interactive chart showing cumulative profit/loss over time for ${pnlReports.length} strategies</small>
                </div>
            `;
            
            // Replace the chart canvas container with the placeholder
            pnlContent = pnlContent.replace(
                /<div class="chart-canvas-container">[\s\S]*?<\/div>/,
                chartPlaceholder
            );
            
            // Also hide chart controls and legend for print
            pnlContent = pnlContent.replace(
                /<div class="chart-controls">[\s\S]*?<\/div>/g,
                ''
            );
            pnlContent = pnlContent.replace(
                /<div class="chart-legend"[\s\S]*?<\/div>/g,
                '<div class="print-legend-placeholder">Chart legend available in interactive view</div>'
            );
        }
        
        const page3 = document.createElement('div');
        page3.className = 'print-page print-page-3';
        
        if (pnlContent && pnlReports.length > 0) {
            page3.innerHTML = `
                <div class="print-page-header">
                    <h1>Monthly PnL Analysis</h1>
                    <div class="print-page-meta">
                        <span>Generated: ${timestamp}</span>
                        <span>PnL Strategies: ${pnlReports.length}</span>
                        <span>Page 3 of 6</span>
                    </div>
                </div>
                <div class="print-page-content">
                    ${pnlContent}
                </div>
            `;
        } else {
            page3.innerHTML = `
                <div class="print-page-header">
                    <h1>Monthly PnL Analysis</h1>
                    <div class="print-page-meta">
                        <span>Generated: ${timestamp}</span>
                        <span>PnL Strategies: 0</span>
                        <span>Page 3 of 6</span>
                    </div>
                </div>
                <div class="print-page-content">
                    <div class="print-no-pnl">
                        <h2>No PnL Data Available</h2>
                        <p>Add monthly profit/loss data to your strategies to see detailed PnL analysis.</p>
                        <div class="print-pnl-example">
                            <p><strong>Expected PnL format:</strong></p>
                            <code>**2024**22.9 K 87.8 K 148.6 K ... **765.4 K</code>
                        </div>
                    </div>
                </div>
            `;
        }
        printContainer.appendChild(page3);
        
        // PAGE 4: Symbols
        const symbolsContent = document.getElementById('symbolsContainer').innerHTML;
        const symbolReports = reports.filter(report => report.symbolsData && report.symbolsData.length > 0);
        const page4 = document.createElement('div');
        page4.className = 'print-page print-page-4';
        page4.innerHTML = `
            <div class="print-page-header">
                <h1>Trading Symbols</h1>
                <div class="print-page-meta">
                    <span>Generated: ${timestamp}</span>
                    <span>Symbol Strategies: ${symbolReports.length}</span>
                    <span>Page 4 of 6</span>
                </div>
            </div>
            <div class="print-page-content">
                ${symbolsContent || `
                    <div class="print-no-data">
                        <h2>No Symbols Data Available</h2>
                        <p>Load Amibroker reports with symbols.html files to see trading symbols.</p>
                    </div>
                `}
            </div>
        `;
        printContainer.appendChild(page4);
        
        // PAGE 5: Formula
        const formulaContent = document.getElementById('formulaContainer').innerHTML;
        const formulaReports = reports.filter(report => report.formulaData && report.formulaData.trim());
        const page5 = document.createElement('div');
        page5.className = 'print-page print-page-5';
        page5.innerHTML = `
            <div class="print-page-header">
                <h1>AFL Formula Code</h1>
                <div class="print-page-meta">
                    <span>Generated: ${timestamp}</span>
                    <span>Formula Strategies: ${formulaReports.length}</span>
                    <span>Page 5 of 6</span>
                </div>
            </div>
            <div class="print-page-content">
                ${formulaContent || `
                    <div class="print-no-data">
                        <h2>No Formula Data Available</h2>
                        <p>Load Amibroker reports with formula.html files to see AFL code.</p>
                    </div>
                `}
            </div>
        `;
        printContainer.appendChild(page5);
        
        // PAGE 6: Settings
        const settingsContent = document.getElementById('settingsContainer').innerHTML;
        const settingsReports = reports.filter(report => report.settingsData);
        const page6 = document.createElement('div');
        page6.className = 'print-page print-page-6';
        page6.innerHTML = `
            <div class="print-page-header">
                <h1>Backtest Settings</h1>
                <div class="print-page-meta">
                    <span>Generated: ${timestamp}</span>
                    <span>Settings Strategies: ${settingsReports.length}</span>
                    <span>Page 6 of 6</span>
                </div>
            </div>
            <div class="print-page-content">
                ${settingsContent || `
                    <div class="print-no-data">
                        <h2>No Settings Data Available</h2>
                        <p>Load Amibroker reports with settings.html files to see backtest settings.</p>
                    </div>
                `}
            </div>
        `;
        printContainer.appendChild(page6);
        
        // Add enhanced print styles with PREMIUM PROFESSIONAL CHART STYLING
        const printStyles = document.createElement('style');
        printStyles.id = 'print-all-styles';
        printStyles.textContent = `
            /* Hide everything except print container during print */
            @media print {
                @page {
                    size: A3 landscape;
                    margin: 0.3in 0.2in;
                }
                
                * {
                    visibility: hidden !important;
                    -webkit-print-color-adjust: exact !important;
                    color-adjust: exact !important;
                }
                
                .print-all-container,
                .print-all-container * {
                    visibility: visible !important;
                }
                
                .print-all-container {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    height: auto !important;
                    background: white !important;
                    display: block !important;
                    z-index: 999999 !important;
                }
                
                .print-page {
                    width: 100% !important;
                    min-height: 100vh !important;
                    page-break-after: always !important;
                    page-break-inside: avoid !important;
                    margin: 0 !important;
                    padding: 0.2in !important;
                    box-sizing: border-box !important;
                    background: white !important;
                    position: relative !important;
                    display: block !important;
                }
                
                .print-page:last-child {
                    page-break-after: avoid !important;
                    min-height: auto !important;
                }
                
                .print-page-header {
                    background: white !important;
                    padding-bottom: 12px !important;
                    border-bottom: 2px solid #000 !important;
                    margin-bottom: 15px !important;
                    page-break-after: avoid !important;
                    text-align: center !important;
                }
                
                .print-page-header h1 {
                    font-size: 18px !important;
                    color: #000 !important;
                    margin: 0 0 8px 0 !important;
                    font-weight: bold !important;
                    font-family: Arial, sans-serif !important;
                }
                
                .print-page-meta {
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                    font-size: 9px !important;
                    color: #333 !important;
                    border-top: 1px solid #666 !important;
                    padding-top: 6px !important;
                    font-weight: normal !important;
                    font-family: Arial, sans-serif !important;
                }
                
                .print-page-content {
                    overflow: visible !important;
                    height: auto !important;
                    flex: 1 !important;
                }
                
                /* PREMIUM PROFESSIONAL VISUAL CHARTS STYLING - ENHANCED */
                .print-page-2 {
                    page-break-before: auto !important;
                    page-break-after: always !important;
                    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%) !important;
                }
                
                .print-page-2 .charts-grid {
                    display: grid !important;
                    grid-template-columns: repeat(3, 1fr) !important;
                    gap: 16px !important;
                    padding: 12px !important;
                    background: transparent !important;
                }
                
                /* ENHANCED: Premium Chart Card Design */
                .print-page-2 .chart-card {
                    background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%) !important;
                    border: 1px solid #1a365d !important;
                    border-radius: 8px !important;
                    padding: 12px !important;
                    box-shadow: 0 8px 16px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8) !important;
                    page-break-inside: avoid !important;
                    display: block !important;
                    overflow: hidden !important;
                    position: relative !important;
                    margin-bottom: 8px !important;
                }
                
                /* ENHANCED: Professional header with premium styling */
                .print-page-2 .chart-card h4 {
                    font-size: 14px !important;
                    font-weight: 800 !important;
                    color: white !important;
                    text-align: center !important;
                    margin: -12px -12px 12px -12px !important;
                    padding: 8px 4px !important;
                    background: linear-gradient(135deg, #1a365d 0%, #2c5282 50%, #3182ce 100%) !important;
                    font-family: 'Arial Black', Arial, sans-serif !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.8px !important;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.3) !important;
                    border-bottom: 2px solid #0f172a !important;
                }
                
                /* ENHANCED: Premium chart container with sophisticated background */
                .print-page-2 .chart-bars {
                    display: flex !important;
                    align-items: flex-end !important;
                    justify-content: center !important;
                    height: 220px !important;
                    gap: 10px !important;
                    padding: 8px 8px 25px 8px !important;
                    position: relative !important;
                    background: linear-gradient(to bottom, #f1f5f9 0%, #ffffff 50%, #f8fafc 100%) !important;
                    overflow: visible !important;
                    margin-bottom: 8px !important;
                    border-radius: 4px !important;
                    border: 1px solid #e2e8f0 !important;
                }
                
                /* ENHANCED: Professional axis lines with better contrast */
                .print-page-2 .chart-bars::after {
                    content: '' !important;
                    position: absolute !important;
                    bottom: 25px !important;
                    left: 8px !important;
                    right: 8px !important;
                    height: 3px !important;
                    background: linear-gradient(90deg, #1a365d 0%, #2c5282 100%) !important;
                    border-radius: 2px !important;
                }
                
                /* ENHANCED: Y-axis line with premium styling */
                .print-page-2 .chart-bars::before {
                    content: '' !important;
                    position: absolute !important;
                    left: 8px !important;
                    top: 4px !important;
                    bottom: 25px !important;
                    width: 3px !important;
                    background: linear-gradient(180deg, #1a365d 0%, #2c5282 100%) !important;
                    z-index: 1 !important;
                    border-radius: 2px !important;
                }
                
                .print-page-2 .chart-bar-container {
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    gap: 4px !important;
                    flex: 1 !important;
                    max-width: 60px !important;
                    position: relative !important;
                    z-index: 2 !important;
                }
                
                /* ENHANCED: Premium value labels with better positioning */
                .print-page-2 .chart-bar-value {
                    font-size: 12px !important;
                    font-weight: 800 !important;
                    min-height: 16px !important;
                    text-align: center !important;
                    font-family: 'Arial Black', Arial, sans-serif !important;
                    white-space: nowrap !important;
                    position: absolute !important;
                    top: -22px !important;
                    left: 50% !important;
                    transform: translateX(-50%) !important;
                    text-shadow: 0 1px 2px rgba(255,255,255,0.8) !important;
                    padding: 2px 4px !important;
                    background: rgba(255,255,255,0.9) !important;
                    border-radius: 3px !important;
                    border: 1px solid rgba(0,0,0,0.1) !important;
                }
                
                /* ENHANCED: Premium bar styling with sophisticated gradients and shadows */
                .print-page-2 .chart-bar {
                    width: 35px !important;
                    max-height: 190px !important;
                    min-height: 8px !important;
                    border: 0.5px solid #475569 !important;
                    border-radius: 4px 4px 0 0 !important;
                    position: relative !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    box-shadow: 
                        0 -2px 4px rgba(0,0,0,0.15),
                        inset 0 2px 4px rgba(255,255,255,0.3),
                        inset 0 -1px 1px rgba(0,0,0,0.2) !important;
                }
                
                /* ENHANCED: Light green positive value bars with sophisticated gradients */
                .print-page-2 .chart-bar[style*="linear-gradient(135deg, #a5d6a7"] {
                    background: linear-gradient(180deg, #bbf7d0 0%, #86efac 40%, #6ee7b7 70%, #4ade80 100%) !important;
                    border-color: #10b981 !important;
                    box-shadow: 
                        0 -3px 6px rgba(52, 211, 153, 0.2),
                        inset 0 2px 4px rgba(255,255,255,0.4),
                        inset 0 -2px 2px rgba(16, 185, 129, 0.2) !important;
                }
                
                /* ENHANCED: Light red negative value bars with sophisticated gradients */
                .print-page-2 .chart-bar[style*="linear-gradient(135deg, #ffab91"] {
                    background: linear-gradient(180deg, #fecaca 0%, #fca5a5 40%, #f87171 70%, #ef4444 100%) !important;
                    border-color: #dc2626 !important;
                    box-shadow: 
                        0 -3px 6px rgba(248, 113, 113, 0.2),
                        inset 0 2px 4px rgba(255,255,255,0.4),
                        inset 0 -2px 2px rgba(220, 38, 38, 0.2) !important;
                }
                
                /* ENHANCED: Premium neutral bars */
                .print-page-2 .chart-bar:not([style*="linear-gradient"]) {
                    background: linear-gradient(180deg, #94a3b8 0%, #64748b 40%, #475569 70%, #334155 100%) !important;
                    border-color: #1e293b !important;
                    box-shadow: 
                        0 -3px 6px rgba(100, 116, 139, 0.3),
                        inset 0 2px 4px rgba(255,255,255,0.3),
                        inset 0 -2px 2px rgba(71, 85, 105, 0.3) !important;
                }
                
                /* ENHANCED: Premium bar labels with better typography */
                .print-page-2 .chart-bar-label {
                    font-size: 8px !important;
                    font-weight: 700 !important;
                    color: #1e293b !important;
                    text-align: center !important;
                    position: absolute !important;
                    bottom: -20px !important;
                    left: 50% !important;
                    transform: translateX(-50%) !important;
                    font-family: 'Arial', sans-serif !important;
                    white-space: nowrap !important;
                    text-shadow: 0 1px 1px rgba(255,255,255,0.8) !important;
                    line-height: 1.2 !important;
                }
                
                /* ENHANCED: Premium value colors with better contrast */
                .print-page-2 .chart-bar-value[style*="#2d7d32"] {
                    color: #14532d !important;
                    font-weight: 900 !important;
                }
                
                .print-page-2 .chart-bar-value[style*="#c62828"] {
                    color: #7f1d1d !important;
                    font-weight: 900 !important;
                }
                
                /* ENHANCED: Sophisticated grid pattern with premium styling */
                .print-page-2 .chart-card {
                    background-image: 
                        repeating-linear-gradient(
                            0deg,
                            transparent,
                            transparent 19px,
                            rgba(148, 163, 184, 0.15) 19px,
                            rgba(148, 163, 184, 0.15) 20px
                        ),
                        repeating-linear-gradient(
                            90deg,
                            transparent,
                            transparent 39px,
                            rgba(148, 163, 184, 0.1) 39px,
                            rgba(148, 163, 184, 0.1) 40px
                        ) !important;
                    background-position: 0 32px, 0 0 !important;
                }
                
                /* ENHANCED: Professional scale markers */
                .print-page-2 .chart-bars {
                    background-image: 
                        repeating-linear-gradient(
                            90deg,
                            transparent,
                            transparent 4px,
                            rgba(30, 41, 59, 0.2) 4px,
                            rgba(30, 41, 59, 0.2) 5px
                        ),
                        repeating-linear-gradient(
                            0deg,
                            transparent,
                            transparent 19px,
                            rgba(30, 41, 59, 0.15) 19px,
                            rgba(30, 41, 59, 0.15) 20px
                        ) !important;
                    background-size: 5px 100%, 100% 20px !important;
                    background-position: 8px 0, 0 0 !important;
                    background-repeat: no-repeat, repeat !important;
                }
                
                /* ENHANCED: Add subtle patterns to bars for premium look */
                .print-page-2 .chart-bar::after {
                    content: '' !important;
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    height: 25% !important;
                    background: linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%) !important;
                    border-radius: 2px 2px 0 0 !important;
                }
                
                /* ENHANCED: Add depth with inner shadows */
                .print-page-2 .chart-bar::before {
                    content: '' !important;
                    position: absolute !important;
                    bottom: 0 !important;
                    left: 2px !important;
                    right: 2px !important;
                    height: 3px !important;
                    background: rgba(0,0,0,0.2) !important;
                    border-radius: 0 0 2px 2px !important;
                }
                
                /* Enhanced styles for new tabs */
                .print-page-4 .symbols-grid,
                .print-page-5 .formula-content,
                .print-page-6 .settings-section {
                    font-size: 12px !important;
                    line-height: 1.3 !important;
                }
                
                .print-page-4 .symbol-item {
                    padding: 2px 4px !important;
                    margin: 1px !important;
                    border: 1px solid #ccc !important;
                    font-size: 9px !important;
                }
                
                .print-page-5 .formula-content {
                    background: #f8f8f8 !important;
                    border: 1px solid #ccc !important;
                    padding: 10px !important;
                    font-family: 'Courier New', monospace !important;
                    font-size: 9px !important;
                    line-height: 1.2 !important;
                    white-space: pre-wrap !important;
                    word-break: break-all !important;
                }
                
                .print-page-6 .settings-comparison-table {
                    width: 100% !important;
                    border-collapse: collapse !important;
                    font-size: 12px !important;
                }
                
                .print-page-6 .settings-comparison-table th,
                .print-page-6 .settings-comparison-table td {
                    border: 1px solid #000 !important;
                    padding: 2px 3px !important;
                    font-size: 12px !important;
                    text-align: left !important;
                }
                
                .print-page-6 .settings-comparison-table th {
                    background: #f0f0f0 !important;
                    font-weight: bold !important;
                }
                
                .print-no-data {
                    text-align: center !important;
                    padding: 60px 30px !important;
                    border: 2px dashed #666 !important;
                    margin: 40px 0 !important;
                }
                
                .print-no-data h2 {
                    font-size: 20px !important;
                    margin-bottom: 15px !important;
                    color: #333 !important;
                    font-weight: bold !important;
                }
                
                .print-no-data p {
                    font-size: 12px !important;
                    color: #666 !important;
                    line-height: 1.4 !important;
                }
                
                /* Existing styles for pages 1-3 remain the same */
                .print-page-1 .comparison-table {
                    width: 100% !important;
                    font-size: 14px !important;
                    border-collapse: collapse !important;
                    font-family: Arial, sans-serif !important;
                    table-layout: fixed !important;
                }
                
                .print-page-1 .comparison-table th {
                    background: #333 !important;
                    color: white !important;
                    padding: 8px 4px !important;
                    border: 1px solid #000 !important;
                    font-size: 14px !important;
                    text-align: center !important;
                    font-weight: bold !important;
                    word-wrap: break-word !important;
                }
                
                .print-page-1 .comparison-table td {
                    padding: 4px 2px !important;
                    border: 1px solid #000 !important;
                    font-size: 14px !important;
                    word-wrap: break-word !important;
                    line-height: 1.3 !important;
                    color: #000 !important;
                }
                
                /* Hide all interactive elements */
                button, .btn, .delete-btn, .chart-controls, 
                .pnl-strategy-controls, .view-tabs, .header-actions,
                .chart-toggle, .legend-item, .data-badge {
                    display: none !important;
                    visibility: hidden !important;
                }
            }
            
            @media screen {
                .print-all-container {
                    display: none !important;
                }
            }
        `;
        
        // Add styles and container to document
        document.head.appendChild(printStyles);
        document.body.appendChild(printContainer);
        
        // Show container only for print
        printContainer.style.display = 'block';
        
        // Trigger print after a short delay
        setTimeout(() => {
            window.print();
        }, 1000);
        
        // Handle cleanup after print dialog
        const cleanupAfterPrint = () => {
            // Restore original content visibility
            if (mainContent) mainContent.style.display = '';
            if (header) header.style.display = '';
            
            // Remove print elements
            if (printContainer.parentNode) {
                printContainer.parentNode.removeChild(printContainer);
            }
            if (printStyles.parentNode) {
                printStyles.parentNode.removeChild(printStyles);
            }
            
            // Restore title and view
            document.title = originalTitle;
            showView(originalView);
            
            // Remove event listeners
            window.removeEventListener('afterprint', cleanupAfterPrint);
            
            showNotification('Comprehensive 6-page report prepared', 'success');
        };
        
        // Listen for print completion
        window.addEventListener('afterprint', cleanupAfterPrint);
        
        // Fallback cleanup after 10 seconds
        setTimeout(cleanupAfterPrint, 10000);
        
    } catch (error) {
        console.error('Print error:', error);
        showNotification('Error preparing print document. Please try again.', 'error');
        
        // Restore content if error occurs
        const mainContent = document.querySelector('.main-content');
        const header = document.querySelector('.header');
        if (mainContent) mainContent.style.display = '';
        if (header) header.style.display = '';
    }
}

// Legacy print functions (kept for compatibility)
function printCurrentView() {
    printAllViews(); // Redirect to comprehensive print
}

function printOptimized() {
    printAllViews(); // Redirect to comprehensive print

}
