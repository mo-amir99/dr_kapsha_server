const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());
app.get("/videos/:filename", (req, res) => {
  const filePath = path.join(__dirname, "videos", req.params.filename);

  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      return res.status(404).send("Video not found.");
    }

    const range = req.headers.range;
    const fileSize = stats.size;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      const chunkSize = end - start + 1;
      const file = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "video/mp4",
      });

      file.pipe(res);
    } else {
      // Send the entire file if no range is specified
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      });
      fs.createReadStream(filePath).pipe(res);
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// const express = require("express");
// const multer = require("multer");
// const fs = require("fs");
// const path = require("path");
// const app = express();
// const PORT = 3000; // Change this to your preferred port

// // Define the storage location for the videos
// const videoDirectory = path.join(__dirname, "videos");
// if (!fs.existsSync(videoDirectory)) {
//   fs.mkdirSync(videoDirectory);
// }

// // Configure Multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, videoDirectory);
//   },
//   filename: (req, file, cb) => {
//     // Save the file with its original name
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const upload = multer({ storage });

// const videoStorage = multer.diskStorage({
//   destination: "videos", // Destination to store video
//   filename: (req, file, cb) => {
//     cb(
//       null,
//       file.fieldname + "_" + Date.now() + path.extname(file.originalname)
//     );
//   },
// });

// const videoUpload = multer({
//   storage: videoStorage,
//   limits: {
//     fileSize: 10000000, // 10000000 Bytes = 10 MB
//   },
//   fileFilter(req, file, cb) {
//     // upload only mp4 and mkv format
//     if (!file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) {
//       return cb(new Error("Please upload a video"));
//     }
//     cb(undefined, true);
//   },
// });

// app.get("/", (req, res) => {
//   res.send("Hello");
// });

// // Endpoint for uploading a video
// app.post("/upload", videoUpload.single("video"), (req, res) => {
//   print(req.file);
//   print("test");
//   if (!req.file) {
//     return res.status(400).send("No file uploaded.");
//   }

//   // File saved successfully
//   res.status(200).send("File uploaded successfully.");
// });

// // Endpoint for listing all available videos
// app.get("/videos", (req, res) => {
//   fs.readdir(videoDirectory, (err, files) => {
//     if (err) {
//       return res.status(500).send("Failed to read video directory.");
//     }
//     // Return a list of files (metadata can be added here)
//     const videoList = files.map((file) => ({
//       name: file,
//       url: `${req.protocol}://${req.get("host")}/videos/${file}`,
//     }));
//     res.json(videoList);
//   });
// });

// // Endpoint for streaming a video
// app.get("/videos/:filename", (req, res) => {
//   const filePath = path.join(videoDirectory, req.params.filename);

//   fs.stat(filePath, (err, stats) => {
//     if (err || !stats.isFile()) {
//       return res.status(404).send("Video not found.");
//     }

//     // Streaming video
//     const range = req.headers.range;
//     const fileSize = stats.size;
//     const CHUNK_SIZE = 10 ** 6; // 1MB per chunk

//     if (range) {
//       // Range header present, handle partial content
//       const parts = range.replace(/bytes=/, "").split("-");
//       const start = parseInt(parts[0], 10);
//       const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

//       const contentLength = end - start + 1;
//       const headers = {
//         "Content-Range": `bytes ${start}-${end}/${fileSize}`,
//         "Accept-Ranges": "bytes",
//         "Content-Length": contentLength,
//         "Content-Type": "video/mp4",
//       };

//       res.writeHead(206, headers);
//       const videoStream = fs.createReadStream(filePath, { start, end });
//       videoStream.pipe(res);
//     } else {
//       // No range header, send the whole file
//       const headers = {
//         "Content-Length": fileSize,
//         "Content-Type": "video/mp4",
//       };

//       res.writeHead(200, headers);
//       fs.createReadStream(filePath).pipe(res);
//     }
//   });
// });

// // Start the server
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
