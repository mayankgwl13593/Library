//imports
const express = require("express");
const fs = require("fs");
let json2xls = require("json2xls");
var bodyParser = require("body-parser");
const { MongoClient, ServerApiVersion } = require("mongodb");
const https = require("https");
const app = express();
const port = 3000;

// mongo db
let collection;
const uri =
  "mongodb+srv://Mayank_gupta:ulXo51J0ROJ96J5k@cluster0.msw0i.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
client.connect((err) => {
  collection = client.db("library").collection("books");
  // perform actions on the collection object client.close();});
  //
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  //Static files
  app.use(express.static("public"));
  app.use("/css", express.static(__dirname + "public/css"));
  app.use("/js", express.static(__dirname + "public/js"));
  app.use("/img", express.static(__dirname + "public/img"));

  app.get("", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
  });

  app.get("/getbookList", (req, res) => {
    collection
      .find()
      .toArray()
      .then((result) => {
        res.send(
          !!result
            ? result
                .map((res) => {
                  const book = { Id: 0, Name: "", Author: "", Genre: "" };
                  book.Id = res.Id;
                  book.Name = res.Name;
                  book.Author = res.Author;
                  book.Genre = res.Genre;
                  return book;
                })
                .sort((a, b) => a.Id - b.Id)
            : []
        );
      });
  });

  app.get("/download", (req, res) => {
    collection
      .find()
      .toArray()
      .sort({ Id: 1 })
      .then((result) => {
        var xls = json2xls(result);
        fs.writeFileSync("data.xlsx", xls, "binary");
        file = `${__dirname}/data.xlsx`;
        console.log(file);
        const url = "data.xlsx";

        https.get(url, (res) => {
          // Image will be stored at this path
          const filePath = fs.createWriteStream(file);
          res.pipe(filePath);
          filePath.on("finish", () => {
            filePath.close();
            console.log("Download Completed");
          });
        });
      });
    res.send({ message: "File downloaded..." });
  });

  app.post("/postbookList", function (req, res) {
    collection.deleteMany({});
    if (req.body.length > 0) {
      collection
        .insertMany(req.body)
        .then((result) => {
          return res.send(result);
        })
        .catch((error) => console.error(error));
    } else {
      return res.send([]);
    }
  });
  app.patch("/updateBook", function (req, res) {
    const book = req.body;
    collection
      .update(
        { Id: book.Id },
        { $set: { Name: book.Name, Author: book.Author, Genre: book.Genre } }
      )
      .then((res) => {
        console.log(res);
      });
    res.send(collection.find({ Id: book.Id }));
  });
  app.delete("/deletBook", function (req, res) {});
  //Listen on port 3000
  app.listen(process.env.PORT || port, () => console.log(`Listening on port ${port}`));
  console.log("DB created...");
});
