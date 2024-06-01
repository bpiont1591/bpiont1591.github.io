async function fetchStats() {
  try {
    const [statsResponse, activeMembersResponse, newMembersResponse, top10Response, top10InviteResponse] = await Promise.all([
      fetch('/api/stats'),
      fetch('/api/active-members'),
      fetch('/api/new-members'),
      fetch('/api/top10poziom'),
      fetch('/api/top10invite')
    ]);
    const stats = await statsResponse.json();
    const activeMembers = await activeMembersResponse.json();
    const newMembers = await newMembersResponse.json();
    const top10 = await top10Response.json();
    const top10Invite = await top10InviteResponse.json();

    document.getElementById('stats').querySelector('p').innerHTML = `
      <p>Liczba członków: ${stats.memberCount}</p>
      <p>Liczba ról: ${stats.rolesCount}</p>
      <p>Liczba wiadomości w ciągu ostatniego dnia: ${stats.messagesCount}</p>
      <p>Liczba aktywnych użytkowników: ${activeMembers.onlineMembers}</p>
    `;
    document.getElementById('new-members').querySelector('p').innerHTML = `
      <ul>${newMembers.newMembersList.map(member => `<li>${member}</li>`).join('')}</ul>
    `;
    document.getElementById('top10poziom').querySelector('p').innerHTML = `
      <ul>
        ${top10.top10.map(user => `<li>${user.rank}. ${user.name} - Poziom: ${user.level} | XP: ${user.xp}</li>`).join('')}
      </ul>
    `;
    document.getElementById('top10invite').querySelector('p').innerHTML = `
      <ul>
        ${top10Invite.top10.map(user => `<li>${user.rank}. ${user.name} - Zaprosił(a) ${user.invites} użytkowników</li>`).join('')}
      </ul>
    `;
  } catch (error) {
    console.error('Błąd przy pobieraniu statystyk:', error);
    document.getElementById('stats').innerText = 'Wystąpił błąd.';
    document.getElementById('new-members').innerText = 'Wystąpił błąd przy pobieraniu nowych użytkowników.';
    document.getElementById('top10poziom').innerText = 'Wystąpił błąd przy pobieraniu rankingów.';
    document.getElementById('top10invite').innerText = 'Wystąpił błąd przy pobieraniu rankingów zaproszeń.';
  }
}

fetchStats();
