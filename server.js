const express = require('express');
const { Client, Intents } = require('discord.js');
const moment = require('moment');
const path = require('path');
const fs = require('fs').promises;
const config = require('./config.js');
const token = config.token;

const app = express();
const port = process.env.PORT || 3000;

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
  ]
});

client.once('ready', () => {
  console.log('Bot jest online!');
  client.user.setPresence({
    status: config.status,
    activities: [{
      name: config.activity.name,
      type: config.activity.type,
    }],
  });
});

app.get('/api/stats', async (req, res) => {
  try {
    const guild = await client.guilds.fetch(config.guildId);
    const memberCount = guild.memberCount;
    const rolesCount = guild.roles.cache.size;

    const now = moment();
    const oneDayAgo = now.subtract(1, 'days');
    let messagesCount = 0;

    const channels = guild.channels.cache.filter(channel => channel.isText());
    for (const channel of channels.values()) {
      const messages = await channel.messages.fetch({ limit: 100 });
      messagesCount += messages.filter(msg => moment(msg.createdAt).isAfter(oneDayAgo)).size;
    }

    res.json({ memberCount, rolesCount, messagesCount });
  } catch (error) {
    console.error('Błąd przy pobieraniu statystyk:', error);
    res.status(500).json({ error: 'Wystąpił błąd podczas pobierania statystyk.' });
  }
});

app.get('/api/active-members', async (req, res) => {
  try {
    const guild = await client.guilds.fetch(config.guildId);
    const onlineMembers = guild.members.cache.filter(member => member.presence?.status === 'online').size;
    res.json({ onlineMembers });
  } catch (error) {
    console.error('Błąd przy pobieraniu liczby aktywnych użytkowników:', error);
    res.status(500).json({ error: 'Wystąpił błąd podczas pobierania liczby aktywnych użytkowników.' });
  }
});

app.get('/api/new-members', async (req, res) => {
  try {
    const guild = await client.guilds.fetch(config.guildId);
    const oneWeekAgo = moment().subtract(7, 'days');
    const newMembers = guild.members.cache.filter(member => moment(member.joinedAt).isAfter(oneWeekAgo));
    const newMembersList = newMembers.map(member => member.user.tag);
    res.json({ newMembersList });
  } catch (error) {
    console.error('Błąd przy pobieraniu nowych użytkowników:', error);
    res.status(500).json({ error: 'Wystąpił błąd podczas pobierania nowych użytkowników.' });
  }
});

app.get('/api/top10poziom', async (req, res) => {
  const usersPath = path.join(__dirname, 'events', 'users.json');
  let users = {};

  try {
    const data = await fs.readFile(usersPath, 'utf8');
    users = JSON.parse(data);
  } catch (error) {
    console.error(`Error loading users data: ${error.message}`);
    res.status(500).json({ error: 'Wystąpił błąd podczas przetwarzania danych.' });
    return;
  }

  const sortedUsers = Object.entries(users)
    .sort(([, a], [, b]) => b.level - a.level || b.xp - a.xp)
    .slice(0, 10);

  const memberPromises = sortedUsers.map(async ([userId]) => {
    try {
      return await client.guilds.cache.get(config.guildId).members.fetch(userId);
    } catch (error) {
      console.error(`Error fetching member ${userId}: ${error.message}`);
      return null;
    }
  });

  const members = await Promise.all(memberPromises);

  const top10 = members
    .filter(member => member !== null)
    .map((member, index) => ({
      name: member.displayName,
      level: users[member.id].level,
      xp: users[member.id].xp,
      rank: index + 1
    }));

  res.json({ top10 });
});

app.get('/api/top10invite', async (req, res) => {
  const inviteDataPath = path.join(__dirname, 'inviteData.json');
  let inviteData = {};

  try {
    const data = await fs.readFile(inviteDataPath, 'utf8');
    inviteData = JSON.parse(data);
  } catch (error) {
    console.error(`Error loading invite data: ${error.message}`);
    res.status(500).json({ error: 'Wystąpił błąd podczas przetwarzania danych.' });
    return;
  }

  const sortedInviters = Object.entries(inviteData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const memberPromises = sortedInviters.map(async ([userId]) => {
    try {
      return await client.guilds.cache.get(config.guildId).members.fetch(userId);
    } catch (error) {
      console.error(`Error fetching member ${userId}: ${error.message}`);
      return null;
    }
  });

  const members = await Promise.all(memberPromises);

  const top10 = members
    .filter(member => member !== null)
    .map((member, index) => ({
      name: member.displayName,
      invites: inviteData[member.id],
      rank: index + 1
    }));

  res.json({ top10 });
});

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

client.login(token);

app.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});
