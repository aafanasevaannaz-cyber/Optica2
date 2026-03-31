async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function chipsHTML(items = []) {
  return items.map(item => `<span class="chip">${item}</span>`).join('');
}

function renderCard(card) {
  return `
    <article class="card-small glass">
      <span class="eyebrow">${card.eyebrow || ''}</span>
      <h3>${card.title || ''}</h3>
      <p>${card.text || ''}</p>
    </article>
  `;
}

async function init() {
  const data = await loadJSON('./data/index.json');

  document.getElementById('hero-title').textContent = data.hero.title;
  document.getElementById('hero-text').textContent = data.hero.text;
  document.getElementById('hero-chips').innerHTML = chipsHTML(data.hero.chips);
  document.getElementById('hero-quote').textContent = data.hero.quote;
  document.getElementById('hero-link').href = `./dossier.html?slug=${data.hero.slug}`;

  const featured = document.getElementById('featured-card');
  featured.innerHTML = `
    <span class="eyebrow">${data.featured.eyebrow}</span>
    <h2>${data.featured.title}</h2>
    <p>${data.featured.text}</p>
    <div class="chips">${chipsHTML(data.featured.chips)}</div>
  `;
  featured.onclick = () => location.href = `./dossier.html?slug=${data.featured.slug}`;
  featured.style.cursor = 'pointer';

  const side = document.getElementById('side-card');
  side.innerHTML = `
    <div>
      <span class="eyebrow">${data.side.eyebrow}</span>
      <h3>${data.side.title}</h3>
    </div>
    <p>${data.side.text}</p>
    <div class="chips">${chipsHTML(data.side.chips)}</div>
  `;

  document.getElementById('grid-cards').innerHTML = data.cards.map(renderCard).join('');
}

init().catch(err => {
  console.error(err);
  document.getElementById('hero-text').textContent = 'Не удалось загрузить данные.';
});
