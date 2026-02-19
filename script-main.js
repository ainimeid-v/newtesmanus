/* MAIN CONTROLLER: DATA BINDING, FILTERING, EVENT HANDLING */

let currentCat = 'Character';
let filters = { search: '', rarity: '', tag: '' };

// INITIALIZE
async function initRealm() {
    await loadRealmData();
    UI.loading.style.opacity = '0';
    setTimeout(() => UI.loading.classList.add('hidden'), 500);
    
    // START BTN - FIX BUG: SHOW GRID ONLY ON CLICK
    document.getElementById('start-btn').onclick = (e) => {
        document.getElementById('start-btn').classList.add('hidden');
        document.getElementById('patch-btn').classList.add('hidden');
        document.getElementById('category-grid').classList.remove('hidden');
    };

    // PATCH BTN
    document.getElementById('patch-btn').onclick = () => {
        document.getElementById('patch-text').innerHTML = `
            <strong>UPDATE v1.0.2</strong><br><br>
            - Added dynamic realm selection system.<br>
            - Fixed Page 1 scroll issues.<br>
            - Improved tag visibility and filtering.<br>
            - Optimized Page 3 navigation positioning.<br>
            - New unit entries synchronized with Archive.<br><br>
            <em>Check back later for more updates!</em>
        `;
        UI.patchModal.classList.remove('hidden');
    };

    // CATEGORY SELECTION
    document.querySelectorAll('.cat-card').forEach(card => {
        card.onclick = () => selectRealm(card.dataset.category);
    });

    // NAV BTNS
    document.querySelectorAll('.back-to-1').forEach(btn => btn.onclick = () => UI.showPage('page-1'));
    document.querySelectorAll('.back-to-2').forEach(btn => btn.onclick = () => UI.showPage('page-2'));
    
    // FILTER TOGGLE
    document.getElementById('filter-btn').onclick = () => document.getElementById('filter-panel').classList.toggle('hidden');
    
    // QUICK CHANGE - DYNAMIC MODAL
    document.getElementById('quick-change-btn').onclick = () => {
        const modalList = document.getElementById('mini-cat-list');
        const cats = ['Character', 'Monster', 'Pet', 'Item', 'Magic'];
        modalList.innerHTML = cats
            .filter(c => c !== currentCat) // HIDE CURRENT CAT
            .map(c => `<div class="m-cat" onclick="selectRealm('${c}')">${c}</div>`)
            .join('');
        UI.modal.classList.remove('hidden');
    };

    document.getElementById('close-modal').onclick = () => UI.modal.classList.add('hidden');

    // SEARCH & FILTER INPUTS
    document.getElementById('unit-search').oninput = (e) => {
        filters.search = e.target.value.toLowerCase();
        renderArchive();
    };

    document.querySelectorAll('.r-chip').forEach(chip => {
        chip.onclick = () => {
            if (chip.classList.contains('active')) {
                chip.classList.remove('active');
                filters.rarity = '';
            } else {
                document.querySelectorAll('.r-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                filters.rarity = chip.dataset.rarity;
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
}

function selectRealm(cat) {
    currentCat = cat;
    document.body.className = `theme-${cat.toLowerCase()}`;
    document.getElementById('category-title').innerText = cat.toUpperCase();
    UI.modal.classList.add('hidden');
    
    // Reset internal filters for new category
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
        span.className = 't-chip'; // FIXED CLASS
        span.innerText = tag;
        span.onclick = () => {
            if (span.classList.contains('active')) {
                span.classList.remove('active');
                filters.tag = '';
            } else {
                document.querySelectorAll('.t-chip').forEach(c => c.classList.remove('active'));
                span.classList.add('active');
                filters.tag = tag;
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
            <img src="${u.main_image_url}" alt="${u.name}">
            <div class="unit-rarity">${u.rarity}</div>
            <div class="unit-info">
                <div class="name">${u.name}</div>
            </div>
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

    // Tags in Detail
    const tagContainer = document.getElementById('detail-tags-container');
    tagContainer.innerHTML = unit.tags ? unit.tags.split(',').map(t => `<span class="tag" onclick="jumpToTag('${t.trim()}')">${t.trim()}</span>`).join('') : '';

    // Carousel Setup
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
    
    // Sync UI chips
    document.querySelectorAll('.t-chip').forEach(c => {
        if (c.innerText === tag) c.classList.add('active');
        else c.classList.remove('active');
    });
}

// RUN ARCHIVE
initRealm();
