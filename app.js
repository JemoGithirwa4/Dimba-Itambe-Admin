import express from "express";
import bodyParser from "body-parser";

const PORT = process.env.PORT || 3006;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("home.ejs", { activePage: "latest" });
});

app.get("/posts", (req, res) => {
    res.render("posts.ejs", { activePage: "latest" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});