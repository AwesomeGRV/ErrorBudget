const express = require('express');
const path = require('path');

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Main route - serve the error budget dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'error-budget.html'));
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Error Budget Dashboard running on http://localhost:${PORT}`);
});
