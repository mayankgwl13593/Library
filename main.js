//imports
const express = require("express");
const fs = require("fs");
let json2xls = require("json2xls");
var bodyParser = require("body-parser");
const app = express();
const port = 3000;

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
app.get("/add", (req, res) => {
  res.sendFile(__dirname + "/views/add-book.html");
});
app.get("/getbookList", (req, res) => {
  fs.readFile("public/books-data.json", "utf8", function (err, data) {
    if (err) throw err;
    res.send(!!data ? JSON.parse(data) : []);
  });
});
app.get("/download", (req, res) => {
  fs.readFile("public/books-data.json", "utf8", function (err, data) {
    let file;
    if (!!data) {
      if (err) throw err;
      var xls = json2xls(JSON.parse(data));
      fs.writeFileSync("data.xlsx", xls, "binary");
      file= `${__dirname}/data.xlsx`;
      res.download(file, function(err) {
        if(err) {
            console.log(err);
        }
    }); // Set disposition and send it.
     
    }
    res.send({message:'File downloaded...'});
  });
});
app.post("/postbookList", function (req, res) {
  fs.writeFile("public/books-data.json", JSON.stringify(req.body), (err) => {
    // Checking for errors
    if (err) throw err;
    console.log("Done writing"); // Success
  });

  return res.send(req.body);
});
app.delete('/deletBook',function(req,res){
 
})
//Listen on port 3000
app.listen(process.env.PORT || port, () => console.log(`Listening on port ${port}`));
