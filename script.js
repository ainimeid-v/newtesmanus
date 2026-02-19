/* CONSOLIDATED RPG SCRIPT SYSTEM */

const CONFIG = {
    csvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTfX6o_W1y8q6v_r1R_S1p_S1p_S1p_S1p_S1p_S1p_S1p_S1p_S1p_S1p_S1p/pub?output=csv',
    categories: ['Character', 'Monster', 'Pet', 'Item', 'Magic']
};

let rawData = [];
let currentCat = localStorage.getItem('currentCat') || 'Character';
let filters = { search: '', rarity: '', tags: [] };

// --- UI UTILS ---
const UI = {
    pages: document.querySelectorAll('.page'),
    themeToggle: document.getElementById('theme-toggle'),
    clock: document.getElementById('system-clock'),
    date: document.getElementById('system-date'),
    loading: document.getElementById('loading-screen'),
    modal: document.getElementById('category-modal'),
    patchModal: document.getElementById('patch-modal'),
    viewer: document.getElementById('image-viewer'),
    viewerImg: document.getElementById('viewer-img'),
    
    showPage(pageId) {
        this.pages.forEach(p => {
            p.classList.remove('active');
            p.scrollTop = 0;
        });
        const target = document.getElementById(pageId);
        target.classList.add('active');
        localStorage.setItem('currentPage', pageId);
        window.scrollTo(0, 0);
    },

    updateClock() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        this.clock.innerText = `${h}:${m}:${s}`;
        
        const d = String(now.getDate()).padStart(2, '0');
        const mon = now.toLocaleString('default', { month: 'short' }).toUpperCase();
        const y = now.getFullYear();
        this.date.innerText = `${d} ${mon} ${y}`;
    },

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        this.themeToggle.innerHTML = next === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    }
};

// --- DATA HANDLING ---
async function loadRealmData() {
    try {
        if (CONFIG.csvUrl.includes('S1p_S1p')) {
            rawData = getMockArchive();
        } else {
            const response = await fetch(CONFIG.csvUrl);
            const csvText = await response.text();
            rawData = parseCSV(csvText);
        }
    } catch (e) {
        rawData = getMockArchive();
    }
}

function getMockArchive() {
    const data = [];
    const images = [
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop',
        'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=600&fit=crop',
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=600&fit=crop'
    ];
    CONFIG.categories.forEach(cat => {
        for (let i = 1; i <= 6; i++) {
            data.push({
                category: cat, name: `${cat} Legend ${i}`, nickname: `Title of ${cat}`,
                rarity: ['S', 'A', 'B', 'C', 'D'][Math.floor(Math.random() * 5)],
                main_image_url: images[i % 3],
                extra_image_1: 'https://picsum.photos/400/400?random=1',
                extra_image_2: 'https://picsum.photos/400/400?random=2',
                extra_image_3: 'https://picsum.photos/400/400?random=3',
                tags: `${cat}, Power, Ancient`,
                story: `Born from the fragments of the old world, this ${cat} possesses power beyond mortal comprehension.`
            });
        }
    });
    return data;
}

// --- LOADING ANIMATION ---
function startLoading() {
    let progress = 0;
    const bar = document.getElementById('loading-progress');
    const text = document.getElementById('loading-percentage');
    
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 2;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                UI.loading.style.opacity = '0';
                setTimeout(() => UI.loading.classList.add('hidden'), 500);
            }, 500);
        }
        bar.style.width = progress + '%';
        text.innerText = progress + '%';
    }, 100);
}

