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

//Latest page routes
let articles = [];
let videos = [];

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

//Create new article post
app.post("/add-post", async (req, res) => {
    const { postTitle, postBody, postImageURL, authorName } = req.body;

    try {
        await db.query("INSERT INTO articles (title, content, imageurl, authorname) VALUES ($1, $2, $3, $4)", [postTitle, postBody, postImageURL, authorName]);
        res.redirect("/");
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

app.get("/view/:id", async(req, res) => {
    try {
        const articleId = req.params.id;
        const result = await db.query(
            "SELECT * FROM Articles WHERE articleid = $1", [articleId]
        );

        let blog = result.rows;

        res.render("blog/article.ejs", {
            activePage: "latest",
            article: blog[0]
        });
    } catch (error) {
      res.status(500).send("Error fetching post");
    }
});

//// Route to render the edit page
app.get("/edit/:id", async (req, res) => {
    try {
        const articleId = req.params.id;
        const result = await db.query(
            "SELECT * FROM Articles WHERE articleid = $1", [articleId]
        );

        let blog = result.rows;

        res.render("blog/modify.ejs", {
            heading: "Edit Post",
            submit: "Update Post",
            activePage: "latest",
            article: blog[0]
        });
    } catch (error) {
      res.status(500).send("Error fetching post");
    }
});

// Partially update a post
app.post("/update-posts/:id", async (req, res) => {
    const postTitle = req.body.postTitle;
    const postBody = req.body.postBody;
    const postImageURL = req.body.postImageURL;
    const authorName = req.body.authorName;
    const articleId = req.params.id;

    try {
        await db.query(
            "UPDATE Articles SET title = $1, content = $2, imageurl = $3, authorname = $4, lastmodifieddate = NOW() WHERE articleid = $5",
            [postTitle, postBody, postImageURL, authorName, articleId]
        );
        res.redirect("/");
    } catch (error) {
      res.status(500).json({ message: "Error updating post" });
    }
});

// Delete a post
app.post("/delete/:id", async (req, res) => {
    const id = req.params.id;
    try {
      await db.query("DELETE FROM articles WHERE articleid = $1", [id]);
      res.redirect("/");
    } catch (err) {
        res.status(500).json({ message: "Error deleting post" });
    }
});
  

//Add a featured player
app.post("/update-featured-player", async (req, res) => {

    try {
        await db.query("DELETE FROM featured_players");

        await db.query(`
            INSERT INTO featured_players (playerid)
            SELECT playerid FROM player
            ORDER BY RANDOM()
            LIMIT 3;
        `);
        res.redirect("/");
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error, unable to update featured players");
    }
});

app.get("/posts", (req, res) => {
    res.render("blog/posts.ejs", { activePage: "latest" });
});

//Watch Page styles start here
app.get("/watch", async (req, res) => {
    try {
        const result = await db.query(
            "SELECT * FROM video_highlights ORDER BY uploaded_at DESC"
        );
        videos = result.rows;

        res.render("watch.ejs", { activePage: "watch", videos: videos });
    } catch (err){
        console.log(err);
        res.status(500).send("Server Error, cannot fetch Videos");
    }
});

app.get("/videos", (req, res) => {
    res.render("watch/videos.ejs", { activePage: "watch" });
});

app.post("/video-upload", async (req, res) => {
    const { videoTitle, videoUrl } = req.body;

    try {
        await db.query("INSERT INTO video_highlights (match_title, video_url) VALUES ($1, $2)", [videoTitle, videoUrl]);
        res.redirect("/");
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

app.post("/delete-video/:id", async (req, res) => {
    const id = req.params.id;
    try {
      await db.query("DELETE FROM video_highlights WHERE id = $1", [id]);
      res.redirect("/");
    } catch (err) {
        res.status(500).json({ message: "Error deleting video" });
    }
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