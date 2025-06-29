document.addEventListener('DOMContentLoaded', function() {
    
    let bjjData = {};
    const BJJ_DATA_KEY = 'bjjApp_data';

    function getInitialData() {
        // ATUALIZADO: 'videoUrl' agora é 'videoUrls' (um array)
        return {
            finalizacoes: {
                title: 'Finalizações',
                subGroups: { montada: { title: 'Da Montada', techniques: { 'arm-lock-montada': { title: 'Arm-lock', attack: { videoUrls: ['https://www.youtube.com/watch?v=i0nFp7a-j6A'] }, defense: { videoUrls: [] } } } }, costas: { title: 'Das Costas', techniques: { 'mata-leao': { title: 'Mata-Leão', attack: { videoUrls: ['https://www.youtube.com/watch?v=Ci0p2k2a1yY'] }, defense: { videoUrls: ['https://www.youtube.com/watch?v=41nkhPGYJpE']} } } } },
                techniques: { 'chave-pe-reta': { title: 'Chave de Pé Reta', attack: { description: 'Finalização que ataca a articulação do tornozelo.', videoUrls: []}, defense: { videoUrls: [] } } }
            },
            raspagens: {
                title: 'Raspagens',
                subGroups: { 'guarda-aranha': { title: 'Da Guarda Aranha', techniques: { 'raspagem-aranha-basica': { title: 'Básica com as 2 pegadas', attack: { videoUrls: ['https://www.youtube.com/watch?v=gI9F0nB527A']}, defense: { videoUrls: [] }} } } },
                techniques: {}
            }
        };
    }

    function saveData() { localStorage.setItem(BJJ_DATA_KEY, JSON.stringify(bjjData)); }
    function loadData() {
        const savedData = localStorage.getItem(BJJ_DATA_KEY);
        bjjData = savedData ? JSON.parse(savedData) : getInitialData();
        if (!savedData) saveData();
    }

    const mainNav = document.getElementById('main-nav');
    const contentDisplay = document.getElementById('content-display');
    const modal = document.getElementById('config-modal');
    const homeLogo = document.getElementById('home-logo');

    function renderCategoryContent(categoryKey) {
        const category = bjjData[categoryKey]; if (!category) return;
        const subGroupsHtml = Object.keys(category.subGroups || {}).length > 0 ? `<h3 class="content-section-title">Grupos</h3><div class="item-grid">${Object.keys(category.subGroups).map(subKey => `<button class="grid-btn" data-type="subgroup" data-category="${categoryKey}" data-subgroup="${subKey}">${category.subGroups[subKey].title}</button>`).join('')}</div>` : '';
        const techniquesHtml = Object.keys(category.techniques || {}).length > 0 ? `<h3 class="content-section-title">Técnicas Gerais</h3><div class="item-grid">${Object.keys(category.techniques).map(techKey => `<button class="grid-btn" data-type="technique" data-category="${categoryKey}" data-technique="${techKey}">${category.techniques[techKey].title}</button>`).join('')}</div>` : '';
        contentDisplay.innerHTML = `<h2 class="content-title">${category.title}</h2>${subGroupsHtml}${techniquesHtml}${!subGroupsHtml && !techniquesHtml ? '<p>Nenhum item adicionado nesta categoria ainda.</p>' : ''}`;
    }
    function renderSubGroupContent(categoryKey, subGroupKey) {
        const subGroup = bjjData[categoryKey].subGroups[subGroupKey];
        contentDisplay.innerHTML = `<button class="back-btn" data-type="back-to-category" data-category="${categoryKey}">← Voltar para ${bjjData[categoryKey].title}</button><h2 class="content-title" style="margin-top: 20px;">${bjjData[categoryKey].title} > ${subGroup.title}</h2><div class="item-grid">${Object.keys(subGroup.techniques).map(techKey => `<button class="grid-btn" data-type="technique" data-category="${categoryKey}" data-subgroup="${subGroupKey}" data-technique="${techKey}">${subGroup.techniques[techKey].title}</button>`).join('')}</div>`;
    }
    function renderTechnique(categoryKey, subGroupKey, techniqueKey) {
        const technique = subGroupKey ? bjjData[categoryKey].subGroups[subGroupKey].techniques[techniqueKey] : bjjData[categoryKey].techniques[techniqueKey];
        
        const attackVideosHtml = (technique.attack.videoUrls || []).map(url => generateEmbedHtml(url)).join('') || generateEmbedHtml(null);
        const defenseVideosHtml = (technique.defense.videoUrls || []).map(url => generateEmbedHtml(url)).join('') || generateEmbedHtml(null);

        const backBtnHtml = subGroupKey ? `<button class="back-btn" data-type="back-to-subgroup" data-category="${categoryKey}" data-subgroup="${subGroupKey}">← Voltar para ${bjjData[categoryKey].subGroups[subGroupKey].title}</button>` : `<button class="back-btn" data-type="back-to-category" data-category="${categoryKey}">← Voltar para ${bjjData[categoryKey].title}</button>`;
        const defenseSectionVisible = technique.defense.description || (technique.defense.videoUrls && technique.defense.videoUrls.length > 0);

        contentDisplay.innerHTML = `<div class="technique-content">${backBtnHtml}<h2 style="margin-top: 20px;">${technique.title}</h2><div class="technique-section"><h3>🥋 Ataque</h3><p>${technique.attack.description || ''}</p>${attackVideosHtml}</div>${defenseSectionVisible ? `<div class="technique-section"><h3>🛡️ Defesa / Saída</h3><p>${technique.defense.description || ''}</p>${defenseVideosHtml}</div>` : ''}</div>`;
    }
    function renderConfigPanel() {
        const catSelects = ['#subgroup-category-select', '#technique-category-select'];
        catSelects.forEach(selector => { const selectElement = document.querySelector(selector); if (selectElement) { selectElement.innerHTML = `<option value="">1º Selecione a Categoria Principal</option>`; Object.keys(bjjData).forEach(catKey => { selectElement.innerHTML += `<option value="${catKey}">${bjjData[catKey].title}</option>`; }); } });
        const managementList = document.getElementById('management-list');
        if (managementList) {
            managementList.innerHTML = '<ul>';
            Object.keys(bjjData).forEach(catKey => {
                managementList.innerHTML += `<li class="category-manage-item"><span>${bjjData[catKey].title}</span><button class="delete-btn" data-delete="category" data-key="${catKey}">Apagar</button></li>`;
                Object.keys(bjjData[catKey].subGroups || {}).forEach(subKey => { managementList.innerHTML += `<li class="subgroup-manage-item"><span>${bjjData[catKey].subGroups[subKey].title}</span><button class="delete-btn" data-delete="subgroup" data-key="${catKey},${subKey}">Apagar</button></li>`; Object.keys(bjjData[catKey].subGroups[subKey].techniques || {}).forEach(techKey => { managementList.innerHTML += `<li class="technique-manage-item"><span>${bjjData[catKey].subGroups[subKey].techniques[techKey].title}</span><button class="delete-btn" data-delete="technique" data-key="${catKey},${subKey},${techKey}">Apagar</button></li>`; }); });
                Object.keys(bjjData[catKey].techniques || {}).forEach(techKey => { managementList.innerHTML += `<li class="technique-manage-item" style="padding-left: 20px; font-style: italic;"><span>${bjjData[catKey].techniques[techKey].title}</span><button class="delete-btn" data-delete="technique" data-key="${catKey},,${techKey}">Apagar</button></li>`; });
            });
            managementList.innerHTML += '</ul>';
        }
        document.getElementById('attack-videos-container').innerHTML = '';
        document.getElementById('defense-videos-container').innerHTML = '';
    }
    
    mainNav.addEventListener('click', (e) => { if (e.target.classList.contains('nav-tab')) { document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active')); e.target.classList.add('active'); updateContent(renderCategoryContent, e.target.dataset.category); } });
    contentDisplay.addEventListener('click', (e) => { const target = e.target.closest('button'); if (!target) return; const { type, category, subgroup, technique } = target.dataset; if (type === 'subgroup') updateContent(renderSubGroupContent, category, subgroup); else if (type === 'technique') updateContent(renderTechnique, category, subgroup, technique); else if (type === 'back-to-category') updateContent(renderCategoryContent, category); else if (type === 'back-to-subgroup') updateContent(renderSubGroupContent, category, subgroup); });
    document.getElementById('add-category-form').addEventListener('submit', (e) => { e.preventDefault(); const input = document.getElementById('new-category-name'); const newKey = input.value.trim().toLowerCase().replace(/\s+/g, '-'); if (input.value && !bjjData[newKey]) { bjjData[newKey] = { title: input.value.trim(), subGroups: {}, techniques: {} }; saveData(); renderAll(); input.value = ''; } else alert('Nome inválido ou já existente.'); });
    document.getElementById('add-subgroup-form').addEventListener('submit', (e) => {
        e.preventDefault(); const catKey = document.getElementById('subgroup-category-select').value; const input = document.getElementById('new-subgroup-name');
        if (!catKey || !input.value.trim()) { alert('Por favor, selecione uma categoria e digite um nome para o grupo.'); return; }
        const newKey = input.value.trim().toLowerCase().replace(/\s+/g, '-');
        if (!bjjData[catKey].subGroups) { bjjData[catKey].subGroups = {}; }
        if (bjjData[catKey].subGroups[newKey]) { alert('Este nome de grupo já existe nesta categoria.'); } 
        else { bjjData[catKey].subGroups[newKey] = { title: input.value.trim(), techniques: {} }; saveData(); renderConfigPanel(); e.target.reset(); }
    });
    document.getElementById('add-technique-form').addEventListener('submit', (e) => {
        e.preventDefault(); const catKey = document.getElementById('technique-category-select').value; const subKey = document.getElementById('technique-subgroup-select').value; const title = document.getElementById('new-technique-title').value.trim(); const techKey = title.toLowerCase().replace(/\s+/g, '-');
        if (!catKey || !title) { alert('Categoria e Título são obrigatórios.'); return; }
        
        const attackUrls = Array.from(document.querySelectorAll('#attack-videos-container input')).map(input => input.value.trim()).filter(url => url);
        const defenseUrls = Array.from(document.querySelectorAll('#defense-videos-container input')).map(input => input.value.trim()).filter(url => url);

        const newTechnique = { title: title, attack: { description: document.getElementById('attack-desc').value, videoUrls: attackUrls }, defense: { description: document.getElementById('defense-desc').value, videoUrls: defenseUrls } };
        
        if (subKey) { if (!bjjData[catKey].subGroups[subKey].techniques) bjjData[catKey].subGroups[subKey].techniques = {}; bjjData[catKey].subGroups[subKey].techniques[techKey] = newTechnique; } 
        else { if (!bjjData[catKey].techniques) bjjData[catKey].techniques = {}; bjjData[catKey].techniques[techKey] = newTechnique; }
        saveData(); renderAll(); e.target.reset(); 
        document.getElementById('technique-subgroup-select').innerHTML = '<option value="">(Opcional) 2º Selecione o Grupo</option>';
        document.getElementById('attack-videos-container').innerHTML = '';
        document.getElementById('defense-videos-container').innerHTML = '';
    });
    document.getElementById('technique-category-select').addEventListener('change', (e) => { const catKey = e.target.value; const subGroupSelect = document.getElementById('technique-subgroup-select'); subGroupSelect.innerHTML = '<option value="">(Opcional) 2º Selecione o Grupo</option>'; if (catKey && bjjData[catKey].subGroups) { Object.keys(bjjData[catKey].subGroups).forEach(subKey => { subGroupSelect.innerHTML += `<option value="${subKey}">${bjjData[catKey].subGroups[subKey].title}</option>`; }); } });
    document.getElementById('management-list').addEventListener('click', (e) => { const target = e.target.closest('.delete-btn'); if (!target) return; if (confirm('Tem certeza que quer apagar este item e todo o seu conteúdo?')) { const { delete: deleteType, key } = target.dataset; const keys = key.split(','); const [catKey, subKey, techKey] = keys; if (deleteType === 'category') delete bjjData[catKey]; else if (deleteType === 'subgroup') delete bjjData[catKey].subGroups[subKey]; else if (deleteType === 'technique') { if (subKey) delete bjjData[catKey].subGroups[subKey].techniques[techKey]; else delete bjjData[catKey].techniques[techKey]; } saveData(); renderAll(); } });
    
    modal.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-video-btn')) {
            const containerId = e.target.dataset.target;
            const container = document.getElementById(containerId);
            const newInputGroup = document.createElement('div');
            newInputGroup.className = 'video-input-group';
            newInputGroup.innerHTML = `
                <input type="url" placeholder="Link do vídeo (YouTube/Instagram)">
                <button type="button" class="remove-video-btn">×</button>
            `;
            container.appendChild(newInputGroup);
        }
        if (e.target.classList.contains('remove-video-btn')) {
            e.target.closest('.video-input-group').remove();
        }
    });

    function generateEmbedHtml(url) { if(!url||typeof url!=="string")return'<div class="no-video">Nenhum vídeo fornecido.</div>';try{const a=new URL(url),b=a.hostname,c=a.pathname;if(b.includes("youtube.com")||b.includes("youtu.be")){let d=null;b.includes("youtu.be")?d=c.slice(1):c.startsWith("/shorts/")?d=c.split("/shorts/")[1]:d=a.searchParams.get("v");if(d){const e=`https://www.youtube.com/embed/${d}`;return`\n<div class="video-container"><iframe src="${e}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`}}if(b.includes("instagram.com"))if(c.startsWith("/p/")||c.startsWith("/reel/")){const d=`https://www.instagram.com${c}embed/`;return`\n<div class="video-container instagram-container"><iframe src="${d}" title="Instagram post" frameborder="0" scrolling="no" allowtransparency="true" loading="lazy"></iframe></div>`}}catch(a){console.error("URL inválida:",url,a)}return`<div class="no-video">Link inválido ou não suportado.</div>` }
    function renderAll() {
        renderNavTabs();
        contentDisplay.innerHTML = `<div class="welcome-message"><h2>Bem-vindo ao seu Guia de Jiu-Jitsu.</h2><p>Selecione uma categoria acima para começar.</p></div>`;
        document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
        renderConfigPanel();
    }
    function renderNavTabs() { 
        mainNav.innerHTML = '';
        Object.keys(bjjData).forEach(categoryKey => {
            const category = bjjData[categoryKey], tab = document.createElement('button');
            tab.className = 'nav-tab';
            tab.textContent = category.title;
            tab.dataset.category = categoryKey;
            mainNav.appendChild(tab);
        });
    }
    function updateContent(renderFunction, ...args) { contentDisplay.classList.add('fade-out'); setTimeout(() => { renderFunction(...args); contentDisplay.classList.remove('fade-out'); }, 300); }
    document.getElementById('config-btn').addEventListener('click', () => { renderConfigPanel(); modal.style.display = 'flex'; });
    document.getElementById('close-modal-btn').addEventListener('click', () => { modal.style.display = 'none'; });
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
    document.getElementById('reset-data-btn').addEventListener('click', () => {
        if (confirm('ATENÇÃO!\nIsso apagará TODAS as suas customizações e restaurará os dados padrão. Deseja continuar?')) {
            localStorage.removeItem(BJJ_DATA_KEY);
            loadData();
            renderAll();
            alert('Dados resetados com sucesso!');
        }
    });

    homeLogo.addEventListener('click', () => {
        updateContent(renderAll);
    });

    // A seção "Puxar para Atualizar" foi removida daqui.

    loadData();
    renderAll();
});