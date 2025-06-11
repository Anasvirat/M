const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

const OUTPUT_DIR = path.join(__dirname, "dash_output");
const NAME = "starsports1tamil";
const INPUT_URL = "https://ts-j8bh.onrender.com/box.ts?id=4";
const OUTPUT_FILE = path.join(OUTPUT_DIR, `${NAME}.mpd`);

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// One-time convert route (manual trigger)
app.get("/convert", (req, res) => {
  const cmd = `ffmpeg -y -i "${INPUT_URL}" -t 900 -c:v libx264 -preset fast -b:v 1000k -c:a aac -b:a 128k -f dash -seg_duration 4 -use_template 1 -use_timeline 1 -init_seg_name ${NAME}-init.m4s -media_seg_name ${NAME}-$Number$.m4s "${OUTPUT_FILE}"`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error("FFmpeg error:", error.message);
      return res.status(500).send("FFmpeg failed. Check logs.");
    }
    res.send(`MPD created: /mpd/${NAME}.mpd`);
  });
});

// Serve MPD and segments directly
app.use("/mpd", express.static(OUTPUT_DIR));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
