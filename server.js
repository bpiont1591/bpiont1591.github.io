const express = require('express');
const { Client, Intents } = require('discord.js');
const moment = require('moment');
const config = require('./config.js');
const token = config.token;

const app = express();
const port = 3000;

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
    status: config.status,
    activities: [{
      name: config.activity.name,
      type: config.activity.type,
    }],
  });
});

// Endpoint API do pobierania liczby członków, ról i wiadomości
app.get('/api/stats', async (req, res) => {
  try {
    const guild = await client.guilds.fetch(config.guildId);
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
    const guild = await client.guilds.fetch(config.guildId);
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
    const guild = await client.guilds.fetch(config.guildId);
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
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Statystyki serwera</title>
      </head>
      <body>
        <h1>Statystyki serwera</h1>
        <div id="stats">Ładowanie...</div>
        <div id="new-members">Ładowanie nowych użytkowników...</div>
        <script>
          async function fetchStats() {
            try {
              const [statsResponse, activeMembersResponse, newMembersResponse] = await Promise.all([
                fetch('/api/stats'),
                fetch('/api/active-members'),
                fetch('/api/new-members')
              ]);
              const statsText = await statsResponse.text();
              const activeMembersText = await activeMembersResponse.text();
              const newMembersText = await newMembersResponse.text();

              console.log('statsResponse:', statsText); // Dodane logowanie odpowiedzi
              console.log('activeMembersResponse:', activeMembersText); // Dodane logowanie odpowiedzi
              console.log('newMembersResponse:', newMembersText); // Dodane logowanie odpowiedzi

              const stats = JSON.parse(statsText);
              const activeMembers = JSON.parse(activeMembersText);
              const newMembers = JSON.parse(newMembersText);

              document.getElementById('stats').innerHTML = \`
                <p>Liczba członków: \${stats.memberCount}</p>
                <p>Liczba ról: \${stats.rolesCount}</p>
                <p>Liczba wiadomości w ciągu ostatniego dnia: \${stats.messagesCount}</p>
                <p>Liczba aktywnych użytkowników: \${activeMembers.onlineMembers}</p>
              \`;
              document.getElementById('new-members').innerHTML = \`
                <h2>Nowi użytkownicy (ostatni tydzień)</h2>
                <ul>\${newMembers.newMembersList.map(member => \`<li>\${member}</li>\`).join('')}</ul>
              \`;
            } catch (error) {
              console.error('Błąd przy pobieraniu statystyk:', error);
              document.getElementById('stats').innerText = 'Wystąpił błąd.';
              document.getElementById('new-members').innerText = 'Wystąpił błąd przy pobieraniu nowych użytkowników.';
            }
          }
          fetchStats();
        </script>
      </body>
    </html>
  `);
});

client.login(token);

app.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});


