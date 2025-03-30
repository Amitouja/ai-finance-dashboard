import React, { useState } from "react";
import { 
  Container, Typography, TextField, Button, Card, CardContent, Grid, List, ListItem, Modal, Box, IconButton, AppBar, Toolbar, Switch
} from "@mui/material";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import CloseIcon from '@mui/icons-material/Close';
import moment from "moment";

const StockDashboard = () => {
  const [symbol, setSymbol] = useState("");
  const [stockData, setStockData] = useState(null);
  const [history, setHistory] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [chatQuery, setChatQuery] = useState("");
  const [chatResponse, setChatResponse] = useState(null);
  const [chatSymbol, setChatSymbol] = useState("");
  const [openChat, setOpenChat] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const fetchStockData = async () => {
    const response = await fetch(`http://127.0.0.1:5000/stocks/${symbol}`);
    const data = await response.json();
    setStockData(data);
  };

  const fetchHistoricalData = async () => {
    const response = await fetch(`http://127.0.0.1:5000/stocks/historical/${symbol}`);
    const data = await response.json();
    
    const parsedHistory = data.index.map((timestamp, index) => ({
      name: moment(parseInt(timestamp)).format("MMM DD, YYYY"),
      price: data.data[index][0],
    }));
    setHistory(parsedHistory);
  };

  const predictStockPrice = async () => {
    const response = await fetch(`http://127.0.0.1:5000/stocks/predict/${symbol}`);
    const data = await response.json();
    setPrediction(data.prediction);
  };

  const fetchChatResponse = async () => {
    const response = await fetch(`http://127.0.0.1:5000/stocks/chat/${chatSymbol}/${chatQuery}`);
    const data = await response.json();
    setChatResponse(data);
  };

  return (
    <Box sx={{ backgroundColor: darkMode ? "#121212" : "#f5f5f5", minHeight: "100vh", color: darkMode ? "#fff" : "#000" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>FinSight</Typography>
          <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>Stock Market Dashboard</Typography>
        <TextField
          label="Enter Stock Symbol"
          variant="outlined"
          fullWidth
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          sx={{ mb: 2 }}
        />
        <Grid container spacing={2}>
          <Grid item xs={4}><Button variant="contained" onClick={fetchStockData}>Get Stock Data</Button></Grid>
          <Grid item xs={4}><Button variant="contained" onClick={fetchHistoricalData}>Get Historical Data</Button></Grid>
          <Grid item xs={4}><Button variant="contained" onClick={predictStockPrice}>Predict Price</Button></Grid>
        </Grid>
        {stockData && (
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6">Stock Information</Typography>
              <Typography>Name: {stockData.longName}</Typography>
              <Typography>Price: ${stockData.regularMarketPrice}</Typography>
              <Typography>52 Week High: ${stockData.fiftyTwoWeekHigh}</Typography>
            </CardContent>
          </Card>
        )}
        {history.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={history}>
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `$${value.toFixed(2)}`} />
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <CartesianGrid stroke="#ccc" />
              <Line type="monotone" dataKey="price" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        )}
        {prediction && (
          <Typography variant="h6" sx={{ mt: 2 }}>
            Predicted Price: ${prediction[0].toFixed(2)}
          </Typography>
        )}
        <Button variant="contained" sx={{ mt: 4 }} onClick={() => setOpenChat(true)}>Open Chat</Button>
        <Modal open={openChat} onClose={() => setOpenChat(false)}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2 }}>
            <IconButton onClick={() => setOpenChat(false)} sx={{ position: 'absolute', top: 8, right: 8 }}>
              <CloseIcon />
            </IconButton>
            <Typography variant="h5" sx={{ mb: 2 }}>Stock Chat</Typography>
            <TextField label="Enter Stock Symbol" variant="outlined" fullWidth value={chatSymbol} onChange={(e) => setChatSymbol(e.target.value.toUpperCase())} sx={{ mb: 2 }} />
            <TextField label="Ask a Question" variant="outlined" fullWidth value={chatQuery} onChange={(e) => setChatQuery(e.target.value)} sx={{ mb: 2 }} />
            <Button variant="contained" onClick={fetchChatResponse}>Ask</Button>
            {chatResponse && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6">AI Response</Typography>
                  <Typography><strong>Stock Name:</strong> {chatResponse["Stock Name"]}</Typography>
                  <Typography><strong>Current Price:</strong> ${chatResponse["Current Price"]}</Typography>
                  <Typography><strong>Price Change:</strong> {chatResponse["Price Change"]}</Typography>
                  <Typography><strong>Performance Summary:</strong> {chatResponse["Performance Summary"]}</Typography>
                  <Typography><strong>User Query Response:</strong> {chatResponse["User Query Response"]}</Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        </Modal>
      </Container>
    </Box>
  );
};

export default StockDashboard;