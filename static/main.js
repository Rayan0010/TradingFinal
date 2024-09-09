// Initial chart setup
const chartOptions1 = {
    layout: {
        background: { type: 'solid', color: 'white' },
        textColor: 'black',
    },
    grid: {
        vertLines: {
            color: '#e1e1e1',
        },
        horzLines: {
            color: '#e1e1e1',
        },
    },
    crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
    },
    timeScale: {
        visible: false,
    },
    width: document.getElementById('chart').clientWidth,
    height: document.getElementById('chart').clientHeight,
};

const chartOptions2 = {
    layout: {
        background: { type: 'solid', color: 'white' },
        textColor: 'black',
    },
    grid: {
        vertLines: {
            color: '#e1e1e1',
        },
        horzLines: {
            color: '#e1e1e1',
        },
    },
    timeScale: {
        visible: true,
    },
    width: document.getElementById('chart').clientWidth,
    height: document.getElementById('rsiChart').clientHeight,
};

const chart = LightweightCharts.createChart(document.getElementById('chart'), chartOptions1);
const candlestickSeries = chart.addCandlestickSeries();
const emaLine = chart.addLineSeries({
    color: 'blue', // Set the color for the EMA line
    lineWidth: 2
});

const rsiChart = LightweightCharts.createChart(document.getElementById('rsiChart'),chartOptions2);
const rsiLine = rsiChart.addLineSeries({
    color: 'red', // Set the color for the RSI line
    lineWidth: 2
});

let autoUpdateInterval;

