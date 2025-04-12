import express from "express";
import puppeteer from "puppeteer";
import dotenv from "dotenv"

dotenv.config()

const app = express();
const PORT = process.env.PORT || 3000

app.get("/proxy", async (req, res) => {
  const { url } = req.query;

  if (!url) return res.status(400).send("Falta el parámetro 'url'");

  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    const content = await page.content();
    await browser.close();

    res.setHeader("Content-Type", "text/html");
    res.send(content);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error cargando la página con Puppeteer");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor Puppeteer en http://localhost:${PORT}`);
});
