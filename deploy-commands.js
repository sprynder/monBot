require('dotenv').config()
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.DISCORD_BOT_TOKEN;


const commands = [
	new SlashCommandBuilder().setName('rat-init').setDescription('Creates your Ratcount!'),
	new SlashCommandBuilder().setName('roll').setDescription('Roll for a rat!'),
    new SlashCommandBuilder().setName('pc').setDescription('See your current rats!'),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationCommands(clientId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);