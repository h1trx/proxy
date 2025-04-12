import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = 3000;

app.get("/proxy", async (req, res) => {
  const { url } = req.query;

  if (!url) return res.status(400).send("Falta el parámetro 'url'");

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15"
      }
    });

    const contentType = response.headers.get("content-type");
    res.setHeader("Content-Type", contentType);

    const body = await response.text();
    res.send(body);
  } catch (error) {
    res.status(500).send("Error al cargar la página: " + error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor proxy mostrando páginas en http://localhost:${PORT}`);
});
