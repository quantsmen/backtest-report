// sample-data.js - Embedded sample data (no fetch required)

const EMBEDDED_SAMPLE_DATA = {
  "version": "2.0",
  "timestamp": "2025-09-14T03:51:04.093Z",
  "reportCount": 2,
  "currentView": "table",
  "reports": [
    {
      "name": "Sample Strategy-1",
      "metrics": {
        "Initial capital": "100000.00",
        "Ending capital": "145250.00",
        "Net Profit": "45250.00",
        "Net Profit %": "45.25%",
        "Exposure %": "68.50%",
        "Annual Return %": "15.75%",
        "Transaction costs": "2850.00",
        "Total Trades": "35",
        "Avg. Profit/Loss": "1292.86",
        "Avg. Profit/Loss %": "2.18%",
        "Avg. Bars Held": "28.5",
        "Winners": "22",
        "Total Profit": "58750.00",
        "Avg. Profit": "2670.45",
        "Largest win": "8950.00",
        "Losers": "13",
        "Total Loss": "-13500.00",
        "Avg. Loss": "-1038.46",
        "Largest loss": "-3250.00",
        "Max. trade drawdown": "-3250.00",
        "Max. system drawdown": "-8750.00",
        "Max. system % drawdown": "-7.85%",
        "Recovery Factor": "5.17",
        "Profit Factor": "4.35",
        "Payoff Ratio": "2.57",
        "Risk-Reward Ratio": "0.87",
        "Ulcer Index": "3.42",
        "Sharpe Ratio of trades": "1.85",
        "K-Ratio": "0.78"
      },
      "pnlData": "**2020**2.3 K 3.8 K 5.2 K 4.1 K 3.9 K 2.8 K 1.9 K 4.5 K 2.1 K 3.2 K 2.8 K 1.9 K **38.5 K\n**2021**3.8 K 2.9 K 4.2 K 3.5 K 2.8 K 3.1 K 2.7 K 3.9 K 2.5 K 4.1 K 3.3 K 2.2 K **39.0 K\n**2022**2.9 K 3.2 K 4.1 K 2.8 K 3.5 K 2.9 K 2.4 K 3.8 K 2.7 K 3.4 K 2.9 K 3.1 K **37.7 K\n**2023**3.1 K 2.8 K 3.5 K 4.2 K 3.8 K 2.9 K 3.4 K 4.1 K 3.9 K 3.2 K 2.8 K 3.5 K **41.2 K\n**2024**2.8 K 3.4 K 3.9 K 3.1 K 2.9 K 3.5 K 2.8 K 3.2 K 4.1 K 3.8 K 2.9 K 3.1 K **39.5 K",
      "formulaData": "// Sample Strategy-1 AFL Code\nBuyPrice = Close;\nSellPrice = Close;\n\n// Parameters\nMAFast = Param(\"Fast MA\", 10, 5, 50, 1);\nMASlow = Param(\"Slow MA\", 20, 10, 100, 1);\nATRPeriod = Param(\"ATR Period\", 14, 5, 30, 1);\nATRMultiplier = Param(\"ATR Multiplier\", 2, 1, 5, 0.1);\n\n// Moving averages\nFastMA = MA(Close, MAFast);\nSlowMA = MA(Close, MASlow);\n\n// ATR for stop loss\nATRValue = ATR(ATRPeriod);\n\n// Entry conditions\nBuyCondition = Cross(FastMA, SlowMA) AND Volume > MA(Volume, 20);\nSellCondition = Cross(SlowMA, FastMA) OR Close < (BuyPrice - ATRMultiplier * ATRValue);\n\nBuy = BuyCondition;\nSell = SellCondition;\n\n// Plotting\nPlot(Close, \"Close\", colorBlack, styleCandle);\nPlot(FastMA, \"Fast MA\", colorBlue, styleLine);\nPlot(SlowMA, \"Slow MA\", colorRed, styleLine);\nPlotShapes(Buy * shapeUpArrow, colorGreen, 0, Low, -10);\nPlotShapes(Sell * shapeDownArrow, colorRed, 0, High, -10);",
      "settingsData": {
        "basic": {
          "Periodicity/Positions:": "Daily/Long Only",
          "Initial capital": "100000.00",
          "Buy price:": "Close",
          "Sell price:": "Close",
          "Futures mode:": "No"
        },
        "parameters": {
          "Fast MA Period": "10",
          "Slow MA Period": "20",
          "ATR Period": "14",
          "ATR Multiplier": "2.0",
          "Min Volume Factor": "1.2"
        }
      },
      "symbolsData": ["RELIANCE.EQ-NSE", "TCS.EQ-NSE", "HDFCBANK.EQ-NSE", "INFY.EQ-NSE", "HINDUNILVR.EQ-NSE"]
    },
    {
      "name": "Sample Strategy-2",
      "metrics": {
        "Initial capital": "100000.00",
        "Ending capital": "128750.00",
        "Net Profit": "28750.00",
        "Net Profit %": "28.75%",
        "Exposure %": "52.30%",
        "Annual Return %": "12.45%",
        "Transaction costs": "1950.00",
        "Total Trades": "48",
        "Avg. Profit/Loss": "599.00",
        "Avg. Profit/Loss %": "1.85%",
        "Avg. Bars Held": "15.2",
        "Winners": "29",
        "Total Profit": "38950.00",
        "Avg. Profit": "1343.45",
        "Largest win": "4850.00",
        "Losers": "19",
        "Total Loss": "-10200.00",
        "Avg. Loss": "-536.84",
        "Largest loss": "-1950.00",
        "Max. trade drawdown": "-1950.00",
        "Max. system drawdown": "-5250.00",
        "Max. system % drawdown": "-4.75%",
        "Recovery Factor": "5.48",
        "Profit Factor": "3.82",
        "Payoff Ratio": "2.50",
        "Risk-Reward Ratio": "0.78",
        "Ulcer Index": "2.15",
        "Sharpe Ratio of trades": "2.12",
        "K-Ratio": "0.85"
      },
      "pnlData": "**2020**1.8 K 2.4 K 3.1 K 2.8 K 2.2 K 1.9 K 2.5 K 3.2 K 1.8 K 2.9 K 2.1 K 2.4 K **29.1 K\n**2021**2.5 K 1.9 K 2.8 K 2.4 K 2.1 K 2.6 K 1.8 K 2.9 K 2.3 K 2.7 K 2.2 K 1.9 K **28.1 K\n**2022**2.2 K 2.8 K 2.1 K 1.9 K 2.5 K 2.3 K 2.7 K 2.4 K 2.1 K 2.8 K 2.2 K 2.5 K **28.5 K\n**2023**2.4 K 2.1 K 2.9 K 2.6 K 2.3 K 2.8 K 2.1 K 2.7 K 2.5 K 2.4 K 2.8 K 2.2 K **29.8 K\n**2024**2.1 K 2.6 K 2.3 K 2.8 K 2.5 K 2.2 K 2.9 K 2.1 K 2.7 K 2.4 K 2.3 K 2.6 K **30.5 K",
      "formulaData": "// Sample Strategy-2 AFL Code\nBuyPrice = Close;\nSellPrice = Close;\n\n// Parameters\nLookback = Param(\"Lookback Period\", 20, 10, 50, 1);\nStdDevs = Param(\"Std Deviations\", 2, 1, 3, 0.1);\nRSIPeriod = Param(\"RSI Period\", 14, 5, 30, 1);\nRSIOverbought = Param(\"RSI Overbought\", 70, 60, 85, 1);\nRSIOversold = Param(\"RSI Oversold\", 30, 15, 40, 1);\n\n// Bollinger Bands\nBBUpper = BBandTop(Close, Lookback, StdDevs);\nBBLower = BBandBot(Close, Lookback, StdDevs);\nBBMiddle = MA(Close, Lookback);\n\n// RSI\nRSIValue = RSI(RSIPeriod);\n\n// Entry conditions\nBuyCondition = Close < BBLower AND RSIValue < RSIOversold AND Volume > MA(Volume, 10);\nSellCondition = Close > BBUpper OR RSIValue > RSIOverbought OR Close > BBMiddle * 1.05;\n\nBuy = BuyCondition;\nSell = SellCondition;\n\n// Plotting\nPlot(Close, \"Close\", colorBlack, styleCandle);\nPlot(BBUpper, \"BB Upper\", colorRed, styleLine);\nPlot(BBLower, \"BB Lower\", colorGreen, styleLine);\nPlot(BBMiddle, \"BB Middle\", colorBlue, styleLine);\nPlotShapes(Buy * shapeUpArrow, colorGreen, 0, Low, -10);\nPlotShapes(Sell * shapeDownArrow, colorRed, 0, High, -10);",
      "settingsData": {
        "basic": {
          "Periodicity/Positions:": "Daily/Long Only",
          "Annual interest rate:": "0.00%",
          "Apply to:": "Filter",
          "Include Filter": "Include Filter",
          "Market (Include)": "NSE",
          "Market": "-",
          "Group (Include)": "-",
          "Group": "-",
          "Sector (Include)": "-",
          "Sector": "-",
          "Industry (Include)": "-",
          "Industry": "-",
          "Watchlist (Include)": "Top 100",
          "Watchlist": "-",
          "GICS (Include)": "-",
          "GICS": "-",
          "ICB (Include)": "-",
          "ICB": "-",
          "Index (Include)": "-",
          "Index": "-",
          "Favourite (Include)": "-",
          "Favourite": "-",
          "Futures mode:": "No",
          "Drawdowns based on:": "High/Low prices",
          "Buy price:": "Close",
          "Sell price:": "Close",
          "Short price:": "Close",
          "Cover price:": "Close",
          "Maximum loss:": "disabled",
          "Profit target:": "disabled",
          "Exit at stop?": "no",
          "Trailing stop:": "disabled"
        },
        "parameters": {
          "Initial Equity:": "100000",
          "Commissions:": "0.05 (Use portfolio settings)",
          "Range:": "01-01-2020 - 31-12-2024",
          "Account margin:": "1",
          "Def. round lot size:": "1",
          "Def. Tick Size": "0.01",
          "Buy delay:": "1",
          "Sell delay:": "1",
          "Short delay:": "1",
          "Cover delay:": "1",
          "BB Period": "20",
          "BB Std Dev": "2.0",
          "RSI Period": "14",
          "RSI Overbought": "70",
          "RSI Oversold": "30"
        }
      },
      "symbolsData": [
        "RELIANCE.EQ-NSE", "TCS.EQ-NSE", "HDFCBANK.EQ-NSE", "INFY.EQ-NSE", "HINDUNILVR.EQ-NSE",
        "ITC.EQ-NSE", "SBIN.EQ-NSE", "BHARTIARTL.EQ-NSE", "ASIANPAINT.EQ-NSE", "MARUTI.EQ-NSE"
      ]
    }
  ]
};

