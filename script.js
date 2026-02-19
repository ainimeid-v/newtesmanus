/* CONSOLIDATED RPG SCRIPT SYSTEM */

const CONFIG = {
    // Replace with your CSV URL
    csvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTfX6o_W1y8q6v_r1R_S1p_S1p_S1p_S1p_S1p_S1p_S1p_S1p_S1p_S1p_S1p/pub?output=csv',
    categories: ['Character', 'Monster', 'Pet', 'Item', 'Magic']
};

let rawData = [];
let currentCat = 'Character';
let filters = { search: '', rarity: '', tag: '' };

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
    },

    handleCarousel(el) {
        const track = document.getElementById('carousel-track');
        const imgs = Array.from(track.querySelectorAll('.extra-img'));
        
        if (el.classList.contains('active')) {
            this.viewerImg.src = el.src;
            this.viewer.classList.remove('hidden');
        } else {
            const index = imgs.indexOf(el);
            if (index === 0) track.insertBefore(imgs[imgs.length - 1], imgs[0]);
            else if (index === 2) track.appendChild(imgs[0]);
            
            const newImgs = Array.from(track.querySelectorAll('.extra-img'));
            newImgs.forEach(img => img.classList.remove('active'));
            newImgs[1].classList.add('active');
        }
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

function parseCSV(csv) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/ /g, '_'));
    return lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((header, i) => { obj[header] = values[i]; });
        return obj;
    });
}

function getMockArchive() {
    const data = [];
    const images = [
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop',
        'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=600&fit=crop',
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=600&fit=crop'
    ];
    CONFIG.categories.forEach(cat => {
        for (let i = 1; i <= 3; i++) {
            data.push({
                category: cat, name: `${cat} Legend ${i}`, nickname: `Title of ${cat}`,
                rarity: ['S', 'A', 'B', 'C', 'D'][Math.floor(Math.random() * 5)],
                main_image_url: images[i-1],
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

// --- MAIN LOGIC ---
async function init() {
    await loadRealmData();
    UI.loading.style.opacity = '0';
    setTimeout(() => UI.loading.classList.add('hidden'), 500);

    // Page 1
    document.getElementById('start-btn').onclick = () => {
        document.getElementById('start-btn').classList.add('hidden');
        document.getElementById('patch-btn').classList.add('hidden');
        document.getElementById('category-grid').classList.remove('hidden');
    };

    // CANCEL CAT BTN
    const cancelBtn = document.getElementById('cancel-cat-btn');
    if (cancelBtn) {
        cancelBtn.onclick = () => {
            document.getElementById('start-btn').classList.remove('hidden');
            document.getElementById('patch-btn').classList.remove('hidden');
            document.getElementById('category-grid').classList.add('hidden');
        };
    }

    document.getElementById('patch-btn').onclick = () => {
        document.getElementById('patch-text').innerHTML = `
            <strong>UPDATE v1.0.8</strong><br><br>
            - Improved UI transitions and animations.<br>
            - Fixed sticky navigation for Archive and Detail.<br>
            - Optimized slider stability (no more vibration).<br>
            - Theme-consistent button colors across all modals.<br>
            - Dynamic Lore box auto-adjustment.<br><br>
            <em>System fully optimized.</em>
        `;
        UI.patchModal.classList.remove('hidden');
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
        filters = { search: '', rarity: '', tag: '' };
        document.getElementById('unit-search').value = '';
        document.querySelectorAll('.r-chip, .t-chip').forEach(c => c.classList.remove('active'));
        renderArchive();
    };

    // Close Modals
    document.getElementById('close-modal').onclick = () => UI.modal.classList.add('hidden');
    document.getElementById('close-patch').onclick = () => UI.patchModal.classList.add('hidden');
    document.querySelector('.close-viewer').onclick = () => UI.viewer.classList.add('hidden');
    UI.themeToggle.onclick = () => UI.toggleTheme();
    
    setInterval(() => UI.updateClock(), 1000);
    UI.updateClock();
}

function selectRealm(cat) {
    currentCat = cat;
    document.body.className = `theme-${cat.toLowerCase()}`;
    document.getElementById('category-title').innerText = cat.toUpperCase();
    UI.modal.classList.add('hidden');
    filters = { search: '', rarity: '', tag: '' };
    document.getElementById('unit-search').value = '';
    document.querySelectorAll('.r-chip').forEach(c => c.classList.remove('active'));
    populateTags();
    renderArchive();
    UI.showPage('page-2');
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
            if (span.classList.contains('active')) { span.classList.remove('active'); filters.tag = ''; }
            else {
                document.querySelectorAll('.t-chip').forEach(c => c.classList.remove('active'));
                span.classList.add('active'); filters.tag = tag;
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
        const matchTag = filters.tag ? (u.tags && u.tags.includes(filters.tag)) : true;
        return matchCat && matchSearch && matchRarity && matchTag;
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
    tagContainer.innerHTML = unit.tags ? unit.tags.split(',').map(t => `<span class="tag" onclick="jumpToTag('${t.trim()}')">${t.trim()}</span>`).join('') : '';
    const track = document.getElementById('carousel-track');
    const images = [unit.extra_image_1, unit.extra_image_2, unit.extra_image_3].filter(img => img);
    track.innerHTML = images.map((img, i) => `
        <img class="extra-img ${i === 1 ? 'active' : ''}" src="${img}" onclick="UI.handleCarousel(this)">
    `).join('');
    UI.showPage('page-3');
}

function jumpToTag(tag) {
    UI.showPage('page-2');
    document.getElementById('filter-panel').classList.remove('hidden');
    filters.tag = tag;
    renderArchive();
    document.querySelectorAll('.t-chip').forEach(c => {
        if (c.innerText === tag) c.classList.add('active');
        else c.classList.remove('active');
    });
}

init();
