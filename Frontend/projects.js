const projects = [
    {
        id: 1,
        title: 'Personal Portfolio',
        category: 'web',
        year: 2026,
        colors: ['#fda228', '#fc3e6b'],
        summary: 'A hand-coded portfolio.',
        description: 'Built from scratch with plain HTML, CSS and JavaScript.',
        stack: ['HTML', 'CSS', 'JavaScript'],
        live: '',
        code: ''
    },
    {
        id: 2,
        title: 'Poncat',
        category: 'content',
        year: 2026,
        colors: ['#1daafc', '#7b61ff'],
        summary: 'First youtube automation channel that focuses on cat videos',
        description: 'First youtube automation channel that focuses on cat videos. Has about 1.24k subs. All videos were edited with CapCut.',
        stack: ['HTML', 'CSS', 'JavaScript', 'Responsive'],
        live: 'https://www.youtube.com/@poncat21',
        code: ''
    },
    
];

const labels = {
    web: 'Web',
    design: 'Design',
    content: 'Content'
};

const grid = document.getElementById('grid');
const count = document.getElementById('count');
const filters = document.querySelectorAll('.filter');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modal-close');
const modalMedia = document.getElementById('modal-media');
const modalMeta = document.getElementById('modal-meta');
const modalTitle = document.getElementById('modal-title');
const modalText = document.getElementById('modal-text');
const modalStack = document.getElementById('modal-stack');
const modalLinks = document.getElementById('modal-links');
const navbar = document.querySelector('.navbar');

const pad = (n) => String(n).padStart(2, '0');

let revealReady = document.body.classList.contains('is-loaded');

const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' })
    : null;

function observeCards() {
    if (!revealReady) return;
    grid.querySelectorAll('.project-card:not(.is-visible)').forEach((card) => {
        if (observer) {
            observer.observe(card);
        } else {
            card.classList.add('is-visible');
        }
    });
}

function cardTemplate(project, index) {
    const tags = project.stack.slice(0, 3).map((item) => `<li>${item}</li>`).join('');

    return `
        <article class="project-card is-visible" style="--c1:${project.colors[0]};--c2:${project.colors[1]};--d:${index}">
            <div class="project-card__media">
                <span class="project-card__num">${pad(project.id)}</span>
                <span class="project-card__arrow" aria-hidden="true">&nearr;</span>
            </div>
            <div class="project-card__body">
                <p class="project-card__meta"><span>${labels[project.category]}</span><span>${project.year}</span></p>
                <h3 class="project-card__title">${project.title}</h3>
                <p class="project-card__summary">${project.summary}</p>
                <ul class="chips">${tags}</ul>
            </div>
            <button class="project-card__open" type="button" data-id="${project.id}" aria-label="View ${project.title}"></button>
        </article>
    `;
}

function render(filter) {
    const list = filter === 'all'
        ? projects
        : projects.filter((project) => project.category === filter);

    grid.innerHTML = list.map(cardTemplate).join('');
    count.textContent = `${list.length} ${list.length === 1 ? 'project' : 'projects'}`;
    observeCards();
}

function openModal(id) {
    const project = projects.find((item) => item.id === id);
    if (!project) return;

    modalMedia.style.setProperty('--c1', project.colors[0]);
    modalMedia.style.setProperty('--c2', project.colors[1]);
    modalMedia.textContent = pad(project.id);
    modalMeta.textContent = `${labels[project.category]} · ${project.year}`;
    modalTitle.textContent = project.title;
    modalText.textContent = project.description;
    modalStack.innerHTML = project.stack.map((item) => `<li>${item}</li>`).join('');

    const links = [];

    if (project.live) {
        links.push(`<a class="btn" href="${project.live}" target="_blank" rel="noopener noreferrer">Live site &nearr;</a>`);
    }

    if (project.code) {
        links.push(`<a class="btn btn--ghost" href="${project.code}" target="_blank" rel="noopener noreferrer">Source code</a>`);
    }

    modalLinks.innerHTML = links.length
        ? links.join('')
        : '<p class="modal__soon">Links coming soon.</p>';

    modal.showModal();
    document.body.classList.add('modal-open');
}

grid.addEventListener('click', (event) => {
    const button = event.target.closest('.project-card__open');
    if (button) openModal(Number(button.dataset.id));
});

modalClose.addEventListener('click', () => modal.close());

modal.addEventListener('click', (event) => {
    if (event.target === modal) modal.close();
});

modal.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
});

filters.forEach((button) => {
    button.addEventListener('click', () => {
        if (button.classList.contains('is-active')) return;

        filters.forEach((item) => {
            const active = item === button;
            item.classList.toggle('is-active', active);
            item.setAttribute('aria-pressed', String(active));
        });

        grid.classList.add('is-swapping');

        setTimeout(() => {
            render(button.dataset.filter);
            grid.classList.remove('is-swapping');
        }, reduceMotion ? 0 : 250);
    });
});

window.addEventListener('scroll', () => {
    navbar.classList.toggle('is-scrolled', window.scrollY > 24);
}, { passive: true });

document.getElementById('year').textContent = new Date().getFullYear();

render('all');

if (!revealReady) {
    const watcher = new MutationObserver(() => {
        if (document.body.classList.contains('is-loaded')) {
            watcher.disconnect();
            revealReady = true;
            observeCards();
            setTimeout(() => grid.style.setProperty('--base', '0s'), 2200);
        }
    });

    watcher.observe(document.body, { attributes: true, attributeFilter: ['class'] });
} else {
    grid.style.setProperty('--base', '0s');
}



