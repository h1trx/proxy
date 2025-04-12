import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();
const PORT = 3000;

app.get("/proxy", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("Falta el parámetro 'url'");

  try {
    // Realiza la solicitud a la URL original sin validación
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15",
      },
    });

    // Verifica el tipo de contenido
    const contentType = response.headers.get("content-type");
    if (!contentType.includes("text/html")) {
      // Si no es HTML, simplemente devuelve el contenido tal cual (imágenes, PDFs, etc.)
      const buffer = await response.buffer();
      res.setHeader("Content-Type", contentType);
      return res.send(buffer);
    }

    // Obtén el contenido HTML
    const html = await response.text();
    const $ = cheerio.load(html);
    const baseUrl = new URL(url);

    // Reescribe las URLs de los recursos dentro del HTML
    $("a, link, script, img, iframe, source").each((_, el) => {
      const attrib = $(el).attr("href") ? "href" : "src";
      const val = $(el).attr(attrib);
      if (val && !val.startsWith("data:") && !val.startsWith("javascript:")) {
        const absoluteUrl = new URL(val, baseUrl).href;
        $(el).attr(attrib, `/proxy?url=${encodeURIComponent(absoluteUrl)}`);
      }
    });

    // Devuelve el HTML con las URLs reescritas
    res.setHeader("Content-Type", "text/html");
    res.send($.html()); // Devuelve todo el HTML modificado (pero con los recursos accesibles por el proxy)
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).send("Error al cargar la página: " + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Proxy inteligente en http://localhost:${PORT}`);
});
