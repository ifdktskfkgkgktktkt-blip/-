const http = require("http");
const fs = require("fs");

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  fs.readFile("index.html", (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end("Error loading file");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(data);
  });
}).listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
