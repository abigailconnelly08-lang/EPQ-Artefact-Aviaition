const STORAGE_KEY = 'epq-artefact-future-ideas';
const form = document.querySelector('#idea-form');
const authorInput = document.querySelector('#idea-author');
const ideaInput = document.querySelector('#idea-text');
const characterCount = document.querySelector('#character-count');
const pins = document.querySelector('#idea-pins');
const boardCount = document.querySelector('#board-count');
const status = document.querySelector('#idea-board-status');

const starterIdeas = [
  {
    id: 'starter-wind',
    author: 'EPQ sketchbook',
    text: 'Add a wind tunnel challenge where learners change the angle of attack and watch lift respond.',
    date: 'Starter idea'
  },
  {
    id: 'starter-electric',
    author: 'EPQ sketchbook',
    text: 'Compare the forces on a conventional aircraft with a quiet electric aircraft of the future.',
    date: 'Starter idea'
  }
];

function loadIdeas() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : starterIdeas;
  } catch {
    return starterIdeas;
  }
}

let ideas = loadIdeas();

function saveIdeas() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
}

function updateCount() {
  const total = ideas.length;
  boardCount.textContent = `${total} ${total === 1 ? 'idea' : 'ideas'} pinned`;
}

function makePin(idea) {
  const article = document.createElement('article');
  article.className = 'idea-pin';

  const pinTop = document.createElement('div');
  pinTop.className = 'idea-pin-top';

  const remove = document.createElement('button');
  remove.className = 'idea-pin-remove';
  remove.type = 'button';
  remove.setAttribute('aria-label', `Remove idea: ${idea.text}`);
  remove.textContent = '×';
  remove.addEventListener('click', () => {
    ideas = ideas.filter((item) => item.id !== idea.id);
    saveIdeas();
    renderIdeas();
    status.textContent = 'Idea removed from the board.';
  });

  pinTop.appendChild(remove);

  const text = document.createElement('p');
  text.className = 'idea-pin-text';
  text.textContent = idea.text;

  const footer = document.createElement('small');
  footer.className = 'idea-pin-footer';
  footer.textContent = `${idea.author || 'Anonymous explorer'} · ${idea.date}`;

  article.append(pinTop, text, footer);
  return article;
}

function renderIdeas() {
  pins.replaceChildren();
  ideas.forEach((idea) => pins.appendChild(makePin(idea)));
  updateCount();
}

ideaInput.addEventListener('input', () => {
  characterCount.textContent = `${ideaInput.value.length} / 240`;
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = ideaInput.value.trim();
  if (!text) return;

  ideas.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    author: authorInput.value.trim() || 'Anonymous explorer',
    text,
    date: new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  });

  saveIdeas();
  renderIdeas();
  form.reset();
  characterCount.textContent = '0 / 240';
  status.textContent = 'Your idea has been pinned to the board.';
});

renderIdeas();
