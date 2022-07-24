require("dotenv").config();
var admin = require("firebase-admin");
var serviceAccount = require("./admin.json");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const {
  initializeApp,
  applicationDefault,
  cert,
} = require("firebase-admin/app");
const {
  getFirestore,
  Timestamp,
  FieldValue,
} = require("firebase-admin/firestore");
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN);

class Mon {
  constructor(name, attack) {
    this.name = name;
    this.attack = attack;
    this.level = 0;
  }

  setLevel(newLevel) {
    this.level = newLevel;
  }
}

let ratMons = [
  new Mon("Shreg", "HEE-HEE"),
  new Mon("Gavone", "You Rat Bitch"),
  new Mon("timtom", "go bid mode"),
  new Mon("alon", "who let summer out"),
  new Mon("bob", "can I get a ride"),
  new Mon("intern", "its bustin bosk"),
  new Mon("dsun", "any qers?"),
  new Mon("brohan", "friendzoned:("),
  new Mon("prank", "moanboxing"),
  new Mon("vanillabunny", "you wanna play stardew"),
];

const { Client, GatewayIntentBits } = require("discord.js");
const { async } = require("@firebase/util");
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// When the client is ready, run this code (only once)
client.once("ready", async () => {
  console.log("Ready!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.guild) return;
  const { commandName } = interaction;
  let date_ob = new Date();
  // current hours
  let hours = date_ob.getHours();
  // current minutes
  let minutes = date_ob.getMinutes();
  var userID = interaction.user.id;

  if (commandName === "rat-init") {
    const snapshot = await (
      await db.collection("users").doc(userID).get()
    ).data().mons;
    if (snapshot > 0) {
      //delete all mons
      const ref = db.collection("users").doc(userID).collection("mons");
      ref.onSnapshot((snapshot) => {
        snapshot.docs.forEach((doc) => {
          ref.doc(doc.id).delete();
        });
      });
    }
    const res = await db
      .collection("users")
      .doc(userID)
      .set({
        name: userID,
        username: interaction.user.username,
        mons: 0,
        lastPulled: { hour: hours - 2, minute: minutes },
        boBucks: 0,
        inBattleWith: "nobody",
      });
    await interaction.reply("You have entered... the RAT CAGE!");
  } else if (commandName === "roll") {
    let date_ob = new Date();
    // current hours
    let hours = date_ob.getHours();
    // current minutes
    let minutes = date_ob.getMinutes();
    const prevPullTime = await (
      await db.collection("users").doc(userID).get()
    ).data().lastPulled;
    const timePassed =
      Math.abs(hours - prevPullTime.hour) * 60 +
      (minutes - prevPullTime.minute);
    if (timePassed >= 60) {
      const randomIndex = Math.floor(Math.random() * ratMons.length);

      // get random item
      const item = JSON.parse(JSON.stringify(ratMons[randomIndex]));
      const snapshot =
        (await (await db.collection("users").doc(userID).get()).data().mons) +
        1;
      await db.collection("users").doc(userID).update({
        mons: snapshot,
      });
      const res = await db
        .collection("users")
        .doc(userID)
        .collection("mons")
        .doc(item.name)
        .set({ ...item });
      const res2 = await db
        .collection("users")
        .doc(userID)
        .update({
          lastPulled: { hour: hours, minute: minutes },
        });
      await interaction.reply(
        "You found a " + item.name + "\n It says" + item.attack
      );
    } else {
      await interaction.reply("You must wait an hour between rolls.");
    }
  } else if (commandName === "pc") {
    const snapshot = await db
      .collection("users")
      .doc(userID)
      .collection("mons")
      .get();
    let currentMons = "";
    snapshot.forEach((doc) => {
      let data = JSON.stringify(doc.data());
      currentMons += doc.id + " => " + data + "\n";
    });
    await interaction.reply("You currently own:\n" + currentMons);
  }
});

client.on("messageCreate", async (message) => {
    if(message.content.indexOf("/challenge")===0){
        const taggedUser = message.mentions.users.first();
        let arrID = [message.author.id,taggedUser.id];
        arrID.sort();
        const res = await db
        .collection("battles")
        .doc(""+arrID[0]+arrID[1])
        .set({
            id: ""+arrID[0]+arrID[1],
          fighters: [arrID[0],arrID[1]],
          curTurn: arrID[0],
        accepted: false,
        });
    message.reply(`You want to challenge: ${taggedUser.username}`);
    }
    if(message.content.indexOf("/accept")===0){
        const taggedUser = message.mentions.users.first();
        let arrID = [message.author.id,taggedUser.id];
        arrID.sort();
        const res = await db
        .collection("battles")
        .doc(""+arrID[0]+arrID[1])
        .update({
            accepted: true
        });
        await db
        .collection("users")
        .doc(""+arrID[0])
        .update({
            inBattleWith: ""+arrID[1]
        });
        await db
        .collection("users")
        .doc(""+arrID[1])
        .update({
            inBattleWith: ""+arrID[0]
        });

        //update both fighters fields that theyve accepted a battle. change inBattleWith field
    message.reply(`You've accepted ${taggedUser.username}'s challenge!`);
    }

  
});
// const taggedUser = message.mentions.users.first();
// message.channel.send(`You wanted to challenge: ${taggedUser.username}`);
client.login(process.env.DISCORD_BOT_TOKEN);
