const {Client,Intents,MessageActionRow,MessageButton,} = require("discord.js");
const {SlashCommandBuilder} = require('@discordjs/builders')
const dotenv = require('dotenv')
require('dotenv').config();

const fs = require("fs");
const axios = require("axios");
const chance = require("chance").Chance();
const client = new Client({
  intents: [
       Intents.FLAGS.GUILDS,
       Intents.FLAGS.GUILD_MESSAGES,
       Intents.FLAGS.GUILD_MEMBERS,
  ],
});

const token = process.env.TOKEN;


const previousNicknames = new Map();

client.on("ready", () => {
  console.log(`Connecté en tant que ${client.user.tag}`);

    client.user.setActivity(".how or /how to know more !" , {type: "PLAYING"}) 

});

client.on("messageCreate", (message) => {
  if (message.author.bot || !message.guild) return; // Ignorer les messages des bots et les messages en dehors des serveurs

  const args = message.content.split(" ");
  const command = args.shift().toLowerCase();

  if (command === ".nick") {
    const nickname = args.join(" ");
    if (!nickname) {
      message.reply("> `❌` Uses : `.nick [nickname]`");
      return;
    }

    // Stocke le pseudo précédent de l'utilisateur
    const previousNickname =
      message.member.nickname || message.member.user.username;
    previousNicknames.set(message.member.id, previousNickname);

    message.member
      .setNickname(nickname)
      .then(() => {-
        message.reply(
          "> `✨`" + ` Your nickname has been modified to "${nickname}"`
        );
        // Sauvegarde le pseudo précédent dans le fichier texte
        savePreviousNickname(message.member.id, previousNickname);
      })
      .catch((error) => {
        console.error(`Impossible de changer le pseudo: ${error}`);
        message.reply("> `❌` Im not having permission to `edit usernames`");
      });
  }

  if (command === ".undo") {
    // Vérifie si le pseudo précédent de l'utilisateur est stocké
    if (!previousNicknames.has(message.member.id)) {
      message.reply("> `❌` You have no precedent nick names");
      return;
    }

    const previousNickname = previousNicknames.get(message.member.id);

    message.member
      .setNickname(previousNickname)
      .then(() => {
        message.reply(
          "> `✨`" +
            ` Your nickname has been restaured to  "${previousNickname}"`
        );
        previousNicknames.delete(message.member.id);
      })
      .catch((error) => {
        console.error(`Impossible de restaurer le pseudo: ${error}`);
        message.reply("> `❌` Im not having permission to `edit usernames`");
      });
  }

  if (command === ".reset") {
    const defaultNickname = message.member.user.username;

    message.member
      .setNickname(defaultNickname)
      .then(() => {
        message.channel.send(
          "> `✨`" + ` You nicknames has been reset to "${defaultNickname}"`
        );
        // Supprime le pseudo précédent stocké pour l'utilisateur
        deletePreviousNickname(message.member.id);
      })
      .catch((error) => {
        console.error(
          `Im not having permission to ` + " `edit usernames` " + ` ${error}`
        );
        message.channel.send(
          "> `❌` Im not having permission to `edit usernames`"
        );
      });
  }})

client.login(token);