// --- MAIN LOGIC ---
async function init() {
    startLoading();
    await loadRealmData();

    // Restore Page State
    const savedPage = localStorage.getItem('currentPage') || 'page-1';
    UI.showPage(savedPage);
    if (savedPage === 'page-2') {
        selectRealm(currentCat, false);
    }

    // Page 1
    document.getElementById('start-btn').onclick = () => {
        document.getElementById('start-btn').classList.add('hidden');
        document.getElementById('patch-btn').classList.add('hidden');
        document.querySelector('.patch-ver-text').classList.add('hidden');
        document.getElementById('category-grid').classList.remove('hidden');
    };

    document.getElementById('cancel-cat-btn').onclick = () => {
        document.getElementById('start-btn').classList.remove('hidden');
        document.getElementById('patch-btn').classList.remove('hidden');
        document.querySelector('.patch-ver-text').classList.remove('hidden');
        document.getElementById('category-grid').classList.add('hidden');
    };

    document.querySelectorAll('.cat-card').forEach(card => {
        card.onclick = () => selectRealm(card.dataset.category);
    });

    // Nav
    document.querySelectorAll('.back-to-1').forEach(btn => btn.onclick = () => UI.showPage('page-1'));
    document.querySelectorAll('.back-to-2').forEach(btn => btn.onclick = () => UI.showPage('page-2'));
    
    // Page 2
    document.getElementById('filter-btn').onclick = () => document.getElementById('filter-panel').classList.toggle('hidden');
    document.getElementById('quick-change-btn').onclick = () => {
        const modalList = document.getElementById('mini-cat-list');
        modalList.innerHTML = CONFIG.categories
            .filter(c => c !== currentCat)
            .map(c => `<div class="m-cat" onclick="selectRealm('${c}')">${c}</div>`)
            .join('');
        UI.modal.classList.remove('hidden');
    };

    document.getElementById('unit-search').oninput = (e) => {
        filters.search = e.target.value.toLowerCase();
        renderArchive();
    };

    document.querySelectorAll('.r-chip').forEach(chip => {
        chip.onclick = () => {
            if (chip.classList.contains('active')) { chip.classList.remove('active'); filters.rarity = ''; }
            else {
                document.querySelectorAll('.r-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active'); filters.rarity = chip.dataset.rarity;
            }
            renderArchive();
        };
    });

    document.getElementById('reset-filters').onclick = () => {
        filters = { search: '', rarity: '', tags: [] };
        document.getElementById('unit-search').value = '';
        document.querySelectorAll('.r-chip, .t-chip').forEach(c => c.classList.remove('active'));
        renderArchive();
    };

    // Close Modals
    document.getElementById('close-modal').onclick = () => UI.modal.classList.add('hidden');
    document.getElementById('close-patch').onclick = () => UI.patchModal.classList.add('hidden');
    UI.themeToggle.onclick = () => UI.toggleTheme();
    
    setInterval(() => UI.updateClock(), 1000);
    UI.updateClock();

    // Auto Hide Nav Page 3
    const page3 = document.getElementById('page-3');
    const nav3 = page3.querySelector('.detail-nav-static');
    let lastScrollTop = 0;
    page3.addEventListener('scroll', () => {
        let st = page3.scrollTop;
        if (st > lastScrollTop && st > 50) nav3.classList.add('nav-hidden');
        else nav3.classList.remove('nav-hidden');
        lastScrollTop = st <= 0 ? 0 : st;
    });

    initMinigame();
}

function selectRealm(cat, shouldShowPage = true) {
    currentCat = cat;
    localStorage.setItem('currentCat', cat);
    document.body.className = `theme-${cat.toLowerCase()}`;
    document.getElementById('category-title').innerText = cat.toUpperCase();
    UI.modal.classList.add('hidden');
    populateTags();
    renderArchive();
    if (shouldShowPage) UI.showPage('page-2');
}

function populateTags() {
    const tags = new Set();
    rawData.filter(u => u.category === currentCat).forEach(u => {
        if (u.tags) u.tags.split(',').forEach(t => tags.add(t.trim()));
    });
    const container = document.getElementById('dynamic-tags');
    container.innerHTML = '';
    tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 't-chip';
        span.innerText = tag;
        span.onclick = () => {
            if (span.classList.contains('active')) {
                span.classList.remove('active');
                filters.tags = filters.tags.filter(t => t !== tag);
            } else {
                span.classList.add('active');
                filters.tags.push(tag);
            }
            renderArchive();
        };
        container.appendChild(span);
    });
}

