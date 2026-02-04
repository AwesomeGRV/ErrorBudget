const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.url === '/' || req.url === '/dashboard') {
        // Serve the dashboard HTML
        fs.readFile(path.join(__dirname, 'dashboard.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading dashboard');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else if (req.url === '/api/services') {
        // Mock API for services
        const services = [
            {
                id: 1,
                name: 'Payment Service',
                team: 'Fintech',
                environment: 'Production',
                errorBudget: 85,
                status: 'healthy',
                sli: 99.9,
                slo: 99.5
            },
            {
                id: 2,
                name: 'User Service',
                team: 'Platform',
                environment: 'Production',
                errorBudget: 45,
                status: 'warning',
                sli: 99.2,
                slo: 99.5
            },
            {
                id: 3,
                name: 'Notification Service',
                team: 'Platform',
                environment: 'Production',
                errorBudget: 15,
                status: 'critical',
                sli: 98.5,
                slo: 99.0
            },
            {
                id: 4,
                name: 'API Gateway',
                team: 'Infrastructure',
                environment: 'Production',
                errorBudget: 92,
                status: 'healthy',
                sli: 99.95,
                slo: 99.9
            }
        ];
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(services));
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

const PORT = 3003;
server.listen(PORT, () => {
    console.log(`Error Budget Dashboard running on http://localhost:${PORT}`);
    console.log(`Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`API: http://localhost:${PORT}/api/services`);
});
