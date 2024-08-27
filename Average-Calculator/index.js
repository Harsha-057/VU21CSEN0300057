// {
//     "companyName": "goMart",
//     "clientID": "9dbe2daf-f074-494a-85aa-2409c7b64b32",
//     "clientSecret": "ZfsWTedcZUeYsKfs",
//     "ownerName": "Harsha",
//     "ownerEmail": "hsambang@gitam.in",
//     "rollNo": "VU21CSEN0300057"
// }
// {
//     "token_type": "Bearer",
//     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzI0NzM3MTY3LCJpYXQiOjE3MjQ3MzY4NjcsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjlkYmUyZGFmLWYwNzQtNDk0YS04NWFhLTI0MDljN2I2NGIzMiIsInN1YiI6ImhzYW1iYW5nQGdpdGFtLmluIn0sImNvbXBhbnlOYW1lIjoiZ29NYXJ0IiwiY2xpZW50SUQiOiI5ZGJlMmRhZi1mMDc0LTQ5NGEtODVhYS0yNDA5YzdiNjRiMzIiLCJjbGllbnRTZWNyZXQiOiJaZnNXVGVkY1pVZVlzS2ZzIiwib3duZXJOYW1lIjoiSGFyc2hhIiwib3duZXJFbWFpbCI6ImhzYW1iYW5nQGdpdGFtLmluIiwicm9sbE5vIjoiVlUyMUNTRU4wMzAwMDU3In0.NdLoOf50xETcGySoCtFVnlcR9hUirtueo3LD72gjcac",
//     "expires_in": 1724737167
// }

const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
const TIMEOUT = 50000; 
let STORAGE = [];

const CREDENTIALS = {
        "companyName": "goMart",
        "clientID": "9dbe2daf-f074-494a-85aa-2409c7b64b32",
        "clientSecret": "ZfsWTedcZUeYsKfs",
        "ownerName": "Harsha",
        "ownerEmail": "hsambang@gitam.in",
        "rollNo": "VU21CSEN0300057"
};

let accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzI0NzM3MTY3LCJpYXQiOjE3MjQ3MzY4NjcsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjlkYmUyZGFmLWYwNzQtNDk0YS04NWFhLTI0MDljN2I2NGIzMiIsInN1YiI6ImhzYW1iYW5nQGdpdGFtLmluIn0sImNvbXBhbnlOYW1lIjoiZ29NYXJ0IiwiY2xpZW50SUQiOiI5ZGJlMmRhZi1mMDc0LTQ5NGEtODVhYS0yNDA5YzdiNjRiMzIiLCJjbGllbnRTZWNyZXQiOiJaZnNXVGVkY1pVZVlzS2ZzIiwib3duZXJOYW1lIjoiSGFyc2hhIiwib3duZXJFbWFpbCI6ImhzYW1iYW5nQGdpdGFtLmluIiwicm9sbE5vIjoiVlUyMUNTRU4wMzAwMDU3In0.NdLoOf50xETcGySoCtFVnlcR9hUirtueo3LD72gjcac";
const API_ENDPOINTS = {
    p: 'http://20.244.56.144/test/primes',
    f: 'http://20.244.56.144/test/fibo',
    e: 'http://20.244.56.144/test/even',
    r: 'http://20.244.56.144/test/rand'
};

const getAccessToken = async () => {
    try {
        const response = await axios.post('http://20.244.56.144/test/auth', {
            companyName: CREDENTIALS.companyName,
            clientID: CREDENTIALS.clientID,
            clientSecret: CREDENTIALS.clientSecret,
            ownerName: CREDENTIALS.ownerName,
            ownerEmail: CREDENTIALS.ownerEmail,
            rollNo: CREDENTIALS.rollNo
        });
        accessToken = response.data.access_token;
    } catch (error) {
        console.error('Error fetching access token:', error.message);
    }
};

const fetchNumbers = async (type) => {
    try {
        const response = await axios.get(API_ENDPOINTS[type], {
            headers: { 'Authorization': `Bearer ${accessToken}` },
            timeout: TIMEOUT
        });
        return response.data.numbers;
    } catch (error) {
        console.error(`Error fetching ${type} numbers:`, error.message);
        return [];
    }
};

app.get('/numbers/:numberid', async (req, res) => {
    const numberid = req.params.numberid;
    if (!['p', 'f', 'e', 'r'].includes(numberid)) {
        return res.status(400).json({ error: 'Invalid number type' });
    }

    const start = Date.now();
    const newNumbers = await fetchNumbers(numberid);
    const end = Date.now();

    if (end - start > TIMEOUT) {
        return res.status(504).json({ error: 'Timeout exceeded while fetching numbers' });
    }
    const uniqueNewNumbers = [...new Set(newNumbers)];
    const windowPrevState = [...STORAGE];
    uniqueNewNumbers.forEach(number => {
        if (!STORAGE.includes(number)) {
            if (STORAGE.length >= WINDOW_SIZE) {
                STORAGE.shift(); 
            }
            STORAGE.push(number);
        }
    });

    const windowCurrState = [...STORAGE];
    const avg = (STORAGE.length === 0) ? 0 : STORAGE.reduce((a, b) => a + b, 0) / STORAGE.length;

    res.json({
        windowPrevState,
        windowCurrState,
        numbers: uniqueNewNumbers,
        avg: avg.toFixed(2)
    });
});

app.listen(PORT, async () => {
    await getAccessToken();
    console.log(`Server is running on http://localhost:${PORT}`);
});
