// app.js
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const app = express();
const cors = require("cors");
const { log } = require("console");
const port = 3001;

app.use(cors());

// Configure multer to handle the audio file uploads
const upload = multer({
  dest: "uploads/", // The directory where the audio files will be temporarily stored
});

// POST endpoint to handle the audio file upload
app.post("/upload-audio", upload.single("audioFile"), (req, res) => {
  console.log(req);
  if (!req.file) {
    return res.status(400).json({ error: "No audio file received" });
  }

  // Get the original file extension from the uploaded file
  const originalExtension = path.extname(req.file.originalname);

  // Create a new file name for the uploaded audio (you can customize this as needed)
  const newFileName = `${Date.now()}${originalExtension}`;

  // Create the destination path where the file will be saved
  const destinationPath = path.join(__dirname, "uploads", newFileName);

  // Read the temporary file and save it to the destination path
  fs.readFile(req.file.path, (err, data) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Failed to read the uploaded file" });
    }

    // Save the data to the destination file
    fs.writeFile(destinationPath, data, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Failed to save the file to the server" });
      }

      // Delete the temporary file after successful save
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error("Failed to delete the temporary file:", err);
        }
      });

      // Respond with a success message
      res.json({ message: "Audio file uploaded and saved successfully!" });
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
