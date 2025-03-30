import React, { useState, useEffect } from 'react';
import axios from 'axios';

function StockBasket({ userId }) {
    const [basket, setBasket] = useState([]);
    const [newSymbol, setNewSymbol] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchBasket() {
            try {
                const response = await axios.get(`http://127.0.0.1:5000/basket/${userId}`); // Replace with your Flask API URL
                setBasket(response.data);
            } catch (err) {
                setError(err.message);
            }
        }
        fetchBasket();
    }, [userId]);

    const handleAdd = async () => {
        try {
            await axios.post(`http://127.0.0.1:5000/basket/add/${userId}/${newSymbol}`); // Replace with your Flask API URL
            setBasket([...basket, newSymbol]);
            setNewSymbol('');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRemove = async (symbol) => {
        try {
            await axios.delete(`http://127.0.0.1:5000/basket/remove/${userId}/${symbol}`); // Replace with your Flask API URL
            setBasket(basket.filter((item) => item !== symbol));
        } catch (err) {
            setError(err.message);
        }
    };
    if (error) {
        return <div>Error: {error}</div>;
    }
 
    return (
        <div>
            <h2>My Stock Basket</h2>
            <ul>
                {basket.map((symbol) => (
                    <li key={symbol}>
                        {symbol}
                        <button onClick={() => handleRemove(symbol)}>Remove</button>
                    </li>
                ))}
            </ul>
            <input type="text" value={newSymbol} onChange={(e) => setNewSymbol(e.target.value)} />
            <button onClick={handleAdd}>Add</button>
        </div>
    );
}

export default StockBasket;