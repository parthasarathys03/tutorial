const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("server is running http://localhost:3000/");
    });
  } catch (e) {
    console.log(`db error ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//get

app.get("/players/", async (request, response) => {
  const sqQuery = `
   SELECT 
   *
   FROM
   cricket_team
 `;
  const store = await db.all(sqQuery);

  response.send(store.map((eachPlayer) => convertObject(eachPlayer)));
});

//specific

app.get("/players/:playerId/", async (request, response) => {
  console.log(request.params);
  const { playerId } = request.params;
  const sqQuery = `
   SELECT 
   *
   FROM
   cricket_team
   where
     player_Id=  ${playerId};
 `;
  const store = await db.get(sqQuery);

  response.send(convertObject(store));
});

// add
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;

  const { playerName, jerseyNumber, role } = playerDetails;
  const sqQuery = `
  INSERT INTO 
  cricket_team (player_name,jersey_number,role)
  VALUES
   ('${player_name}',
   ${jersey_number},
   '${role}')
 `;
  const store = await db.run(sqQuery);
  console.log(store);
  response.send("Player Added To Team");
});

//update

app.put("/players/:playerId/", async (request, response) => {
  const playerDetails = request.body;
  const { playerId } = request.params;

  const { playerName, jerseyNumber, role } = playerDetails;
  const sqQuery = `
  UPDATE
  cricket_team 
  SET
  player_name  ='${player_name}',
  jersey_number  =${jersey_number},
  role  ='${role}' 
  WHERE
   player_Id=  ${playerId};
 `;
  const store = await db.run(sqQuery);

  response.send("Player Details Updated");
});

//delete
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const sqQuery = `
  DELETE FROM
  cricket_team 
  WHERE
   player_Id=  ${playerId};
 `;
  await db.run(sqQuery);

  response.send("Player Removed");
});

module.exports = app;