// Load sample data using embedded data instead of fetch
async function loadSampleData() {
    console.log('=== LOADING EMBEDDED SAMPLE STRATEGIES ===');
    
    try {
        showSampleNotification('Loading sample strategies...', 'success');
        
        const loadedData = EMBEDDED_SAMPLE_DATA; // Use embedded data instead of fetch
        
        console.log('Sample data loaded:', loadedData.reports.length, 'strategies found');
        
        // Check if we can access the main app functions
        if (typeof reports === 'undefined') {
            throw new Error('Main application not ready. Please refresh the page.');
        }
        
        // Clear existing reports (same as load session does)
        reports = [];
        
        // Load reports with validation (same logic as handleLoadFile in main.js)
        loadedData.reports.forEach((reportData, index) => {
            try {
                const report = {
                    name: reportData.name || `Sample Report ${index + 1}`,
                    metrics: reportData.metrics || {},
                    pnlData: reportData.pnlData || '',
                    formulaData: reportData.formulaData || '',
                    settingsData: reportData.settingsData || { basic: {}, parameters: {} },
                    symbolsData: reportData.symbolsData || []
                };
                
                // Validate metrics object
                if (typeof report.metrics === 'object' && report.metrics !== null) {
                    reports.push(report);
                    console.log(`Added sample strategy: ${report.name}`, {
                        metricsCount: Object.keys(report.metrics).length,
                        hasPnL: !!report.pnlData,
                        hasFormula: !!report.formulaData,
                        hasSettings: !!(report.settingsData && 
                            ((report.settingsData.basic && Object.keys(report.settingsData.basic).length > 0) || 
                             (report.settingsData.parameters && Object.keys(report.settingsData.parameters).length > 0))),
                        hasSymbols: !!(report.symbolsData && report.symbolsData.length > 0)
                    });
                }
            } catch (reportError) {
                console.warn(`Error loading sample report ${index}:`, reportError);
            }
        });
        
        // Restore view if specified (same as load session)
        if (loadedData.currentView && ['table', 'charts', 'pnl', 'symbols', 'formula', 'settings'].includes(loadedData.currentView)) {
            if (typeof currentView !== 'undefined') {
                currentView = loadedData.currentView;
            }
        }
        
        // Update display using existing functions
        if (typeof updateComparison === 'function') {
            updateComparison();
        }
        
        if (typeof updateReportList === 'function') {
            updateReportList();
        }
        
        // Show appropriate view
        if (typeof showView === 'function') {
            showView(currentView || 'table');
        }
        
        // Show comparison section and hide empty state
        const comparisonSection = document.getElementById('comparisonSection');
        const emptyState = document.getElementById('emptyState');
        
        if (comparisonSection && emptyState) {
            comparisonSection.classList.add('active');
            emptyState.style.display = 'none';
        }
        
        showSampleNotification(`Successfully loaded ${reports.length} sample strategies!`, 'success');
        console.log('=== SAMPLE STRATEGIES LOADED SUCCESSFULLY ===');
        
    } catch (error) {
        console.error('Error loading sample data:', error);
        showSampleNotification('Error loading sample data: ' + error.message, 'error');
    }
}

