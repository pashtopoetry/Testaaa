import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import https from "https";
import http from "http";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Telegram video resolver API - fetches public embed page and extracts direct .mp4 source url
  app.get("/api/telegram-resolve", async (req, res) => {
    const telegramUrl = req.query.url as string;
    if (!telegramUrl) return res.status(400).json({ error: "د ټیلیګرام لینک تش دی." });

    // 1. Detect Private Channel Links
    if (telegramUrl.includes("/t.me/c/") || telegramUrl.includes("/telegram.me/c/")) {
      return res.status(400).json({ 
        error: "دا یو شخصي (Private) چینل لینک دی. ټیلیګرام د امنیت له امله شخصي لینکونو مستقیم غږولو ته اجازه نه ورکوي. مهرباني وکړئ یو عامه (Public) چینل وکاروئ." 
      });
    }

    if (!telegramUrl.includes("t.me/") && !telegramUrl.includes("telegram.me/")) {
      return res.status(400).json({ 
        error: "مهرباني وکړئ یو سم او معتبر د ټیلیګرام لینک داخل کړئ." 
      });
    }

    try {
      let cleanUrl = telegramUrl.split("?")[0];
      // Normalize t.me/s/channel to t.me/channel
      cleanUrl = cleanUrl.replace("/t.me/s/", "/t.me/");
      const embedUrl = `${cleanUrl}?embed=1`;

      // Set cookie to bypass Telegram's timezone widget check
      const timezoneOffset = new Date().getTimezoneOffset();
      const cookie = `stel_dt=${timezoneOffset};`;

      const response = await fetch(embedUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Cookie": cookie,
          "Accept-Language": "en-US,en;q=0.9",
          "Referer": cleanUrl
        }
      });
      const html = await response.text();

      // Check for common Telegram errors in HTML response
      if (html.includes("Post not found") || html.includes("Widget message error")) {
        return res.status(404).json({
          error: "دا د ټیلیګرام پوسټ پیدا نه شو. مهرباني وکړئ ډاډ ترلاسه کړئ چې پوسټ آی ډي سمه ده او چینل عامه (Public) دی."
        });
      }

      if (html.includes("Channel not found") || html.includes("Invite link expired")) {
        return res.status(404).json({
          error: "د ټیلیګرام چینل پیدا نه شو یا د بلنې لینک تېر شوی دی."
        });
      }

      // Robust regex for matching video src with single or double quotes
      const videoMatch = html.match(/<video[^>]*src=["']([^"']*)["']/i);
      let videoUrl = videoMatch ? videoMatch[1] : null;

      if (!videoUrl) {
        const sourceMatch = html.match(/<source[^>]*src=["']([^"']*)["']/i);
        videoUrl = sourceMatch ? sourceMatch[1] : null;
      }

      // Scanner Fallback: Scan all HTTP/HTTPS links inside the HTML for telescope .mp4 links if standard matches failed
      if (!videoUrl) {
        const allUrls = html.match(/https?:\/\/[^\s"'`<>]+/g) || [];
        const mp4Link = allUrls.find(u => (u.includes("telesco.pe") || u.includes("telegram.org")) && u.includes(".mp4"));
        if (mp4Link) {
          videoUrl = mp4Link;
        }
      }

      if (videoUrl) {
        // Decode HTML entities
        videoUrl = videoUrl.replace(/&amp;/g, "&");
        return res.json({ ok: true, videoUrl });
      }

      // If no video tag was found, check if it's because the file is too big
      if (html.includes("tgme_widget_message_document") || html.includes("View in Telegram")) {
        return res.status(400).json({
          error: "دا ویډیو ډیره لویه ده (د ۲۰ ام بي څخه زیاته). ټیلیګرام لویې ویډیوګانې په ویب پاڼو کې مستقیم چلولو ته نه پریږدي، نو دا به د چوکاټ (Iframe) په شکل خلاصه شي."
        });
      }

      return res.status(404).json({ 
        error: "په دې ټیلیګرام پوسټ کې هیڅ مستقیمه ویډیو پیدا نه شوه. ډاډ ترلاسه کړئ چې دا د ویډیو پوسټ دی." 
      });
    } catch (err: any) {
      console.error("Telegram resolve error:", err);
      return res.status(500).json({ 
        error: "د ټیلیګرام د لینک پېژندلو پر مهال کومه ستونزه رامنځته شوه. مهرباني وکړئ وروسته هڅه وکړئ." 
      });
    }
  });

  // 2. High-performance Telegram video stream proxy - supports range requests (for player seekbar seeking)
  app.get("/api/telegram-proxy", (req, res) => {
    const videoUrl = req.query.url as string;
    if (!videoUrl) return res.status(400).send("Missing URL");

    try {
      const parsedUrl = new URL(videoUrl);
      const options: https.RequestOptions = {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        }
      };

      if (req.headers.range) {
        options.headers!["Range"] = req.headers.range;
      }

      const lib = parsedUrl.protocol === "https:" ? https : http;
      const proxyReq = lib.request(videoUrl, options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 200, {
          "Content-Type": proxyRes.headers["content-type"] || "video/mp4",
          "Content-Length": proxyRes.headers["content-length"] || "",
          "Content-Range": proxyRes.headers["content-range"] || "",
          "Accept-Ranges": proxyRes.headers["accept-ranges"] || "bytes",
          "Cache-Control": proxyRes.headers["cache-control"] || "public, max-age=3600",
          "Access-Control-Allow-Origin": "*",
        });
        proxyRes.pipe(res);
      });

      proxyReq.on("error", (err) => {
        console.error("Proxy streaming error:", err);
        if (!res.headersSent) {
          res.status(500).send("Streaming error");
        }
      });

      proxyReq.end();
    } catch (err: any) {
      console.error("Proxy general error:", err);
      if (!res.headersSent) {
        res.status(500).send("Invalid video URL or stream error");
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
