import React, { useState, useEffect } from 'react';
import axios from 'axios';

function StockPrediction({ symbol }) {
    const [prediction, setPrediction] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchPrediction() {
            try {
                const response = await axios.get(`http://127.0.0.1:5000/stocks/predict/${symbol}`); // Replace with your Flask API URL
                setPrediction(response.data.prediction[0]);
            } catch (err) {
                setError(err.message);
            }
        }
        fetchPrediction();
    }, [symbol]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            {prediction !== null && <p>Predicted Price: {prediction}</p>}
        </div>
    );
}

export default StockPrediction;