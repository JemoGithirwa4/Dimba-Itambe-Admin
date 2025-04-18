# Dimba Itambe Admin

## Description
Dimba Itambe Admin is an admin panel for managing articles, teams, players, fixtures etc in a football league application.

## Features
- User authentication
- Article management
- Team and player management
- Fixture management
- Football video highlights management
- Careers management
- League standings management

## Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: Html, CSS, Bootstrap, EJS templates
- **Database**: PostgreSQL

## Dependencies
- bcrypt
- body-parser
- dotenv
- ejs
- express
- express-session
- passport
- passport-local
- pg

## Demo
For a video demonstration click [here](https://youtu.be)

## 1. Log in
In order to access the admin side system, the admin needs to login.
![Home Page](public/images/demo/home.PNG)

## 2. Home Page
The home page features the latest football updates. It has three parts:
### 2.1 Latest article blogs section
Displays articles added in the database. Allows for adding, editing, deleting and viewing added articles.
![Home Page](public/images/demo/home.PNG)

#### 2.1.1 Add blogs 
To add an article/blog click "Add +" button at the top right of the blogs card. 
![Article Add](public/images/demo/add-blog.PNG)
![Article Add](public/images/demo/add-blog2.PNG)

Enter article details and click "Publish" to add the article.

#### 2.1.2 Read blogs 
To read an article click "read View" button on the specific blog. Below is a sample article view:
![Article View](public/images/demo/view-blog.PNG)

#### 2.1.3 Edit blogs 
To add an article/blog click "Edit" button on the specific blog. 
![Article Add](public/images/demo/edit-blog.PNG)

Enter update text and click "Update Post" to complete the update.

#### 2.1.4 Delete blogs 
To delete an article/blog click "Delete" button on the specific blog.

### 2.2 Update featured players
This selects three players at random to feature players on the main Dimba Itambe Web application. See [here](https://github.com/JemoGithirwa4/Dimba-Itambe).
![Featured players](public/images/demo/feat-players.PNG)

## 3. Watch Page
The watch page is for managing video highlights for played games.
![Featured players](public/images/demo/watch.PNG)

### 3.1 Video highlight 
To add a video highlight click "Add +" button at the top right. 
![Video Add](public/images/demo/add-vid.PNG)

Enter video details as specified and click "Upload Video" to add the video.

### 3.2 Delete video highlight
To delete video highlight just click the "Delete" button on the specific video row.

## 4. Teams & Players Page
The page handles teams and players information management. It has three parts:
### 4.1 Teams section
Displays existing teams on the database. Allows for adding, editing, deleting teams.
![Team Section](public/images/demo/team.PNG)

#### 4.1.1 Add Team 
To add a team click "Add +" button at the top right of the teams card. 
![Article Add](public/images/demo/add-team.PNG)

Enter team details and click "Add Team" to add the team.

#### 4.1.2 Edit Team 
To edit a team click "Edit" button on the specific team. 
![Edit Team](public/images/demo/edit-team.PNG)

Enter the updates and click "Update Team".

#### 4.1.3 Delete Team
To delete a team click "Delete" button on the specific team row.

### 4.2 Players Section
This is where player information is managed.
![Players](public/images/demo/players.PNG)

#### 4.2.1 Add Player
To add a player click "Add +" button at the top right of the players card. 
![Player Add](public/images/demo/add-player.PNG)
![Player Add](public/images/demo/add-player2.PNG)

Enter player details and click "Add Player" to add the player.

#### 4.2.2 Edit Player
To edit a player click "Edit" button on the specific player. 
![Edit Player](public/images/demo/edit-player.PNG)
![Edit Player](public/images/demo/edit-player2.PNG)

Enter the updates and click "Update Player".

#### 4.2.3 Delete Team
To delete a team click "Delete" button on the specific team row.

### 4.3 Stats Section
This is where player statistics information is managed.
![Players](public/images/demo/stats.PNG)

#### 4.3.1 Add Stats
To add a new player record click "Refresh" button at the top right of the stats card. This updates the stats view to include any newly added players. 

#### 4.3.2 Edit Player Stats
To edit a player stats click "Edit" button on the specific player. 
![Edit Player](public/images/demo/edit-stat.PNG)

Enter the updates and click "Update Stats".

## 5. Fixtures & Results Page
The page handles fixtures and results management.
![Fixtures & results](public/images/demo/fix-res.PNG)

### 5.1 Add Fixture
To add a fixture click "Add +" button at the top right of the fixtures card. 
![Fixture Add](public/images/demo/fix-add.PNG)
![Fixture Add](public/images/demo/fix-add2.PNG)

Enter fixture details and click "Add Fixture" to add the fixture.

### 5.2 Edit Fixture 
To edit a fixture click "Edit" button on the specific fixture row. 
![Edit Fixture](public/images/demo/edit-fix.PNG)

Enter the updates and click "Update Fixture".

### 5.3 Goal
To update goal scorer details click "Goal" button on the specific fixture row. 
![Goal](public/images/demo/goal.PNG)
![Goal](public/images/demo/goal.PNG)

Select the goal scorer, select the goal type and enter the minute the goal was scored. Click "Add Goal" to update.
To delete a goal just click "Remove" for the specific goal.

### 5.4 Delete Fixture
To delete a fixture click "Delete" button on the specific fixture row.

## 6. Careers Page
The page handles job openings management.
![Careers](public/images/demo/career.PNG)

### 6.1 Add Career
To add a career click "Add +" button at the top right of the career card. 
![Career Add](public/images/demo/add-career.PNG)
![Career Add](public/images/demo/add-career2.PNG)

Enter job details and click "Add Job" to add the job.

### 6.2 Delete Job
To delete a job click "Delete" button on the specific job row.

## 7. League Standings Page
The page handles league standings updates.
![League Standings](public/images/demo/standings.PNG)

To refresh so that newly added teams are added to the standings click the "Refresh" button at the top right corner of the standings card.

### 7.1 Edit Standings
To update league stats on a team click "Edit" button for the specific team row. 
![Standings Edit](public/images/demo/edit-standings.PNG)
![Standings Edit](public/images/demo/edit-standings2.PNG)

Update the details and click "Update Standings" to complete the update.

## 8. Log out
To logout click the "Log out" tab on the side bar.