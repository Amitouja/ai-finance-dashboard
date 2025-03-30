import React, { useState } from 'react';
import axios from 'axios';

function StockChat({ symbol }) {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [error, setError] = useState(null);

    const handleQueryChange = (event) => {
        setQuery(event.target.value);
    };

    const handleAsk = async () => {
        try {
            const result = await axios.get(`http://127.0.0.1:5000/stocks/chat/${symbol}/${query}`); // Replace with your Flask API URL
            setResponse(result.data.response);
        } catch (err) {
            setError(err.message);
        }
    };
    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <input type="text" value={query} onChange={handleQueryChange} />
            <button onClick={handleAsk}>Ask</button>
            <p>{response}</p>
        </div>
    );
}

export default StockChat;