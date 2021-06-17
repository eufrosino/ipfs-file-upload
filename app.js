const { create } = require("ipfs-http-client");
const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const app = express();
const port = 3000;

const ipfs = create();

// View engine
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

const addFile = async (fileName, filePath) => {
  const file = fs.readFileSync(filePath);
  const { cid } = await ipfs.add({ path: fileName, content: file });

  return cid;
};

app.get("/", (req, res) => {
  res.render("home");
});

app.post("/upload", (req, res) => {
  const file = req.files.file;
  const fileName = req.body.fileName;
  const filePath = `files/${fileName}`;

  file.mv(filePath, async (err) => {
    if (err) {
      console.log("Error: failed to download the file");
      return res.status(500).send(err);
    }

    const fileHash = await addFile(fileName, filePath);
    fs.unlink(filePath, (err) => {
      if (err) console.log(err);
    });

    res.render("upload", { fileName, fileHash });
  });
});

app.listen(port, () => {
  console.log(`Server is listening on ${port}...`);
});
