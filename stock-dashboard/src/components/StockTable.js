import React, { useState, useEffect } from 'react';
import axios from 'axios';

function StockTable() {
    const [stocks, setStocks] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchStocks() {
            try {
                // Example: Fetch data for AAPL, GOOG, MSFT
                const symbols = ['AAPL', 'GOOG', 'MSFT'];
                const stockData = await Promise.all(
                    symbols.map(async (symbol) => {
                        const response = await axios.get(`http://127.0.0.1:5000/stocks/${symbol}`); // Replace with your Flask API URL
                        return response.data;
                    })
                );
                setStocks(stockData);
            } catch (err) {
                setError(err.message);
            }
        }
        fetchStocks();
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Stock Prices</h2>
            <table>
                <thead>
                    <tr>
                        <th>Symbol</th>
                        <th>Price</th>
                        {/* Add more columns as needed */}
                    </tr>
                </thead>
                <tbody>
                    {stocks.map((stock, index) => (
                        <tr key={index}>
                            <td>{stock.symbol}</td>
                            <td>{stock.regularMarketPrice}</td>
                            {/* Add more cells as needed */}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default StockTable;