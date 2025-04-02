import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import env from "dotenv";

const PORT = process.env.PORT || 3006;

const app = express();
env.config();

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});
  
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 6000000
    }
}));

app.use(passport.initialize());
app.use(passport.session());

//Latest page routes
let articles = [];
let videos = [];
let teams = [];
let players = [];
let stats = [];

app.get("/", async (req, res) => {
    if (req.isAuthenticated()){
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
    } else {
        res.redirect("/login");
    }
});

app.get("/login", (req, res) => {
    res.render("login.ejs");
});

//Create new article post
app.post("/add-post", ensureAuthenticated, async (req, res) => {
    const { postTitle, postBody, postImageURL, authorName } = req.body;

    try {
        await db.query("INSERT INTO articles (title, content, imageurl, authorname) VALUES ($1, $2, $3, $4)", [postTitle, postBody, postImageURL, authorName]);
        res.redirect("/");
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

app.get("/view/:id", ensureAuthenticated, async(req, res) => {
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
app.get("/edit/:id", ensureAuthenticated, async (req, res) => {
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
app.post("/update-posts/:id", ensureAuthenticated, async (req, res) => {
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
app.post("/delete/:id", ensureAuthenticated, async (req, res) => {
    const id = req.params.id;
    try {
      await db.query("DELETE FROM articles WHERE articleid = $1", [id]);
      res.redirect("/");
    } catch (err) {
        res.status(500).json({ message: "Error deleting post" });
    }
});
  

//Add a featured player
app.post("/update-featured-player", ensureAuthenticated, async (req, res) => {

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

app.get("/posts", ensureAuthenticated, (req, res) => {
    res.render("blog/posts.ejs", { activePage: "latest" });
});

//Watch Page styles start here
app.get("/watch", ensureAuthenticated, async (req, res) => {
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

app.get("/videos", ensureAuthenticated, (req, res) => {
    res.render("watch/videos.ejs", { activePage: "watch" });
});

app.post("/video-upload", ensureAuthenticated, async (req, res) => {
    const { videoTitle, videoUrl } = req.body;

    try {
        await db.query("INSERT INTO video_highlights (match_title, video_url) VALUES ($1, $2)", [videoTitle, videoUrl]);
        res.redirect("/");
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

app.post("/delete-video/:id", ensureAuthenticated, async (req, res) => {
    const id = req.params.id;
    try {
      await db.query("DELETE FROM video_highlights WHERE id = $1", [id]);
      res.redirect("/");
    } catch (err) {
        res.status(500).json({ message: "Error deleting video" });
    }
});

//Teams & Players page route
app.get("/teams", ensureAuthenticated, async (req, res) => {
    try {
        const teamResult = await db.query(
            "SELECT * FROM team ORDER BY teamname ASC"
        );
        teams = teamResult.rows;

        const playerResult = await db.query(
            "SELECT * FROM player ORDER BY playerid ASC"
        );
        players = playerResult.rows;

        const statsResult = await db.query(`
            SELECT
                player.fname,
                player.lname,
                player.teamname,
                player.position,
                stats.playerid,
                stats.matches_played,
                stats.minutes_played,
                stats.goals,
                stats.assists,
                stats.yellowcards,
                stats.redcards
            FROM stats
            JOIN player ON stats.playerid = player.playerid;
        `);
        stats = statsResult.rows;

        res.render("teams.ejs", { activePage: "teams", teams: teams, players: players, stats: stats });
    } catch (err){
        console.log(err);
        res.status(500).send("Server Error, cannot fetch data from the database");
    }
});

app.get("/new-team", ensureAuthenticated, (req, res) => {
    res.render("teams-players/newteam.ejs", { activePage: "teams" });
});

//Handle new team upload
app.post("/upload-team", ensureAuthenticated, async (req, res) => {
    const { teamName, teamAbb, teamWebsite, teamCity, teamLogo } = req.body;

    try {
        await db.query("INSERT INTO team (teamname, abb, website, city, logo_url) VALUES ($1, $2, $3, $4, $5)", [teamName, teamAbb, teamWebsite, teamCity, teamLogo]);
        res.redirect("/teams");
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error, cannot upload new team");
    }
});

//Handle editing team details
app.get("/edit-team/:teamname", ensureAuthenticated, async (req, res) => {
    try {
        const teamname = req.params.teamname;
        const result = await db.query(
            "SELECT * FROM team WHERE teamname = $1", [teamname]
        );

        let team = result.rows;
        console.log(team);

        res.render("teams-players/edit-team.ejs", {
            activePage: "teams",
            team: team[0]
        });
    } catch (error) {
      res.status(500).send("Error fetching post");
    }
});

//Edit team
app.post("/edit-team", ensureAuthenticated, async (req, res) => {
    const { originalTeamName, teamName, teamAbb, teamWebsite, teamCity, teamLogo } = req.body;

    try {
        await db.query(
            "UPDATE team SET teamname = $1, abb = $2, website = $3, city = $4, logo_url = $5 WHERE teamname = $6",
            [teamName, teamAbb, teamWebsite, teamCity, teamLogo, originalTeamName]
        );
        res.redirect("/teams");
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

// Delete a team
app.post("/delete/:teamname", ensureAuthenticated, async (req, res) => {
    const teamname = req.params.teamname;

    try {
      await db.query("DELETE FROM team WHERE teamname = $1", [teamname]);
      res.redirect("/teams");
    } catch (err) {
        res.status(500).json({ message: "Error deleting team" });
    }
});

app.get("/player", ensureAuthenticated, (req, res) => {
    res.render("teams-players/player.ejs", { activePage: "teams" });
});

app.post("/upload-player", ensureAuthenticated, async (req, res) => {
    const {
        firstName,
        middleName,
        lastName,
        playerDob,
        playerPosition,
        playerWeight,
        playerHeight,
        playerNationality,
        kitNumber, 
        playerTeam,
        playerLogo
    } = req.body;

    try {
        await db.query(`
            INSERT INTO PLAYER 
            (FNAME, MNAME, LNAME, DOB, POSITION, WEIGHT, HEIGHT, NATIONALITY, KITNUMBER, TEAMNAME, IMAGE_URL)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `, [firstName, middleName, lastName, playerDob, playerPosition, 
                playerWeight, playerHeight, playerNationality, kitNumber, playerTeam, playerLogo]
        );
        res.redirect("/teams");
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error, cannot upload new player");
    }
});

//Handle editing team details
app.get("/edit-player/:id", ensureAuthenticated, async (req, res) => {
    try {
        const playerName = req.params.id;
        const result = await db.query(
            "SELECT * FROM player WHERE playerid = $1", [playerName]
        );

        let player = result.rows;

        res.render("teams-players/edit-player.ejs", {
            activePage: "teams",
            player: player[0]
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Error fetching player details");
    }
});

//Edit player
app.post("/edit-player", ensureAuthenticated, async (req, res) => {
    const {
        originalPlayerId, 
        firstName,
        middleName,
        lastName,
        playerPosition,
        playerWeight,
        playerHeight,
        playerNationality,
        kitNumber,
        playerTeam,
        playerLogo
    } = req.body;

    try {
        await db.query(
            `UPDATE player 
             SET fname = $1, 
                 mname = $2, 
                 lname = $3, 
                 position = $4, 
                 weight = $5, 
                 height = $6, 
                 nationality = $7, 
                 kitnumber = $8, 
                 teamname = $9, 
                 image_url = $10 
             WHERE playerid = $11`, 
            [
                firstName,
                middleName,
                lastName,
                playerPosition,
                playerWeight,
                playerHeight,
                playerNationality,
                kitNumber,
                playerTeam,
                playerLogo,
                originalPlayerId
            ]
        );
        res.redirect("/teams"); 
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

//Delete player
app.post("/delete-player/:id", ensureAuthenticated, async (req, res) => {
    const playerId = req.params.id; 

    try {
        await db.query("DELETE FROM player WHERE playerid = $1", [playerId]);
        res.redirect("/teams"); 
    } catch (err) {
        console.error("Error deleting player:", err);
        res.status(500).json({ message: "Error deleting player" });
    }
});

//Player stats
app.get("/edit-player-stats/:id", ensureAuthenticated, async (req, res) => {
    try {
        const playerId = req.params.id;
        const result = await db.query(`
            SELECT stats.*, player.fname, player.lname, player.teamname
            FROM stats
            JOIN player ON stats.playerid = player.playerid
            WHERE stats.playerid = $1
        `, [playerId]);        

        let player = result.rows;

        res.render("teams-players/edit-stats.ejs", {
            activePage: "teams",
            stat: player[0]
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Error fetching player stats details");
    }
});

app.post("/update-stats/:id", ensureAuthenticated, async (req, res) => {
    try {
        const playerId = req.params.id;
        const { matches_played, minutes_played, goals, assists, yellowcards, redcards } = req.body;

        // Update stats in the database
        await db.query(
            `UPDATE stats 
             SET matches_played = $1, 
                 minutes_played = $2, 
                 goals = $3, 
                 assists = $4, 
                 yellowcards = $5, 
                 redcards = $6
             WHERE playerid = $7`,
            [matches_played, minutes_played, goals, assists, yellowcards, redcards, playerId]
        );

        res.redirect("/teams"); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Error updating player stats");
    }
});

//Refresh stats to include new players
app.post("/refresh-stats", ensureAuthenticated, async (req, res) => {
    try {
        await db.query(`
            INSERT INTO stats (playerid, matches_played, minutes_played, goals, assists, yellowcards, redcards)
            SELECT playerid, 0, 0, 0, 0, 0, 0
            FROM player
            WHERE playerid NOT IN (SELECT playerid FROM stats);
        `);

        res.redirect("/teams"); 
    } catch (err) {
        console.error("Error initializing stats:", err);
        res.status(500).send("Server Error: Unable to refresh stats");
    }
});

//Fixtures and Results page
app.get("/fixtures", ensureAuthenticated, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT MATCHID, MDATE, MTIME, HOMETEAM, AWAYTEAM, HOME_SCORE, AWAY_SCORE, HOSTEDBY, STATUS
            FROM MATCH
            ORDER BY MDATE, MTIME;
        `);

        res.render("fixtures.ejs", { 
            activePage: "fix-res", 
            fixtures: result.rows 
        });
    } catch (err) {
        console.error("Error fetching fixtures:", err);
        res.status(500).send("Server Error, unable to fetch fixtures");
    }
});

app.get("/add-fixture", ensureAuthenticated, (req, res) => {
    res.render("fixtures/add-fixture.ejs", { activePage: "fix-res" });
});

//Add fixture
app.post("/add-fixture", ensureAuthenticated, async (req, res) => {
    try {
        const { matchDate, kickoffTime, homeTeam, awayTeam, venue, gw } = req.body;

        const insertQuery = `
            INSERT INTO MATCH (MDATE, MTIME, HOMETEAM, AWAYTEAM, HOSTEDBY, GAMEWEEK) 
            VALUES ($1, $2, $3, $4, $5, $6)
        `;

        await db.query(insertQuery, [matchDate, kickoffTime, homeTeam, awayTeam, venue, gw]);

        res.redirect("/fixtures");

    } catch (error) {
        console.error("Error adding fixture:", error);
        res.status(500).send("Internal Server Error");
    }
});


//Edit fixture
app.get("/edit-fixture/:matchid", ensureAuthenticated, async (req, res) => {
    try {
        const matchid = req.params.matchid;
        const result = await db.query("SELECT * FROM MATCH WHERE MATCHID = $1", [matchid]);

        res.render("fixtures/edit-fixtures.ejs", { fixture: result.rows[0], activePage: "fix-res" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

app.post("/update-fixture/:id", ensureAuthenticated, async (req, res) => {
    try {
        const { hometeam, awayteam, venue, homescore, awayscore, status } = req.body;
        const fixtureId = req.params.id;

        await db.query(
            "UPDATE MATCH SET HOMETEAM = $1, AWAYTEAM = $2, HOSTEDBY = $3, HOME_SCORE = $4, AWAY_SCORE = $5, STATUS = $6 WHERE MATCHID = $7",
            [hometeam, awayteam, venue, homescore, awayscore, status, fixtureId]
        );

        res.redirect("/fixtures");
    } catch (error) {
        console.error("Error updating fixture:", error);
        res.status(500).send("Internal Server Error");
    }
});

//Goal updates page
app.get('/update-goals/:matchid', async (req, res) => {
    const matchid = req.params.matchid;
    
    try {
        // Fetch match details
        const matchResult = await db.query(
            "SELECT * FROM match WHERE matchid = $1", 
            [matchid]
        );
        const match = matchResult.rows[0];  // Ensure we correctly extract the match data

        // Fetch players from both teams in the match
        const playersResult = await db.query(
            `SELECT playerid, lname, teamname FROM player 
             WHERE teamname IN (
                SELECT hometeam FROM match WHERE matchid = $1 
                UNION 
                SELECT awayteam FROM match WHERE matchid = $1
            )`,
            [matchid]
        );
        const players = playersResult.rows;

        // Fetch goals, replacing teamid with teamname
        const goalsResult = await db.query(
            `SELECT g.goalid, g.time_min, p.lname, g.teamname, g.goal_type 
            FROM goal g 
            JOIN player p ON g.playerid = p.playerid 
            WHERE g.matchid = $1 
            ORDER BY g.time_min ASC`,
            [matchid]
        );
        const goals = goalsResult.rows;

        // Render the page with retrieved data
        res.render('fixtures/update-goals.ejs', { activePage: "fix-res", match, players, goals });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching match details");
    }
});

//Update goal
app.post('/update-goals/:matchid', async (req, res) => {
    const matchid = req.params.matchid;
    let { playerid, time_min, teamname, goaltype } = req.body;

    try {
        // Fetch player's actual team
        const playerTeamResult = await db.query(
            "SELECT teamname FROM player WHERE playerid = $1",
            [playerid]
        );

        if (playerTeamResult.rows.length === 0) {
            return res.status(400).send("Invalid player selected");
        }

        const playerTeam = playerTeamResult.rows[0].teamname;

        // If it's an own goal, assign the goal to the OPPOSING team
        if (goaltype === "Own Goal") {
            const matchResult = await db.query(
                "SELECT hometeam, awayteam FROM match WHERE matchid = $1",
                [matchid]
            );

            if (matchResult.rows.length === 0) {
                return res.status(400).send("Invalid match selected");
            }

            const { hometeam, awayteam } = matchResult.rows[0];

            // Assign to the opposing team
            teamname = (playerTeam === hometeam) ? awayteam : hometeam;
        }

        // Insert new goal into the database
        await db.query(
            `INSERT INTO goal (matchid, playerid, time_min, teamname, goal_type) 
             VALUES ($1, $2, $3, $4, $5)`,
            [matchid, playerid, time_min, teamname, goaltype]
        );

        res.redirect(`/update-goals/${matchid}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating goals");
    }
});

//Delete goal
app.post('/delete-goal/:goalid', async (req, res) => {
    const goalid = req.params.goalid;

    try {
        await db.query("DELETE FROM goal WHERE goalid = $1", [goalid]);
        res.redirect(req.get("Referrer") || "/fixtures"); // Redirects back to the previous page
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting goal");
    }
});

//Delete fixture
app.post("/delete-fixture/:id", ensureAuthenticated, async (req, res) => {
    try {
        const matchId = req.params.id;

        await db.query("DELETE FROM MATCH WHERE MATCHID = $1", [matchId]);

        res.redirect("/fixtures");
    } catch (error) {
        console.error("Error deleting fixture:", error);
        res.status(500).send("Internal Server Error");
    }
});

//Careers page
app.get("/careers", ensureAuthenticated, async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM jobs ORDER BY deadline ASC");
        res.render("careers.ejs", { activePage: "careers", jobs: result.rows });
    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).send("Server Error");
    }
});

app.get("/new-job", ensureAuthenticated, (req, res) => {
    res.render("careers/new-job.ejs", { activePage: "careers" });
});

app.post('/upload-job', ensureAuthenticated, async (req, res) => {
    const { title, description, location, job_type, openings, deadline, requirements, responsibilities } = req.body;

    try {
        await db.query(
            `INSERT INTO jobs (title, description, location, job_type, openings, deadline, requirements, responsibilities) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                title,
                description,
                location,
                job_type,
                openings,
                deadline,
                JSON.stringify(requirements.split(',').map(item => item.trim())),
                JSON.stringify(responsibilities.split(',').map(item => item.trim()))
            ]
        );
        res.redirect('/careers'); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Error adding job");
    }
});

app.post("/careers/delete/:id", ensureAuthenticated, async (req, res) => {
    const id = req.params;
    try {
        await db.query("DELETE FROM jobs WHERE id = $1", [id]);
        res.redirect("/careers");
    } catch (error) {
        console.error("Error deleting job:", error);
        res.status(500).send("Server Error");
    }
});

app.get("/standings", ensureAuthenticated, async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM league_standings ORDER BY points DESC, goal_difference DESC");
        res.render("standings.ejs", { activePage: "standings", standings: result.rows });
    } catch (err) {
        console.error("Error fetching standings:", err);
        res.status(500).send("Server Error: Unable to fetch standings");
    }
});

//Refresh league standings to include new teams
app.post("/refresh-standings", ensureAuthenticated, async (req, res) => {
    try {
        await db.query(`
            INSERT INTO league_standings (team_id, matches_played, wins, draws, losses, goals_for, goals_against)
            SELECT teamname, 0, 0, 0, 0, 0, 0
            FROM team
            WHERE teamname NOT IN (SELECT team_id FROM league_standings);
        `);

        res.redirect("/standings"); 
    } catch (err) {
        console.error("Error initializing standings:", err);
        res.status(500).send("Server Error: Unable to refresh standings");
    }
});

//Render edit page for standings
app.get("/edit-league-standings/:id", ensureAuthenticated, async (req, res) => {
    try {
        const team_id = req.params.id;
        const result = await db.query("SELECT * FROM league_standings WHERE id = $1", [team_id]);

        if (result.rows.length > 0) {
            res.render("league/edit-standing.ejs", { activePage: "standings", standing: result.rows[0] });
        } else {
            res.status(404).send("Team not found in standings.");
        }
    } catch (error) {
        console.error("Error fetching team standings:", error);
        res.status(500).send("Server error.");
    }
});

//Update standings
app.post("/update-standing", ensureAuthenticated, async (req, res) => {
    try {
        const { id, matches_played, wins, draws, losses, goals_for, goals_against } = req.body;

        await db.query(`
            UPDATE league_standings 
            SET matches_played = $1, wins = $2, draws = $3, losses = $4, goals_for = $5, goals_against = $6 
            WHERE id = $7
        `, [matches_played, wins, draws, losses, goals_for, goals_against, id]);

        res.redirect("/standings");
    } catch (error) {
        console.error("Error updating standings:", error);
        res.status(500).send("Server error.");
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
        }
        req.logout(() => {}); // Passport logout
        res.redirect('/login'); // Redirect to login page
    });
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
}));

passport.use(new Strategy(async function verify(username, password, cb) {
    try {
        const result = await db.query("SELECT * FROM admin_users WHERE email = $1", [username]);
        
        if (result.rows.length > 0) {
            const user = result.rows[0];
            const storedHashedPassword = user.password_hash; // Ensure column name matches DB
            
            bcrypt.compare(password, storedHashedPassword, (err, isMatch) => {
                if (err) {
                    return cb(err);
                }
                if (isMatch) {
                    return cb(null, user);
                } else {
                    return cb(null, false);
                }
            });
        } else {
            return cb(null, false); // Return false for incorrect email
        }
    } catch (err) {
        return cb(err);
    }
}));
  
passport.serializeUser((user, cb) => {
    cb(null, user);
});
  
passport.deserializeUser((user, cb) => {
    cb(null, user);
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}  

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});