// Create sample button
function createSampleButton() {
    const container = document.createElement('div');
    container.className = 'sample-strategy-section';
    container.innerHTML = `
        <div class="sample-strategy-header">
            <h3>Sample Data</h3>
        </div>
        <div class="sample-buttons">
            <button class="sample-btn" onclick="loadSampleData()">
                Load Sample Strategies
            </button>
        </div>
        <div class="sample-description">
            <small>Loads 2 complete sample strategies with metrics, PnL data, settings, and symbols</small>
        </div>
    `;
    return container;
}

// Rest of the code remains the same...
function injectSampleDataStyles() {
    if (document.getElementById('sample-data-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'sample-data-styles';
    styles.textContent = `
        .sample-strategy-section {
            background: linear-gradient(135deg, #f7fafc, #edf2f7);
            padding: 8px;
            margin: 8px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .sample-strategy-header h3 {
            font-size: 0.95em;
            margin-bottom: 8px;
            color: #2d3748;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .sample-btn {
            width: 100%;
            padding: 10px 14px;
            margin-bottom: 8px;
            border: none;
            border-radius: 8px;
            font-size: 0.85em;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            background: linear-gradient(135deg, #38b2ac, #2c7a7b);
            color: white;
        }

        .sample-btn:hover {
            transform: translateY(-2px);
            opacity: 0.9;
            box-shadow: 0 6px 20px rgba(56, 178, 172, 0.4);
        }

        .sample-btn:active {
            transform: translateY(0);
        }

        .sample-description {
            font-size: 0.75em;
            color: #718096;
            text-align: center;
            line-height: 1.3;
        }

        @media (max-width: 768px) {
            .sample-btn {
                font-size: 0.8em;
                padding: 8px 12px;
            }
        }
    `;
    document.head.appendChild(styles);
}

function showSampleNotification(message, type = 'success') {
    if (typeof showNotification === 'function') {
        showNotification(message, type);
        return;
    }
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#48bb78' : '#f56565'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000;
        font-size: 0.9em;
        border-radius: 8px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Initialize sample data system
function initializeSampleData() {
    console.log('=== INITIALIZING EMBEDDED SAMPLE DATA SYSTEM ===');
    
    injectSampleDataStyles();
    
    const addedReports = document.getElementById('addedReports');
    if (!addedReports) {
        console.error('Reports Library section not found');
        return;
    }
    
    const existingButton = document.querySelector('.sample-strategy-section');
    if (existingButton) {
        console.log('Sample button already exists');
        return;
    }
    
    const sampleButton = createSampleButton();
    
    try {
        addedReports.parentNode.insertBefore(sampleButton, addedReports);
        console.log('Sample button inserted successfully');
    } catch (error) {
        console.error('Error inserting sample button:', error);
    }
}

// Global function for button click
window.loadSampleData = loadSampleData;

// Initialize when DOM is ready
if (document.readyState !== 'loading') {
    setTimeout(initializeSampleData, 100);
} else {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initializeSampleData, 100);
    });
}

console.log('Embedded sample data system loaded - no external fetch required');