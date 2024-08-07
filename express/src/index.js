const express = require("express");
const bodyParser = require("body-parser");
const PDFDocument = require("pdfkit");
const path = require("path");

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.get("/generate-certificate/", async (req, res) => {
  const { fullName, courseName, completionAt } = req.query;

  if (!fullName || !courseName || !completionAt) {
    return res.status(400).send("Missing required fields");
  }

  const formattedDate = new Date(completionAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const buffers = [];

  // Create a document
  const doc = new PDFDocument({ layout: "landscape", bufferPages: true });

  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {
    const pdfData = Buffer.concat(buffers);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfData.length,
    });
    res.send(pdfData);
  });

  // Add a background image
  const imagePath = path.join(__dirname, "assets/background.png");
  doc.image(imagePath, 0, 0, {
    width: doc.page.width,
    height: doc.page.height,
    opacity: 0.3,
  });

  // Add some styling and content
  doc
    .fontSize(45)
    .text("Certificate of Completion", { align: "center" })
    .moveDown()
    .fontSize(25)
    .text(
      `This is to certify that ${fullName} has successfully completed the course ${courseName} online course on ${formattedDate}`,
      { align: "center" },
    );

  doc.end();
});

app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}`);
});
