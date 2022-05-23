const express = require("express");
const { join } = require("path");
const { statSync, createReadStream } = require("fs");
const app = express();

app.use(express.static(__dirname));

app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

app.get("/video", (req, res) => {
    // make sure range is set
    const range = req.headers.range;
    if (!range) res.status(416).send("Requires Range header");

    // get video stats
    const videoPath = join(
        __dirname,
        "video/Fantastic.Beasts.The.Secrets.of.Dumbledore.2022.1080p.KORSUB.HDRip.x264.AAC2.0-SHITBOX.mp4"
    );
    const videoSize = statSync(videoPath).size;

    // Parse range. ex => "bytes=99999999998-
    const CHUNK_SIZE = 1024 * 1024; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    // create Headers
    const contentLength = end - start + 1;
    const headers = {
        "Content-Type": "video/mp4",
        "Content-Length": contentLength,
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
    };

    // http 206 Partial Content
    res.writeHead(206, headers);

    const videoStream = createReadStream(videoPath, { start, end });

    videoStream.pipe(res);
});

app.listen(8000, () => console.log("Listening on port 8000!"));
