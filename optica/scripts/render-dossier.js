function getSlug() {
  const params = new URLSearchParams(window.location.search);
  return params.get('slug') || 'energy-shock';
}

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function chipsHTML(items = []) {
  return items.map(item => `<span class="chip">${item}</span>`).join('');
}

function renderTopSection(section, className) {
  return `
    <article class="${className} glass">
      <span class="eyebrow">${section.eyebrow || ''}</span>
      <h3>${section.title || ''}</h3>
      <p>${section.text || ''}</p>
      ${section.chips ? `<div class="chips">${chipsHTML(section.chips)}</div>` : ''}
    </article>
  `;
}

function renderSummaryCard(card) {
  return `
    <article class="card-small glass">
      <span class="eyebrow">${card.eyebrow || ''}</span>
      <h3>${card.title || ''}</h3>
      <p>${card.text || ''}</p>
    </article>
  `;
}

function renderBoard(board) {
  const edges = board.edges.map(edge => `<line x1="${edge.x1}" y1="${edge.y1}" x2="${edge.x2}" y2="${edge.y2}" stroke="rgba(221,180,138,.24)" stroke-width="1.5" />`).join('');
  const nodes = board.nodes.map((node, idx) => `
    <button class="node ${idx === 0 ? 'is-active' : ''}" data-key="${node.id}" style="left:${node.x}px; top:${node.y}px;">
      <small>${node.eyebrow}</small>
      <strong>${node.title}</strong>
      <span>${node.short}</span>
    </button>
  `).join('');

  return `
    <div class="board-wrap">
      <svg class="board-svg" viewBox="0 0 640 460" preserveAspectRatio="none" aria-hidden="true">${edges}</svg>
      ${nodes}
      <div class="pull-line"><div class="thread"></div><div class="tag" id="pull-tag" aria-label="Переключить узел"></div></div>
    </div>
    <aside class="dossier-panel glass">
      <span class="eyebrow">карта связей</span>
      <h3 id="panel-title"></h3>
      <p id="panel-text"></p>
      <ul id="panel-list"></ul>
    </aside>
  `;
}

function renderTable(table) {
  document.getElementById('table-head').innerHTML = `<tr>${table.columns.map(c => `<th>${c}</th>`).join('')}</tr>`;
  document.getElementById('table-body').innerHTML = table.rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('');
}

async function init() {
  const slug = getSlug();
  const data = await loadJSON(`./data/dossiers/${slug}.json`);

  document.title = `${data.title} — Optica`;
  document.getElementById('dossier-title').textContent = data.title;
  document.getElementById('dossier-lead').textContent = data.lead;
  document.getElementById('dossier-chips').innerHTML = chipsHTML(data.chips);
  document.getElementById('hero-quote').textContent = data.heroQuotes[0] || '';

  const lensButton = document.getElementById('lens-button');
  let quoteIndex = 0;
  lensButton.addEventListener('click', () => {
    quoteIndex = (quoteIndex + 1) % data.heroQuotes.length;
    document.getElementById('hero-quote').textContent = data.heroQuotes[quoteIndex];
    lensButton.classList.add('is-active');
    setTimeout(() => lensButton.classList.remove('is-active'), 800);
  });

  document.getElementById('top-sections').innerHTML = [
    renderTopSection(data.topSections[0], 'card-large'),
    renderTopSection(data.topSections[1], 'card-side')
  ].join('');

  document.getElementById('summary-cards').innerHTML = data.summaryCards.map(renderSummaryCard).join('');
  document.getElementById('board-root').innerHTML = renderBoard(data.board);
  renderTable(data.table);

  const nodes = [...document.querySelectorAll('.node')];
  const panelTitle = document.getElementById('panel-title');
  const panelText = document.getElementById('panel-text');
  const panelList = document.getElementById('panel-list');
  const pullTag = document.getElementById('pull-tag');

  function setPanel(id) {
    const item = data.board.nodes.find(n => n.id === id) || data.board.nodes[0];
    panelTitle.textContent = item.title;
    panelText.textContent = item.text;
    panelList.innerHTML = item.items.map(x => `<li>${x}</li>`).join('');
    nodes.forEach(node => node.classList.toggle('is-active', node.dataset.key === id));
  }

  nodes.forEach(node => node.addEventListener('click', () => setPanel(node.dataset.key)));
  pullTag.addEventListener('click', () => {
    const active = document.querySelector('.node.is-active')?.dataset.key || data.board.nodes[0].id;
    const order = data.board.nodes.map(n => n.id);
    const idx = order.indexOf(active);
    setPanel(order[(idx + 1) % order.length]);
  });

  setPanel(data.board.nodes[0].id);
}

init().catch(err => {
  console.error(err);
  document.getElementById('dossier-title').textContent = 'Не удалось загрузить досье';
});
