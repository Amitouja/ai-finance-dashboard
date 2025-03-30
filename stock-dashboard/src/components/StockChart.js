import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

function StockChart({ symbol }) {
    const [chartData, setChartData] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchChartData() {
            try {
                const response = await axios.get(`http://127.0.0.1:5000/stocks/historical/${symbol}`); // Replace with your Flask API URL
                const data = JSON.parse(response.data);
                const labels = data.data[0];
                const prices = data.data[1].map(item => item.Close);

                setChartData({
                    labels: labels,
                    datasets: [
                        {
                            label: `${symbol} Price`,
                            data: prices,
                            fill: false,
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1,
                        },
                    ],
                });
            } catch (err) {
                setError(err.message);
            }
        }
        fetchChartData();
    }, [symbol]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            {chartData.labels && <Line data={chartData} />}
        </div>
    );
}

export default StockChart;