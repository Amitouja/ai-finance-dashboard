from flask import Flask, jsonify, request
import yfinance as yf
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
import google.generativeai as genai
import os
from flask_cors import CORS
from dotenv import load_dotenv
import json

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
# Configure Gemini AI
genai.configure(api_key=("AIzaSyDx4llraaNo8c8MVz21gWfogGe8l6RsxD4"))

# Example user basket (replace with database integration)
user_baskets = {}

@app.route('/stocks/<symbol>', methods=['GET'])
def get_stock_data(symbol):
    try:
        stock = yf.Ticker(symbol)
        data = stock.info
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/stocks/historical/<symbol>', methods=['GET'])
def get_historical_data(symbol):
    try:
        stock = yf.Ticker(symbol)
        history = stock.history(period="1y")
        history_json = history.to_json(orient='split')
        return history_json
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/stocks/predict/<symbol>', methods=['GET'])
def predict_stock_price(symbol):
    try:
        stock = yf.Ticker(symbol)
        history = stock.history(period="1y")
        history = history[['Close']]
        history['Prediction'] = history[['Close']].shift(-1)
        history.dropna(inplace=True)

        X = np.array(history.drop(['Prediction'], axis=1)) # Corrected line
        y = np.array(history['Prediction'])
        model = LinearRegression()
        model.fit(X, y)
        prediction = model.predict(X[-1:])

        return jsonify({"prediction": prediction.tolist()})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/stocks/chat/<symbol>/<query>', methods=['GET'])
def stock_chat(symbol, query):
    try:
        stock = yf.Ticker(symbol)
        stock_info = stock.info
        history = stock.history(period="5d")
        recent_data = history.tail()

        model = genai.GenerativeModel('gemini-2.0-flash')
        prompt = f"""
        You are a financial assistant. Analyze the given stock and answer the user's question in a clear, concise, and conversational tone. 
        Ensure the response is structured in **pure JSON format** with no extra text, markdown, or code blocks.

        **Stock Details**:
        - **Stock Symbol**: {symbol}
        - **General Information**: {stock_info}
        - **Recent 5-Day Data**: {recent_data}

        **User Query**:
        "{query}"

        **Response Format (Strict JSON)**:
        {{
            "Stock Name": "<Name of the stock>",
            "Current Price": "<Latest closing price>",
            "Price Change": "<% change over the last day>",
            "Performance Summary": "<Brief performance summary>",
            "User Query Response": "<Direct answer to user's query>"
        }}

        **Important:**  
        - Do **NOT** include markdown, code blocks, or any extra text—only return the JSON object.  
        - Ensure valid JSON formatting.
        """
        response = model.generate_content(prompt)

        # Extract the response and ensure it's valid JSON
        response_text = response.text.strip()

        # If AI still returns a code block (e.g., ```json ... ```), clean it up
        if response_text.startswith("```json"):
            response_text = response_text[7:-3].strip()  # Remove first 7 and last 3 characters

        return jsonify(json.loads(response_text))  # Safely parse and return as JSON

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/basket/add/<user_id>/<symbol>', methods=['POST'])
def add_to_basket(user_id, symbol):
    if user_id not in user_baskets:
        user_baskets[user_id] = []
    user_baskets[user_id].append(symbol)
    return jsonify({"message": "Stock added to basket"})

@app.route('/basket/remove/<user_id>/<symbol>', methods=['DELETE'])
def remove_from_basket(user_id, symbol):
    if user_id in user_baskets and symbol in user_baskets[user_id]:
        user_baskets[user_id].remove(symbol)
        return jsonify({"message": "Stock removed from basket"})

@app.route('/basket/<user_id>', methods=['GET'])
def get_basket(user_id):
    if user_id in user_baskets:
        return jsonify(user_baskets[user_id])
    else:
        return jsonify([])

if __name__ == '__main__':
    app.run(debug=True)