require('dotenv').config();
const express = require('express');
const { Client, Intents } = require('discord.js');
const moment = require('moment');

const token = process.env.DISCORD_TOKEN;
const guildId = process.env.DISCORD_GUILD_ID;

const app = express();
const port = process.env.PORT || 3000;

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES, // Intencje potrzebne do monitorowania wiadomości
  ]
});

client.once('ready', () => {
  console.log('Bot jest online!');
  client.user.setPresence({
    status: 'available',
    activities: [{
      name: 'TEAMWORK ALFA',
      type: 'WATCHING',
    }],
  });
});

// Endpoint API do pobierania liczby członków, ról i wiadomości
app.get('/api/stats', async (req, res) => {
  try {
    const guild = await client.guilds.fetch(guildId);
    const memberCount = guild.memberCount;
    const rolesCount = guild.roles.cache.size;

    // Pobierz liczbę wiadomości z ostatniego dnia
    const now = moment();
    const oneDayAgo = now.subtract(1, 'days');
    let messagesCount = 0;

    const channels = guild.channels.cache.filter(channel => channel.isText());
    for (const channel of channels.values()) {
      const messages = await channel.messages.fetch({ limit: 100 });
      messagesCount += messages.filter(msg => moment(msg.createdAt).isAfter(oneDayAgo)).size;
    }

    console.log('Stats:', { memberCount, rolesCount, messagesCount });
    res.json({ memberCount, rolesCount, messagesCount });
  } catch (error) {
    console.error('Błąd przy pobieraniu statystyk:', error);
    res.status(500).json({ error: 'Wystąpił błąd podczas pobierania statystyk.' });
  }
});

// Endpoint API do pobierania liczby aktywnych użytkowników
app.get('/api/active-members', async (req, res) => {
  try {
    const guild = await client.guilds.fetch(guildId);
    const onlineMembers = guild.members.cache.filter(member => member.presence?.status === 'online').size;
    console.log('Active Members:', { onlineMembers });
    res.json({ onlineMembers });
  } catch (error) {
    console.error('Błąd przy pobieraniu liczby aktywnych użytkowników:', error);
    res.status(500).json({ error: 'Wystąpił błąd podczas pobierania liczby aktywnych użytkowników.' });
  }
});

// Endpoint API do pobierania listy nowych użytkowników
app.get('/api/new-members', async (req, res) => {
  try {
    const guild = await client.guilds.fetch(guildId);
    const oneWeekAgo = moment().subtract(7, 'days');
    const newMembers = guild.members.cache.filter(member => moment(member.joinedAt).isAfter(oneWeekAgo));
    const newMembersList = newMembers.map(member => member.user.tag);
    console.log('New Members:', { newMembersList });
    res.json({ newMembersList });
  } catch (error) {
    console.error('Błąd przy pobieraniu nowych użytkowników:', error);
    res.status(500).json({ error: 'Wystąpił błąd podczas pobierania nowych użytkowników.' });
  }
});

// Serwowanie strony z liczbą członków, ról, wiadomości, aktywnych użytkowników i nowych użytkowników
app.use(express.static('public'));

// Obsługa błędów 404
app.use((req, res, next) => {
  res.status(404).send('Sorry, we cannot find that!');
});

// Obsługa błędów 500
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

client.login(token);

app.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});
