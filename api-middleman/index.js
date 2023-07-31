const express = require("express"),
  rateLimit = require("express-rate-limit"),
  https = require("https"),
  SERVER_PORT = 2932,
  app = express(),
  x = "https://relist.axorax.repl.co/",
  limiter = rateLimit({
    windowMs: 1000,
    max: 30,
    handler: (request, response, next) => {
      response.status(429).json({
        error: true,
        status: 429,
        message: "Too many requests!",
      });
    },
  });

app.set("json spaces", 4);
app.use(limiter);
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  next();
});

app.get("/:url*", (req, res) => {
  const { url } = req.params;
  const requestUrl = `${x}${url}${req.url.replace(`/${url}`, "")}`;
  https
    .get(requestUrl, (response) => {
      let data = "";

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        try {
          const jsonData = JSON.parse(data);
          res.json(jsonData);
        } catch (error) {
          res.status(500).json({ error: true });
        }
      });
    })
    .on("error", (error) => {
      res.status(500).json({ error: true });
    });
});

app.listen(SERVER_PORT, () => {
  console.log(`Server is running on port http://localhost:${SERVER_PORT}`);
});