// Fetch data function
function fetchData(ticker, timeframe, emaPeriod, rsiPeriod) {
    fetch(`/api/data/${ticker}/${timeframe}/${emaPeriod}/${rsiPeriod}`)
        .then(response => response.json())
        .then(data => {
            candlestickSeries.setData(data.candlestick);
            emaLine.setData(data.ema);
            rsiLine.setData(data.rsi);

            
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

// Fetch NVDA data on page load with default timeframe (daily), EMA period (20) and RSI period (14)
window.addEventListener('load', () => {
    fetchData('NVDA', '1d', 20, 14);
    loadWatchlist();
});

// Handle data fetching on button click
document.getElementById('fetchData').addEventListener('click', () => {
    const ticker = document.getElementById('ticker').value;
    const timeframe = document.getElementById('timeframe').value;
    const emaPeriod = document.getElementById('emaPeriod').value;
    const rsiPeriod = document.getElementById('rsiPeriod').value;
    fetchData(ticker, timeframe, emaPeriod, rsiPeriod);
});

// Handle auto-update functionality
document.getElementById('autoUpdate').addEventListener('change', (event) => {
    if (event.target.checked) {
        const frequency = document.getElementById('updateFrequency').value * 1000;
        autoUpdateInterval = setInterval(() => {
            const ticker = document.getElementById('ticker').value;
            const timeframe = document.getElementById('timeframe').value;
            const emaPeriod = document.getElementById('emaPeriod').value;
            const rsiPeriod = document.getElementById('rsiPeriod').value;
            fetchData(ticker, timeframe, emaPeriod, rsiPeriod);
        }, frequency);
    } else {
        clearInterval(autoUpdateInterval);
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    chart.resize(document.getElementById('chart').clientWidth, document.getElementById('chart').clientHeight);
    rsiChart.resize(document.getElementById('rsiChart').clientWidth, document.getElementById('rsiChart').clientHeight);
});

// Theme toggle functionality
document.getElementById('themeToggle').addEventListener('click', () => {
    const bodyClassList = document.body.classList;
    const watchlist = document.getElementById('watchlist');
    const inputs = document.querySelectorAll('input, select');
    if (bodyClassList.contains('bg-white')) {
        bodyClassList.replace('bg-white', 'bg-gray-900');
        bodyClassList.replace('text-black', 'text-white');
        watchlist.classList.replace('bg-gray-100', 'bg-gray-800');
        watchlist.classList.replace('text-black', 'text-white');
        inputs.forEach(input => {
            input.classList.replace('bg-white', 'bg-gray-900');
            input.classList.replace('text-black', 'text-white');
        });
        chart.applyOptions({
            layout: {
                background: { type: 'solid', color: 'black' },
                textColor: 'white',
            },
            grid: {
                vertLines: {
                    color: 'black',
                },
                horzLines: {
                    color: 'black',
                },
            }
        });
        rsiChart.applyOptions({
            layout: {
                background: { type: 'solid', color: 'black' },
                textColor: 'white',
            },
            grid: {
                vertLines: {
                    color: 'black',
                },
                horzLines: {
                    color: 'black',
                },
            }
        });
    } else {
        bodyClassList.replace('bg-gray-900', 'bg-white');
        bodyClassList.replace('text-white', 'text-black');
        watchlist.classList.replace('bg-gray-800', 'bg-gray-100');
        watchlist.classList.replace('text-white', 'text-black');
        inputs.forEach(input => {
            input.classList.replace('bg-gray-900', 'bg-white');
            input.classList.replace('text-white', 'text-black');
        });
        chart.applyOptions({
            layout: {
                background: { type: 'solid', color: 'white' },
                textColor: 'black',
            },
            grid: {
                vertLines: {
                    color: '#e1e1e1',
                },
                horzLines: {
                    color: '#e1e1e1',
                },
            }
        });
        rsiChart.applyOptions({
            layout: {
                background: { type: 'solid', color: 'white' },
                textColor: 'black',
            },
            grid: {
                vertLines: {
                    color: '#e1e1e1',
                },
                horzLines: {
                    color: '#e1e1e1',
                },
            }
        });
    }
});

// Load watchlist symbols from the server
function loadWatchlist() {
    fetch('/api/symbols')
        .then(response => response.json())
        .then(symbols => {
            const watchlistItems = document.getElementById('watchlistItems');
            watchlistItems.innerHTML = '';
            symbols.forEach(symbol => {
                const item = document.createElement('div');
                item.className = 'watchlist-item';
                item.innerText = symbol;
                item.addEventListener('click', () => {
                    document.getElementById('ticker').value = symbol;
                    fetchData(symbol, document.getElementById('timeframe').value, document.getElementById('emaPeriod').value, document.getElementById('rsiPeriod').value);
                });
                watchlistItems.appendChild(item);
            });
        })
        .catch(error => {
            console.error('Error loading watchlist:', error);
        });
}

// Sync visible logical range between charts
function syncVisibleLogicalRange(chart1, chart2) {
    chart1.timeScale().subscribeVisibleLogicalRangeChange(timeRange => {
        chart2.timeScale().setVisibleLogicalRange(timeRange);
    });

    chart2.timeScale().subscribeVisibleLogicalRangeChange(timeRange => {
        chart1.timeScale().setVisibleLogicalRange(timeRange);
    });
}


syncVisibleLogicalRange(chart, rsiChart);

// Sync crosshair position between charts
function getCrosshairDataPoint(series, param) {
    if (!param.time) {
        return null;
    }
    const dataPoint = param.seriesData.get(series);
    return dataPoint || null;
}

function syncCrosshair(chart, series, dataPoint) {
    if (dataPoint) {
        chart.setCrosshairPosition(dataPoint.value, dataPoint.time, series);
        return;
    }
    chart.clearCrosshairPosition();
}

chart.subscribeCrosshairMove(param => {
    const dataPoint = getCrosshairDataPoint(candlestickSeries, param);
    syncCrosshair(rsiChart, rsiLine, dataPoint);
});

rsiChart.subscribeCrosshairMove(param => {
    const dataPoint = getCrosshairDataPoint(rsiLine, param);
    syncCrosshair(chart, candlestickSeries, dataPoint);
});

const tickerInput = document.getElementById('ticker');
const suggestionsDiv = document.getElementById('suggestions');

tickerInput.addEventListener('input', () => {
    const query = tickerInput.value.trim();
    if (query.length > 0) {
        fetch(`/api/search?q=${query}`)
            .then(response => response.json())
            .then(stocks => {
                if (stocks.length > 0) {
                    suggestionsDiv.innerHTML = '';
                    stocks.forEach(stock => {
                        const item = document.createElement('div');
                        item.className = 'p-2 hover:bg-gray-200 cursor-pointer';
                        item.textContent = `${stock.company_name} (${stock.symbol})`;
                        item.addEventListener('click', () => {
                            tickerInput.value = `${stock.symbol}.NS`;
                            suggestionsDiv.innerHTML = '';  // Clear suggestions
                            fetchData(tickerInput.value, document.getElementById('timeframe').value, document.getElementById('emaPeriod').value, document.getElementById('rsiPeriod').value);
                        });
                        suggestionsDiv.appendChild(item);
                    });
                    suggestionsDiv.classList.remove('hidden');
                } else {
                    suggestionsDiv.classList.add('hidden');
                }
            })
            .catch(error => console.error('Error fetching stock suggestions:', error));
    } else {
        suggestionsDiv.classList.add('hidden');
    }
});

document.getElementById('buyBtn').addEventListener('click', function () {
    const tradeType = document.getElementById('tradeType').value;
    const marketPrice = document.getElementById('marketPrice').checked;
    const triggerPriceBuy = document.getElementById('triggerPriceBuy').value;
    const stopLoss = document.getElementById('stopLoss').value;

    let feedback = "Buy order placed: ";
    feedback += `Trade Type: ${tradeType}, `;
    feedback += marketPrice ? "Market Price" : `Trigger Price: ${triggerPriceBuy}, `;
    if (stopLoss) feedback += `Stop Loss: ${stopLoss}`;

    document.getElementById('feedback').innerText = feedback;
});

document.getElementById('sellBtn').addEventListener('click', function () {
    const tradeType = document.getElementById('tradeType').value;
    const marketPrice = document.getElementById('marketPrice').checked;
    const triggerPriceSell = document.getElementById('triggerPriceSell').value;
    const stopLoss = document.getElementById('stopLoss').value;

    let feedback = "Sell order placed: ";
    feedback += `Trade Type: ${tradeType}, `;
    feedback += marketPrice ? "Market Price" : `Trigger Price: ${triggerPriceSell}, `;
    if (stopLoss) feedback += `Stop Loss: ${stopLoss}`;

    document.getElementById('feedback').innerText = feedback;
});

// Handle theme toggle
document.getElementById('themeToggle').addEventListener('click', function () {
    document.body.classList.toggle('bg-white');
    document.body.classList.toggle('bg-gray-900');
    document.body.classList.toggle('text-black');
    document.body.classList.toggle('text-white');
});

// Disable/Enable trigger price inputs based on Market Price checkbox
const marketPriceCheckbox = document.getElementById('marketPrice');
const triggerPriceBuy = document.getElementById('triggerPriceBuy');
const triggerPriceSell = document.getElementById('triggerPriceSell');

marketPriceCheckbox.addEventListener('change', function () {
    if (this.checked) {
        triggerPriceBuy.value = '';
        triggerPriceSell.value = '';
        triggerPriceBuy.disabled = true;
        triggerPriceSell.disabled = true;
    } else {
        triggerPriceBuy.disabled = false;
        triggerPriceSell.disabled = false;
    }
});

// Buy Button functionality
document.getElementById('buyBtn').addEventListener('click', function () {
    const tradeType = document.getElementById('tradeType').value;
    const quantity = document.getElementById('quantity').value;
    const marketPrice = marketPriceCheckbox.checked;
    const stopLoss = document.getElementById('stopLoss').value;

    if (!quantity || quantity <= 0) {
        document.getElementById('feedback').innerText = "Please enter a valid quantity.";
        return;
    }

    let feedback = "Buy order placed: ";
    feedback += `Trade Type: ${tradeType}, Quantity: ${quantity}, `;
    feedback += marketPrice ? "Market Price" : `Trigger Price: ${triggerPriceBuy.value}, `;
    if (stopLoss) feedback += `Stop Loss: ${stopLoss}`;

    document.getElementById('feedback').innerText = feedback;
});

// Sell Button functionality
document.getElementById('sellBtn').addEventListener('click', function () {
    const tradeType = document.getElementById('tradeType').value;
    const quantity = document.getElementById('quantity').value;
    const marketPrice = marketPriceCheckbox.checked;
    const stopLoss = document.getElementById('stopLoss').value;

    if (!quantity || quantity <= 0) {
        document.getElementById('feedback').innerText = "Please enter a valid quantity.";
        return;
    }

    let feedback = "Sell order placed: ";
    feedback += `Trade Type: ${tradeType}, Quantity: ${quantity}, `;
    feedback += marketPrice ? "Market Price" : `Trigger Price: ${triggerPriceSell.value}, `;
    if (stopLoss) feedback += `Stop Loss: ${stopLoss}`;

    document.getElementById('feedback').innerText = feedback;
});
