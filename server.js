// server.js
const http = require('http');
const fs = require('fs');
const url = require('url');
const mysql = require('mysql2');

// ----------- DB CONNECTION -----------
const db = mysql.createPool({
  host: "shuttle.proxy.rlwy.net",
  port: 20268,
  user: "root",
  password: "SPkOekSqVXulizfOcNXvEvqmfNTefIWP",
  database: "railway"
});

// ----------- SERVER -----------
const server = http.createServer((req, res) => {

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const parsed = url.parse(req.url, true);
  const path = parsed.pathname;
  const q = parsed.query;

  // ----------- GET ALL USERS -----------
  if (path === "/users") {
    db.query("SELECT * FROM USER", (err, rows) => {
      if (err) {
        res.writeHead(500);
        return res.end("DB Error");
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(rows));
    });
    return;
  }

  // ----------- ADD USER -----------
  if (path === "/add") {
    const name = q.name;
    if (!name) {
      res.writeHead(400);
      return res.end("name is required");
    }

    db.query("INSERT INTO USER (name) VALUES (?)", [name], (err) => {
      if (err) {
        res.writeHead(500);
        return res.end("DB Error");
      }

      res.writeHead(200);
      return res.end("User added");
    });
    return;
  }

  // ----------- UPDATE USER -----------
  if (path === "/update") {
    const id = q.id;
    const name = q.name;

    if (!id || !name) {
      res.writeHead(400);
      return res.end("id and name are required");
    }

    db.query("UPDATE USER SET name=? WHERE id=?", [name, id], (err) => {
      if (err) {
        res.writeHead(500);
        return res.end("DB Error");
      }
      res.writeHead(200);
      return res.end("User updated");
    });
    return;
  }

  // ----------- DELETE USER -----------
  if (path === "/delete") {
    const id = q.id;

    if (!id) {
      res.writeHead(400);
      return res.end("id is required");
    }

    db.query("DELETE FROM USER WHERE id=?", [id], (err) => {
      if (err) {
        res.writeHead(500);
        return res.end("DB Error");
      }
      res.writeHead(200);
      return res.end("User deleted");
    });
    return;
  }

  // ----------- SERVE index.html -----------
  if (path === "/" || path === "/index.html") {
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

  // ----------- 404 -----------
  res.writeHead(404);
  res.end("Not found");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server running on port " + PORT));


// // server.js
// const http = require('http');
// const fs = require('fs');
// const url = require('url');

// const server = http.createServer((req, res) => {

//   // Allow CORS for requests from your frontend (or use specific origin instead of '*')
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");

//   // handle preflight
//   if (req.method === 'OPTIONS') {
//     res.writeHead(204);
//     return res.end();
//   }

//   if (req.url && req.url.startsWith('/calc')) {
//     const query = url.parse(req.url, true).query;
//     const n1 = Number(query.n1) || 0;
//     const n2 = Number(query.n2) || 0;

//     const result = n1 + n2;

//     res.writeHead(200, { "Content-Type": "text/plain" });
//     return res.end(result.toString());
//   }

//   if (req.url === "/" || req.url === "/index.html") {
//     fs.readFile("index.html", (err, data) => {
//       if (err) {
//         res.writeHead(500);
//         return res.end("Error loading index.html");
//       }
//       res.writeHead(200, { "Content-Type": "text/html" });
//       res.end(data);
//     });
//     return;
//   }

//   // 404
//   res.writeHead(404);
//   res.end("Not found");
// });

// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

