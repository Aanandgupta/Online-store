const fs = require("fs");

const ReqHandler = (req, res) => {
  const url = req.url;

  if (url === "/") {
    res.write("<html>");
    res.write("<head>");
    res.write("<title>");
    res.write("test");
    res.write("</title>");
    res.write("</head>");

    res.write("<body>");
    res.write(
      "<form method='POST' action='/message'><input name='message type='text'><button type='submit'>Send</button></input>"
    );
    res.write("</form>");
    res.write("</body>");

    res.write("</html>");

    return res.end();
  }
  const method = req.method;
  if (url === "/message" && method == "POST") {
    const body = [];

    req.on("data", (chunk) => {
      body.push(chunk);
    });

    return req.on("end", () => {
      let message = Buffer.concat(body).toString();
      fs.writeFile("message.txt", message.split("=")[1], (err) => {
        res.statusCode = 302;
        res.setHeader("Location", "/");
        return res.end();
      });
    });
  }
  // console.log(req.url, req.method, req.headers);

  res.setHeader("Content-Type", "text/html");
  res.write("<html> <body><h1>Hello From My NodeJs Server</h1></body> </html>");
  res.end();
};

module.exports = ReqHandler;
