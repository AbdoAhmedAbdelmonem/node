// server.js
const http = require('http');
const fs = require('fs');
const url = require('url');

const server = http.createServer((req, res) => {

  // Allow CORS for requests from your frontend (or use specific origin instead of '*')
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.url && req.url.startsWith('/calc')) {
    const query = url.parse(req.url, true).query;
    const n1 = Number(query.n1) || 0;
    const n2 = Number(query.n2) || 0;

    const result = n1 + n2;

    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end(result.toString());
  }

  if (req.url === "/" || req.url === "/index.html") {
    fs.readFile("index.html", (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end("Error loading index.html");
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
    return;
  }

  // 404
  res.writeHead(404);
  res.end("Not found");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
