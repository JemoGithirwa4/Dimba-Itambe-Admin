import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const PORT = process.env.PORT || 3006;

const app = express();

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "dimbaitambe",
    password: "@Kukurella17",
    port: 5432
});
  
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let articles = []

app.get("/", async (req, res) => {
    try {
        const result = await db.query(
            "SELECT * FROM Articles ORDER BY publisheddate DESC"
        );
        articles = result.rows;

        res.render("home.ejs", { activePage: "latest", articles: articles });
    } catch (err){
        console.log(err);
        res.status(500).send("Server Error");
    }
});

app.get("/posts", (req, res) => {
    res.render("posts.ejs", { activePage: "latest" });
});

app.get("/watch", (req, res) => {
    res.render("watch.ejs", { activePage: "watch" });
});

app.get("/videos", (req, res) => {
    res.render("videos.ejs", { activePage: "watch" });
});

app.get("/teams", (req, res) => {
    res.render("teams.ejs", { activePage: "teams" });
});

app.get("/new-team", (req, res) => {
    res.render("newteam.ejs", { activePage: "teams" });
});

app.get("/player", (req, res) => {
    res.render("player.ejs", { activePage: "teams" });
});

app.get("/edit-player-stats", (req, res) => {
    res.render("statsedit.ejs", { activePage: "teams" });
});

app.get("/edit-player-stats", (req, res) => {
    res.render("statsedit.ejs", { activePage: "teams" });
});

app.get("/fixtures", (req, res) => {
    res.render("fixtures.ejs", { activePage: "fix-res" });
});

app.get("/add-fixture", (req, res) => {
    res.render("fixture-new.ejs", { activePage: "fix-res" });
});

app.get("/careers", (req, res) => {
    res.render("careers.ejs", { activePage: "careers" });
});

app.get("/new-job", (req, res) => {
    res.render("new-job.ejs", { activePage: "careers" });
});

app.get("/shop", (req, res) => {
    res.render("shop/shop.ejs", { activePage: "shop" });
});

app.get("/standings", (req, res) => {
    res.render("league/standings.ejs", { activePage: "standings" });
});

app.get("/settings", (req, res) => {
    res.render("settings/settings.ejs", { activePage: "settings" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});