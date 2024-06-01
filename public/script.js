async function fetchStats() {
  try {
    const [statsResponse, activeMembersResponse, newMembersResponse] = await Promise.all([
      fetch('/.netlify/functions/server/api/stats'),
      fetch('/.netlify/functions/server/api/active-members'),
      fetch('/.netlify/functions/server/api/new-members')
    ]);

    const stats = await statsResponse.json();
    const activeMembers = await activeMembersResponse.json();
    const newMembers = await newMembersResponse.json();

    document.getElementById('stats').querySelector('p').innerHTML = `
      <p>Liczba członków: ${stats.memberCount}</p>
      <p>Liczba ról: ${stats.rolesCount}</p>
      <p>Liczba wiadomości w ciągu ostatniego dnia: ${stats.messagesCount}</p>
      <p>Liczba aktywnych użytkowników: ${activeMembers.onlineMembers}</p>
    `;
    document.getElementById('new-members').querySelector('p').innerHTML = `
      <ul>${newMembers.newMembersList.map(member => `<li>${member}</li>`).join('')}</ul>
    `;
  } catch (error) {
    console.error('Błąd przy pobieraniu statystyk:', error);
    document.getElementById('stats').innerText = 'Wystąpił błąd.';
    document.getElementById('new-members').innerText = 'Wystąpił błąd przy pobieraniu nowych użytkowników.';
  }
}

fetchStats();
