const express = require("express");
const app = express();
const fs = require("fs");

const port = 3001;
app.get("/", (req, res) => {
  res.writeHead(200, { "Content-Type": "video/mp4" });
  let opStream = fs.createReadStream("./output.mp4");

  opStream.pipe(res);
});

app.listen(port, (err) => {
  if (!err) {
    console.log("Server running on port: " + port);
  } else {
    console.error("error!");
  }
});
