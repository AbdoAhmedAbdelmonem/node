const http = require('http');
const fs = require('fs');

// Simple math operation
const mathResult = 543 + 5;

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    // Send the HTML file
    fs.readFile('index.html', (err, data) => {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(data);
    });
  } else if (req.url === '/result') {
    // Send the math result
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(mathResult.toString());
  }
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});