function renderArchive() {
    const grid = document.getElementById('unit-grid');
    const filtered = rawData.filter(u => {
        const matchCat = u.category === currentCat;
        const matchSearch = u.name.toLowerCase().includes(filters.search);
        const matchRarity = filters.rarity ? u.rarity === filters.rarity : true;
        const matchTags = filters.tags.length > 0 ? filters.tags.every(t => u.tags && u.tags.includes(t)) : true;
        return matchCat && matchSearch && matchRarity && matchTags;
    });
    grid.innerHTML = filtered.map(u => `
        <div class="unit-card" onclick="showLegendDetail('${u.name}')">
            <div style="position:relative">
                <img src="${u.main_image_url}" alt="${u.name}">
                <div class="unit-rarity">${u.rarity}</div>
            </div>
            <div class="unit-info"><div class="name">${u.name}</div></div>
        </div>
    `).join('');
}

function showLegendDetail(name) {
    const unit = rawData.find(u => u.name === name);
    if (!unit) return;
    document.getElementById('detail-img').src = unit.main_image_url;
    document.getElementById('detail-rarity-badge').innerText = unit.rarity;
    document.getElementById('detail-name').innerText = unit.name;
    document.getElementById('detail-nickname').innerText = unit.nickname ? `"${unit.nickname}"` : "";
    document.getElementById('detail-story').innerText = unit.story;
    const tagContainer = document.getElementById('detail-tags-container');
    tagContainer.innerHTML = unit.tags ? unit.tags.split(',').map(t => `<span class="tag">${t.trim()}</span>`).join('') : '';
    UI.showPage('page-3');
}

// --- MINIGAME LOGIC ---
function initMinigame() {
    const modal = document.getElementById('minigame-modal');
    const trigger = document.getElementById('minigame-trigger');
    const close = document.getElementById('close-minigame');
    const setup = document.getElementById('minigame-setup');
    const play = document.getElementById('minigame-play');
    const grid = document.getElementById('memory-grid');
    
    let cards = [];
    let flipped = [];
    let matched = 0;
    let score = 0;
    let timer = 0;
    let timerInterval;

    trigger.onclick = () => modal.classList.remove('hidden');
    close.onclick = () => {
        modal.classList.add('hidden');
        resetGame();
    };

    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.onclick = () => startGame(btn.dataset.diff);
    });

    function startGame(diff) {
        setup.classList.add('hidden');
        play.classList.remove('hidden');
        
        let pairs = 4;
        let cols = 4;
        if (diff === 'medium') { pairs = 6; cols = 4; }
        if (diff === 'hard') { pairs = 8; cols = 4; }
        if (diff === 'insane') { pairs = 12; cols = 6; }

        grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        
        const icons = ['⚔️', '🛡️', '🔥', '❄️', '⚡', '🌟', '💎', '🐉', '🍀', '🎭', '🏹', '🧪'];
        const gameIcons = [...icons.slice(0, pairs), ...icons.slice(0, pairs)];
        gameIcons.sort(() => Math.random() - 0.5);

        grid.innerHTML = '';
        gameIcons.forEach((icon, i) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.icon = icon;
            card.dataset.index = i;
            card.onclick = () => flipCard(card);
            grid.appendChild(card);
        });

        timer = 0;
        score = 0;
        matched = 0;
        document.getElementById('game-timer').innerText = timer;
        document.getElementById('game-score').innerText = score;
        
        timerInterval = setInterval(() => {
            timer++;
            document.getElementById('game-timer').innerText = timer;
        }, 1000);
    }

    function flipCard(card) {
        if (flipped.length < 2 && !card.classList.contains('flipped')) {
            card.classList.add('flipped');
            card.innerText = card.dataset.icon;
            flipped.push(card);

            if (flipped.length === 2) {
                if (flipped[0].dataset.icon === flipped[1].dataset.icon) {
                    flipped.forEach(c => c.classList.add('matched'));
                    matched++;
                    score += 10;
                    document.getElementById('game-score').innerText = score;
                    flipped = [];
                    if (matched === grid.children.length / 2) {
                        clearInterval(timerInterval);
                        setTimeout(() => alert(`VICTORY! Score: ${score}, Time: ${timer}s`), 500);
                    }
                } else {
                    setTimeout(() => {
                        flipped.forEach(c => {
                            c.classList.remove('flipped');
                            c.innerText = '';
                        });
                        flipped = [];
                    }, 1000);
                }
            }
        }
    }

    function resetGame() {
        clearInterval(timerInterval);
        setup.classList.remove('hidden');
        play.classList.add('hidden');
        grid.innerHTML = '';
        flipped = [];
    }
}

init();
