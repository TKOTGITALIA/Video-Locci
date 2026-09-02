let isFabioUnlocked = false;
let passwordFabio = "";

let isDroneUnlocked = false;
let passwordDrone = "";

function decrittografaLinkFabio(link) {
    if (!link || !link.startsWith("U2FsdGVkX1")) return link;
    try {
        const bytes = CryptoJS.AES.decrypt(link, passwordFabio);
        return bytes.toString(CryptoJS.enc.Utf8) || link;
    } catch (e) {
        return link;
    }
}

function decrittografaLinkDrone(link) {
    if (!link || !link.startsWith("U2FsdGVkX1")) return link;
    try {
        const bytes = CryptoJS.AES.decrypt(link, passwordDrone);
        return bytes.toString(CryptoJS.enc.Utf8) || link;
    } catch (e) {
        return link;
    }
}

function ottieniPasswordFabio() {
    if (isFabioUnlocked) return true;
    const input = prompt("Inserisci la password per accedere ai Video Fabio:");
    if (!input) return false;

    const sample = allVideos.find(v => v.Album === "Video Fabio" && v.Link && v.Link.startsWith("U2FsdGVkX1"));
    if (sample) {
        try {
            const bytes = CryptoJS.AES.decrypt(sample.Link, input);
            const dec = bytes.toString(CryptoJS.enc.Utf8);
            if (dec && !dec.startsWith("U2FsdGVkX1") && dec.length > 0) {
                passwordFabio = input;
                isFabioUnlocked = true;
                return true;
            }
        } catch (e) {}
        alert("Password errata per i Video Fabio!");
        return false;
    }

    passwordFabio = input;
    isFabioUnlocked = true;
    return true;
}

async function ottieniPasswordDrone() {
    if (isDroneUnlocked) return true;

    if (!window.droneData || window.droneData.length === 0) {
        try {
            const res = await fetch('data3.json?v=' + Date.now());
            window.droneData = await res.json();
        } catch (e) {
            console.error("Errore nel caricamento di data3.json", e);
        }
    }

    const input = prompt("Inserisci la password per la sezione Drone:");
    if (!input) return false;

    const sample = (window.droneData || []).find(v => v.Link && v.Link.startsWith("U2FsdGVkX1"));
    if (sample) {
        try {
            const bytes = CryptoJS.AES.decrypt(sample.Link, input);
            const dec = bytes.toString(CryptoJS.enc.Utf8);
            if (dec && !dec.startsWith("U2FsdGVkX1") && dec.length > 0) {
                passwordDrone = input;
                isDroneUnlocked = true;
                return true;
            }
        } catch (e) {}
        alert("Password errata per la sezione Drone!");
        return false;
    }

    passwordDrone = input;
    isDroneUnlocked = true;
    return true;
}

function decrittografaLinkFabio(link) {
    if (!link || !link.startsWith("U2FsdGVkX1")) return link;
    try {
        const bytes = CryptoJS.AES.decrypt(link, passwordFabio);
        return bytes.toString(CryptoJS.enc.Utf8) || link;
    } catch (e) {
        return link;
    }
}

function decrittografaLinkDrone(link) {
    if (!link || !link.startsWith("U2FsdGVkX1")) return link;
    try {
        const bytes = CryptoJS.AES.decrypt(link, passwordDrone);
        return bytes.toString(CryptoJS.enc.Utf8) || link;
    } catch (e) {
        return link;
    }
}

let allVideos = [];

const monthNames = {
    "01": "Gennaio", "02": "Febbraio", "03": "Marzo", "04": "Aprile",
    "05": "Maggio", "06": "Giugno", "07": "Luglio", "08": "Agosto",
    "09": "Settembre", "10": "Ottobre", "11": "Novembre", "12": "Dicembre"
};

function fixDropboxUrl(url) {
    if (!url || typeof url !== 'string') return '';
    if (url.includes('dropbox.com')) {
        let directUrl = url.replace(/https?:\/\/(www\.)?dropbox\.com/, 'https://dl.dropboxusercontent.com');
        if (directUrl.includes('?dl=0')) {
            directUrl = directUrl.replace('?dl=0', '?raw=1');
        } else if (!directUrl.includes('?raw=1') && !directUrl.includes('?dl=1')) {
            directUrl += (directUrl.includes('?') ? '&raw=1' : '?raw=1');
        }
        return directUrl;
    }
    return url;
}

async function loadGallery() {
    try {
        const response = await fetch('data.json?v=1.13');
        allVideos = await response.json();
        allVideos.reverse();

        const goproVideos = allVideos.filter(v => v.Album !== "Video Fabio");

        renderPeople(goproVideos);
        renderMonthsAndYears(goproVideos);
        renderAlbums(allVideos);
        renderVisuals(goproVideos);
        renderVideos(goproVideos);
    } catch (error) {
        console.error("Errore nel caricamento dati:", error);
    }
}

function renderPeople(videos) {
    const container = document.getElementById('people-albums');
    const hiddenPeople = ["Fava", "Itallo", "Gio", "Minetto"];
    let counts = {};
    let otherCounts = {};

    videos.forEach(v => {
        if (!v.Persone || v.Persone === "/") return;
        
        const personeNelVideo = Array.isArray(v.Persone) ? v.Persone : [v.Persone];
        personeNelVideo.forEach(p => {
            const personaPulita = String(p).trim();
            
            if (personaPulita && personaPulita !== "/" && personaPulita.toLowerCase() !== "fabio") {
                if (hiddenPeople.includes(personaPulita)) {
                    otherCounts[personaPulita] = (otherCounts[personaPulita] || 0) + 1;
                } else {
                    counts[personaPulita] = (counts[personaPulita] || 0) + 1;
                }
            }
        });
    });

    const peopleSorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

    let html = '<div style="margin-bottom: 6px; display: flex; align-items: center; gap: 10px;"><strong>Persone:</strong>' +
        `<button class="album-btn" onclick="resetFilters()"><strong>Tutti i video</strong> (${allVideos.length})</button></div>` +
        '<div class="filter-row">' +
        peopleSorted.map(p => 
            `<button class="album-btn" onclick="filterByPerson('${p}')">${p} (${counts[p]})</button>`
        ).join('') +
        '</div>';

    const availableHiddenPeople = hiddenPeople.filter(p => otherCounts[p] > 0);

    if (availableHiddenPeople.length > 0) {
        html += '<div class="filter-row" style="margin-top: 8px;">' +
            `<button class="album-btn" onclick="toggleOtherPeople()"><strong>Altro ▾</strong></button>` +
            `<span id="other-people-container" style="display: none; margin-left: 4px;">` +
            availableHiddenPeople.map(p => 
                `<button class="album-btn" onclick="filterByPerson('${p}')">${p} (${otherCounts[p]})</button>`
            ).join('') +
            `</span></div>`;
    }

    container.innerHTML = html;
}

window.toggleOtherPeople = () => {
    const container = document.getElementById('other-people-container');
    if (container) {
        const isHidden = container.style.display === 'none';
        container.style.display = isHidden ? 'inline' : 'none';
    }
};

function renderMonthsAndYears(videos) {
    const dateContainer = document.getElementById('date-albums');
    let activePeriods = [];

    videos.forEach(v => {
        if (!v.Data || typeof v.Data !== 'string') return; //
        const [_, month, year] = v.Data.split('/');
        if (year !== "2020") {
            const periodKey = `${month}/${year}`;
            if (!activePeriods.includes(periodKey)) {
                activePeriods.push(periodKey);
            }
        }
    });

    activePeriods.sort((a, b) => {
        const [monthA, yearA] = a.split('/');
        const [monthB, yearB] = b.split('/');
        if (yearB !== yearA) return yearB - yearA;
        return monthB - monthA;
    });

    dateContainer.innerHTML = '<div style="margin-bottom: 6px; display: flex; align-items: center; gap: 10px;"><strong>Periodi:</strong>' + 
        `<button class="album-btn" onclick="resetFilters()"><strong>Tutti i video</strong> (${allVideos.length})</button></div>` + 
        '<div class="filter-row">' +
        activePeriods.map(p => {
            const [m, y] = p.split('/');
            const label = `${monthNames[m]} ${y}`;
            return `<button class="album-btn" onclick="filterByMonthYear('${m}', '${y}')">${label}</button>`;
        }).join('') +
        '</div>' +
        '<div id="days-container" class="filter-row" style="margin-top: 8px; display: none;"></div>';
}

function renderAlbums(videos) {
    const container = document.getElementById('collection-albums');
    let counts = {};
    
    videos.filter(v => v.Album !== "Video Fabio").forEach(v => {
        if (!v.Album) return;
        counts[v.Album] = (counts[v.Album] || 0) + 1;
    });

    let albumsSorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    
    const specialKeys = ["Timelapse", "Carnevale di Ivrea", "Altro"];
    let mainAlbums = albumsSorted.filter(a => !specialKeys.includes(a));
    let specialAlbums = specialKeys.filter(a => counts[a]);

    let html = '<div style="margin-bottom: 6px; display: flex; align-items: center; gap: 10px;"><strong>Album:</strong>' + 
        `<button class="album-btn" onclick="resetFilters()"><strong>Tutti i video</strong> (${allVideos.filter(v => v.Album !== "Video Fabio").length})</button></div>` + 
        '<div class="filter-row">' +
        mainAlbums.map(a => 
            `<button class="album-btn" onclick="filterByAlbum('${a}')">${a} (${counts[a]})</button>`
        ).join('') +
        '</div>';

    if (specialAlbums.length > 0) {
        html += '<div class="filter-row" style="margin-top: 8px;">' +
            specialAlbums.map(a => 
                `<button class="album-btn" onclick="filterByAlbum('${a}')">${a} (${counts[a]})</button>`
            ).join('') +
            '</div>';
    }

    container.innerHTML = html;
}

function renderVisuals(videos) {
    const container = document.getElementById('visual-albums');
    if (!container) return;

    let counts = {};

    videos.forEach(v => {
        if (!v.Visuale || v.Visuale === "/") return;
        
        const visualePulita = String(v.Visuale).trim();
        
        if (visualePulita && visualePulita !== "/" && visualePulita.toLowerCase() !== "fabio") {
            counts[visualePulita] = (counts[visualePulita] || 0) + 1;
        }
    });

    let visualsSorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

    let html = '<div style="margin-bottom: 6px; display: flex; align-items: center; gap: 10px;"><strong>Visuale:</strong>' +
        `<button class="album-btn" onclick="resetFilters()"><strong>Tutti i video</strong> (${allVideos.length})</button></div>` +
        '<div class="filter-row">' +
        visualsSorted.map(v => 
            `<button class="album-btn" onclick="filterByVisual('${v}')">${v} (${counts[v]})</button>`
        ).join('') +
        '</div>';

    container.innerHTML = html;
}

window.filterByPerson = (personName) => {
    const filtered = allVideos.filter(v => {
        if (!v.Persone) return false;
        if (Array.isArray(v.Persone)) {
            return v.Persone.includes(personName);
        }
        return v.Persone === personName;
    });
    renderVideos(filtered, personName !== "Fabio");
};

window.filterByMonthYear = (monthCode, year) => {
    const filtered = allVideos.filter(v => {
        const [_, m, y] = v.Data.split('/');
        return y === year && m === monthCode;
    });

    filtered.sort((a, b) => {
        const dayA = parseInt(a.Data.split('/')[0], 10);
        const dayB = parseInt(b.Data.split('/')[0], 10);
        return dayB - dayA;
    });

    renderVideos(filtered, true);

    const daysContainer = document.getElementById('days-container');
    if (daysContainer) {
        let dayCounts = {};

        filtered.forEach(v => {
            dayCounts[v.Data] = true;
        });

        const sortedDates = Object.keys(dayCounts).sort((a, b) => {
            return parseInt(b.split('/')[0], 10) - parseInt(a.split('/')[0], 10);
        });

        daysContainer.innerHTML = sortedDates.map(fullDate => {
            const [day, month] = fullDate.split('/');
            const label = `${day}/${month}`;
            return `<button class="album-btn" onclick="filterByExactDate('${fullDate}')">${label}</button>`;
        }).join('');

        daysContainer.style.display = 'flex';
    }
};

window.filterByExactDate = (fullDate) => {
    const filtered = allVideos.filter(v => v.Data === fullDate);
    currentVideosList = filtered;
    const container = document.getElementById('video-container');

    const [dayStr, monthCode, year] = fullDate.split('/');
    const day = parseInt(dayStr, 10); 
    const label = `${day} ${monthNames[monthCode]} ${year}`;

    const cardsHtml = filtered.map((v, index) => createVideoCardHtml(v, index)).join('');

    container.innerHTML = `
        <div class="month-section" style="grid-column: 1 / -1; width: 100%; margin-bottom: 25px;">
            <h2 class="month-title" style="font-size: 1.3rem; margin: 15px 0; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 6px;">${label}</h2>
            <div class="video-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
                ${cardsHtml}
            </div>
        </div>
    `;
};

window.filterByAlbum = (albumName) => {
    if (albumName === "Video Fabio" && !ottieniPasswordFabio()) {
        return;
    }
    const filtered = allVideos.filter(v => v.Album === albumName);
    renderVideos(filtered, albumName !== "Video Fabio");
};

window.filterByVisual = (visualName) => {
    const filtered = allVideos.filter(v => v.Visuale === visualName);
    renderVideos(filtered, visualName !== "Fabio");
};

window.resetFilters = () => {
    const goproVideos = allVideos.filter(v => v.Album !== "Video Fabio");
    renderVideos(goproVideos);
    const daysContainer = document.getElementById('days-container');
    if (daysContainer) {
        daysContainer.style.display = 'none';
        daysContainer.innerHTML = '';
    }
};

function getYoutubeId(url) {
    try {
        if (!url || !url.includes('http')) return null; 
        if (url.includes('youtu.be/')) return url.split('youtu.be/')[1].split('?')[0];
        if (url.includes('youtube.com/shorts/')) return url.split('youtube.com/shorts/')[1].split('?')[0];
        if (url.includes('youtube.com/embed/')) return url.split('youtube.com/embed/')[1].split('?')[0];
        return new URLSearchParams(new URL(url).search).get('v');
    } catch (e) {
        return null;
    }
}

let currentVideosList = [];

function renderVideos(videoList, groupByMonth = true) {
    const periodiContainer = document.getElementById('periodi-container');
    if (periodiContainer) periodiContainer.style.display = 'none';

    currentVideosList = videoList;
    const container = document.getElementById('video-container');

    if (!groupByMonth) {
        container.innerHTML = videoList.map((v, index) => createVideoCardHtml(v, index)).join('');
        return;
    }

    let groups = {};
    let groupKeys = [];

    videoList.forEach((v, index) => {
        if (!v.Data || typeof v.Data !== 'string') return;
        const parts = v.Data.split('/');
        if (parts.length < 3) return;
        const [day, month, year] = parts;

        let key;
        if (year === "2020" || v.Album === "Video Fabio") {
            key = "Video Fabio";
        } else {
            key = `${month}/${year}`;
        }

        if (!groups[key]) {
            groups[key] = [];
            groupKeys.push(key);
        }
        groups[key].push({ video: v, originalIndex: index });
    });

    groupKeys.sort((a, b) => {
        if (a === "Video Fabio") return 1;
        if (b === "Video Fabio") return -1;

        const [mA, yA] = a.split('/');
        const [mB, yB] = b.split('/');
        if (yB !== yA) return parseInt(yB, 10) - parseInt(yA, 10);
        return parseInt(mB, 10) - parseInt(mA, 10);
    });

    container.innerHTML = groupKeys.map(key => {
        let label;
        if (key === "Video Fabio") {
            label = "Video Fabio";
        } else {
            const [m, y] = key.split('/');
            label = `${monthNames[m]} ${y}`;
        }

        const cardsHtml = groups[key].map(item => createVideoCardHtml(item.video, item.originalIndex)).join('');

        return `
            <div class="month-section" style="grid-column: 1 / -1; width: 100%; margin-bottom: 25px;">
                <h2 class="month-title" style="font-size: 1.3rem; margin: 15px 0; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 6px;">${label}</h2>
                <div class="video-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
                    ${cardsHtml}
                </div>
            </div>
        `;
    }).join('');
}

function createVideoCardHtml(v, index) {
    let thumbnailUrl = '';

    const realLink = decrittografaLinkFabio(v.Link) || v.Link;

    if (v.Album === "Video Fabio" && !passwordFabio) {
        thumbnailUrl = "https://img.youtube.com/vi/00000000000/hqdefault.jpg";
    } else {
        const isFoto = /\.(jpg|jpeg|png|webp|gif)($|\?)/i.test(realLink || '');
        const isDropbox = (realLink && realLink.includes('dropbox')) || 
                          (v["Nome file"] && v["Nome file"].toLowerCase().endsWith('.mp4'));

        if (isFoto) {
            thumbnailUrl = realLink;
        } else if (isDropbox) {
            thumbnailUrl = v.Miniatura || v.Thumbnail || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='480' height='360' viewBox='0 0 480 360' fill='%23222'><rect width='480' height='360'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23aaa' font-family='sans-serif' font-size='22'>Video Dropbox</text></svg>";
        } else {
            const videoId = getYoutubeId(realLink);
            thumbnailUrl = videoId 
                ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
                : "https://img.youtube.com/vi/00000000000/hqdefault.jpg";
        }
    }

    const durataBadge = (v.Durata && v.Durata !== "/") 
        ? `<span class="duration-badge" style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.8); color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">${v.Durata}</span>` 
        : '';

    return `
    <div class="video-card" onclick="openModal(${index})" style="cursor: pointer;">
        <div class="thumbnail-container" style="position: relative;">
            <img src="${thumbnailUrl}" alt="Miniatura ${v.Nome}" class="video-thumbnail" referrerpolicy="no-referrer">
            ${durataBadge}
        </div>
        <div class="video-title-main">${v.Nome}</div>
    </div>
    `;
}

function apriModalDropbox(v, modal, modalBody) {
    const directUrl = fixDropboxUrl(v.Link);

    const pulisciTesto = (val) => {
        if (!val) return '';
        if (Array.isArray(val)) return val.map(x => String(x).trim()).join(', ');
        return String(val).trim();
    };

    const personeTesto = pulisciTesto(v.Persone);
    const visualeTesto = pulisciTesto(v.Visuale);

    const isPersoneFabio = personeTesto.toLowerCase() === 'fabio';
    const isVisualeFabio = visualeTesto.toLowerCase() === 'fabio';
    const nascondiFabio = isPersoneFabio && isVisualeFabio;

    const personeHtml = nascondiFabio ? '' : `<p><strong>Persone:</strong> ${personeTesto || '/'}</p>`;
    const visualeHtml = nascondiFabio ? '' : `<p><strong>Visuale:</strong> ${visualeTesto || '/'}</p>`;

    const risoluzioneVideo = v.Risoluzione || '1080p (Full HD)';
    const fotogrammiVideo = v.Fotogrammi || v.fotogrammiVideo || '60 FPS';
    const durataVideo = v.Durata || '/';

    const isImage = v["Nome file"] && v["Nome file"].match(/\.(jpg|jpeg|png|webp|gif)$/i);

    const fallbackSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='480' height='360' viewBox='0 0 480 360' fill='%23222'><rect width='480' height='360'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23aaa' font-family='sans-serif' font-size='22'>File Dropbox</text></svg>";
    
    const imageUrl = isImage ? directUrl : (v.Miniatura || v.Thumbnail || fallbackSvg);

    const watchDropboxBtnHtml = (v.Link && v.Link !== "/")
        ? `<a href="${directUrl}" target="_blank" class="share-btn">Clicca qui per guardare direttamente su Dropbox</a>`
        : '';

    const shareBtnHtml = (v.Link && v.Link !== "/")
        ? `<button class="share-btn" onclick="copiaLink('${v.Link}', this)">Clicca qui per ottenere il link per condividere il video</button>`
        : '';

    modalBody.innerHTML = `
        <div class="iframe-container" style="margin-bottom: 15px;">
            <img src="${imageUrl}" alt="${v.Nome || v["Nome file"]}" class="modal-video-frame" style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;">
        </div>

        ${watchDropboxBtnHtml}
        ${shareBtnHtml}
        
        <div class="info-section">
            <h4>Informazioni generali</h4>
            <p><strong>Nome:</strong> ${v.Nome || v["Nome file"]}</p>
            <p><strong>Data:</strong> ${v.Data || '/'}</p>
            ${personeHtml}
            ${visualeHtml}
            <p><strong>Album:</strong> ${v.Album || '/'}</p>
        </div>
        <hr>
        <div class="info-section">
            <h4>Altre informazioni</h4>
            <p><strong>Durata:</strong> ${durataVideo}</p>
            <p><strong>Risoluzione:</strong> ${risoluzioneVideo}</p>
            <p><strong>Fotogrammi:</strong> ${fotogrammiVideo}</p>
            <p><strong>Data di caricamento:</strong> ${v["Data di caricamento"] || '/'}</p>
            <p><strong>Caricato su:</strong> ${v["Caricato su"] || 'Dropbox'}</p>
            <p><strong>Nome del file:</strong> ${v["Nome file"] || v["Nome originale video"] || '/'}</p>
        </div>
    `;
    modal.style.display = "block";
    document.body.classList.add('modal-open');
}

window.openModal = (index) => {
    const v = currentVideosList[index];
    if (!v) return;

    if (v.Album === "Video Fabio" && !ottieniPasswordFabio()) {
        return;
    }

    const realLink = decrittografaLinkFabio(v.Link);

    if (!realLink) {
        alert("Password errata o impossibile decrittografare il link!");
        passwordFabio = "";
        isFabioUnlocked = false;
        return;
    }

    const modal = document.getElementById('video-modal');
    const modalBody = document.getElementById('modal-body');

    const videoId = getYoutubeId(realLink);
    const fallbackUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    const pulisciTesto = (val) => {
        if (!val) return '';
        if (Array.isArray(val)) return val.map(x => String(x).trim()).join(', ');
        return String(val).trim();
    };

    const personeTesto = pulisciTesto(v.Persone);
    const visualeTesto = pulisciTesto(v.Visuale);
    const isPersoneFabio = personeTesto.toLowerCase() === 'fabio';
    const isVisualeFabio = visualeTesto.toLowerCase() === 'fabio';
    const nascondiFabio = isPersoneFabio && isVisualeFabio;

    const personeHtml = nascondiFabio ? '' : `<p><strong>Persone:</strong> ${personeTesto || '/'}</p>`;
    const visualeHtml = nascondiFabio ? '' : `<p><strong>Visuale:</strong> ${visualeTesto || '/'}</p>`;

    const fotocameraVideo = v.Fotocamera || 'GoPro Hero 3+';
    const risoluzioneVideo = v.Risoluzione || '1080p (Full HD)';
    const fotogrammiVideo = v.Fotogrammi || v.fotogrammiVideo || '60 FPS';
    const fovVideo = (v.FOV !== undefined && v.FOV !== '') ? v.FOV : 'Wide';
    const durataVideo = v.Durata || '/';
    const caricatoSu = v["Caricato su"] || 'Youtube';

    const watchYoutubeBtnHtml = (realLink && realLink !== "/")
        ? `<a href="${realLink}" target="_blank" class="watch-link" style="margin-bottom: 12px;">Guarda Video</a>`
        : '';

    const shareBtnHtml = (realLink && realLink !== "/" && v.Album !== "Video Fabio")
        ? `<button class="share-btn" onclick="copiaLink('${realLink}', this)">Clicca qui per ottenere il link per condividere il video</button>`
        : '';

    let previewContent = '';
    if (videoId) {
        previewContent = `
            <iframe src="https://www.youtube.com/embed/${videoId}" 
                title="${v.Nome}" 
                frameborder="0" 
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        `;
    } else if (caricatoSu.toLowerCase() === 'catbox') {
        previewContent = `
            <video controls style="width: 100%; max-height: 400px; border-radius: 8px;">
                <source src="${realLink}" type="video/mp4">
                Il tuo browser non supporta la riproduzione video.
            </video>
        `;
    } else {
        previewContent = `
            <img src="${realLink || fallbackUrl}" 
                 onerror="this.onerror=null; this.src='${fallbackUrl}';" 
                 class="modal-thumbnail-large" 
                 alt="${v.Nome}">
        `;
    }

    modalBody.innerHTML = `
        <div class="modal-video-wrapper">
            ${previewContent}
        </div>

        ${watchYoutubeBtnHtml}
        ${shareBtnHtml}

        <div class="info-section">
            <h4>Informazioni generali</h4>
            <p><strong>Nome:</strong> ${v.Nome}</p>
            <p><strong>Data:</strong> ${v.Data}</p>
            ${personeHtml}
            ${visualeHtml}
            <p><strong>Album:</strong> ${v.Album}</p>
        </div>

        <hr>

        <div class="info-section">
            <h4>Altre informazioni</h4>
            <p><strong>Durata:</strong> ${durataVideo}</p>
            <p><strong>Data caricamento:</strong> ${v["Data di caricamento"] || '/'}</p>
            <p><strong>Caricato su:</strong> ${caricatoSu}</p>
            <p><strong>Nome originale video:</strong> ${v["Nome originale video"] || '/'}</p>
        </div>

        <hr>

        <div class="info-section">
            <h4>Informazioni Fotocamera</h4>
            <p><strong>Fotocamera:</strong> ${fotocameraVideo}</p>
            <p><strong>Risoluzione:</strong> ${risoluzioneVideo}</p>
            <p><strong>Fotogrammi:</strong> ${fotogrammiVideo}</p>
            <p><strong>FOV:</strong> ${fovVideo}</p>
        </div>
    `;

    modal.style.display = "block";
    document.body.classList.add('modal-open');
};

window.closeModal = () => {
    const modal = document.getElementById('video-modal');
    const modalBody = document.getElementById('modal-body');
    modal.style.display = "none";
    document.body.style.overflow = "auto";
    document.body.classList.remove('modal-open');
    modalBody.innerHTML = "";
};

window.copiaLink = (link, element) => {
    navigator.clipboard.writeText(link).then(() => {
        const testoOriginale = element.innerText;
        element.innerText = "Link copiato!";
        element.style.backgroundColor = "#28a745"; 
        element.style.borderColor = "#28a745";

        setTimeout(() => {
            element.innerText = testoOriginale;
            element.style.backgroundColor = "";
            element.style.borderColor = "";
        }, 2000);
    });
};

async function mostraLeakGTA() {
    const container = document.getElementById('video-container');
    container.innerHTML = '<p style="text-align:center; width:100%;">Caricamento leak in corso...</p>';

    try {
    const response = await fetch('data2.json?v=' + Date.now());
    const leaks = await response.json();
    
    allLeaksList = leaks;
    generaDivisorePeriodi(allLeaksList);
    generaDivisoreFile(allLeaksList);
    renderizzaLeakGTA(allLeaksList);
    } catch (error) {
    console.error("Errore nel caricamento di data2.json:", error);
    container.innerHTML = '<p style="text-align:center; width:100%;">Errore nel caricamento dei leak.</p>';
}
}

let currentLeaksList = [];

function convertiUrlDropbox(url) {
    if (!url) return '';
    if (url.includes('dropbox.com')) {
        let directUrl = url.replace('www.dropbox.com', 'dl.dropboxusercontent.com')
                           .replace('dropbox.com', 'dl.dropboxusercontent.com');
        if (directUrl.includes('?dl=0')) {
            directUrl = directUrl.replace('?dl=0', '?raw=1');
        } else if (!directUrl.includes('?raw=1') && !directUrl.includes('?dl=1')) {
            directUrl += (directUrl.includes('?') ? '&raw=1' : '?raw=1');
        }
        return directUrl;
    }
    return url;
}

function formattaDataEstesa(giornoMese, anno) {
    const [giorno, mese] = giornoMese.split('/');
    const g = parseInt(giorno, 10);
    const m = mese.padStart(2, '0');
    return `${g} ${monthNames[m] || mese} ${anno}`;
}

function creaLeakCardHtml(item, index) {
    const nomeFile = item["Nome file"] || 'Leak senza nome';
    let url = item.Link || item.Url;
    url = convertiUrlDropbox(url);
    const isJpg = /\.(jpg|jpeg|png|gif|webp)$/i.test(nomeFile);
    const thumbSrc = isJpg ? url : `thumbnails/${nomeFile}.jpg`;

    return `
        <div class="video-card" onclick="openLeakModal(${index})" style="cursor: pointer;">
            <div class="thumbnail-container" style="width:100%; height:150px; background:#000; border-radius:6px; overflow:hidden; display:flex; align-items:center; justify-content:center; pointer-events: none;">
                <img src="${thumbSrc}" onerror="this.onerror=null; this.src='gta6-logo.jpg';" alt="${nomeFile}" style="width:100%; height:100%; object-fit:contain;">
            </div>
            <div class="video-title-main" style="margin-top: 12px; font-size: 1.25rem; font-weight: bold; word-break: break-all; text-align: left; width: 100%; padding: 4px 0; pointer-events: none;">
                ${nomeFile}
            </div>
        </div>
    `;
}

function renderizzaLeakGTA(leaks, titoloDataForzato = null) {
    const periodiContainer = document.getElementById('periodi-container');
    if (periodiContainer) periodiContainer.style.display = 'block';

    currentLeaksList = leaks;
    const container = document.getElementById('video-container');
    container.innerHTML = '';

    if (!leaks || leaks.length === 0) {
        container.innerHTML = '<p style="text-align:left; width:100%;">Nessun leak trovato.</p>';
        return;
    }

    if (titoloDataForzato) {
        const cardsHtml = leaks.map((item, index) => creaLeakCardHtml(item, index)).join('');
        container.innerHTML = `
            <div class="month-section" style="grid-column: 1 / -1; width: 100%; margin-bottom: 25px;">
                <h2 class="month-title" style="font-size: 1.3rem; margin: 15px 0; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 6px;">${titoloDataForzato}</h2>
                <div class="video-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
                    ${cardsHtml}
                </div>
            </div>
        `;
    } else {
        let groups = {};
        let groupKeys = [];

        leaks.forEach((item, index) => {
            const info = estraiInfoData(item.Data);
            const anno = info ? info.anno : "Senza Data";

            if (!groups[anno]) {
                groups[anno] = [];
                groupKeys.push(anno);
            }
            groups[anno].push({ item, originalIndex: index });
        });

        groupKeys.sort((a, b) => b.localeCompare(a));

        container.innerHTML = groupKeys.map(anno => {
            const cardsHtml = groups[anno].map(obj => creaLeakCardHtml(obj.item, obj.originalIndex)).join('');
            return `
                <div class="month-section" style="grid-column: 1 / -1; width: 100%; margin-bottom: 25px;">
                    <h2 class="month-title" style="font-size: 1.3rem; margin: 15px 0; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 6px;">${anno}</h2>
                    <div class="video-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
                        ${cardsHtml}
                    </div>
                </div>
            `;
        }).join('');
    }
}

window.openLeakModal = (index) => {
    const modal = document.getElementById('video-modal');
    const modalBody = document.getElementById('modal-body');
    const item = currentLeaksList[index];
    if (!item) return;

    const link = fixDropboxUrl((item.Link || '').trim());
    const nomeFile = item["Nome file"] || 'Leak senza nome';
    const dataFile = item.Data || '/';
    const canaleFile = (item.Canale || item["Canale"] || '').trim() || 'GTA 6 LEAKS';
    
    const isFoto = /\.(jpg|jpeg|png|webp|gif)($|\?)/i.test(link);

    let mediaContent = '';
    if (!link) {
        mediaContent = '<p style="text-align:center; color:#888;">Link non disponibile</p>';
    } else if (isFoto) {
        mediaContent = `<img src="${link}" alt="${nomeFile}" referrerpolicy="no-referrer" style="width:100%; max-height:60vh; object-fit:contain; border-radius:6px; display:block; margin:0 auto;">`;
    } else {
        mediaContent = `
            <video src="${link}" controls autoplay playsinline style="width:100%; max-height:60vh; border-radius:6px; background:#000;">
                Il browser non supporta la riproduzione di questo video.
            </video>`;
    }

    const openLinkBtn = link 
        ? `<a href="${link}" target="_blank" class="share-btn" style="text-align:center; display:block; margin-top:12px; text-decoration:none;">Apri file</a>`
        : '';

    modalBody.innerHTML = `
        <div style="margin-bottom: 15px;">
            ${mediaContent}
        </div>
        ${openLinkBtn}
        <div class="info-section" style="margin-top: 15px;">
            <h4>Informazioni Leak</h4>
            <p><strong>Nome file:</strong> ${nomeFile}</p>
            <p><strong>Canale:</strong> ${canaleFile}</p>
            <p><strong>Data:</strong> ${dataFile}</p>
        </div>
    `;

    modal.style.display = "block";
    document.body.classList.add('modal-open');
};

let modalitaGTA = false;

async function toggleVistaGTA() {
    const btn = document.getElementById('btn-toggle-leak');
    const sezioniFiltri = document.getElementById('sezioni-filtri');
    const periodiContainer = document.getElementById('periodi-container');
    const fileContainer = document.getElementById('file-container');
    modalitaGTA = !modalitaGTA;

    if (modalitaGTA) {
        if (sezioniFiltri) sezioniFiltri.style.display = 'none';
        if (btn) btn.textContent = 'Video della GoPro';

        await mostraLeakGTA();
    } else {
        if (sezioniFiltri) sezioniFiltri.style.display = 'block';
        if (periodiContainer) periodiContainer.style.display = 'none';
        if (fileContainer) fileContainer.style.display = 'none';
        if (btn) btn.textContent = 'Leak di GTA VI';

        resetFilters();
    }
}

let allLeaksList = [];

function estraiInfoData(dataStr) {
    if (!dataStr || dataStr === '/' || dataStr.trim() === '') return null;
    
    const soloData = dataStr.split(',')[0].trim().split(' ')[0]; 
    const parti = soloData.split('/');
    if (parti.length < 3) return null;
    
    const anno = parti[2].trim();
    const dataSenzaAnno = `${parti[0]}/${parti[1]}`;
    
    return { anno, dataFormatted: dataSenzaAnno };
}

function generaDivisorePeriodi(leaks) {
    const filterContainer = document.getElementById('periodi-container'); 
    if (!filterContainer) return;

    const mappaPeriodi = {};

    leaks.forEach(item => {
        const info = estraiInfoData(item.Data);
        if (!info) return;
        
        const { anno, dataFormatted } = info;
        if (!mappaPeriodi[anno]) mappaPeriodi[anno] = {};
        if (!mappaPeriodi[anno][dataFormatted]) mappaPeriodi[anno][dataFormatted] = [];
        mappaPeriodi[anno][dataFormatted].push(item);
    });

    const anniDisponibili = Object.keys(mappaPeriodi).sort((a, b) => b - a);

    let html = `
        <div class="album-group">
            <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center; width: 100%;">
                <span class="filter-label">Periodi:</span>
                <button class="filter-btn active" onclick="mostraTuttiLeak(this)">
                    Tutti i leak
                </button>
    `;

    anniDisponibili.forEach(anno => {
        html += `
            <button class="filter-btn" onclick="mostraDateAnno('${anno}', this)">
                ${anno}
            </button>
        `;
    });

    html += `
            </div>
            <div id="sub-dates-container" style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; width: 100%;"></div>
        </div>
    `;

    filterContainer.innerHTML = html;
    filterContainer.style.display = 'block';
    window.mappaPeriodiLeak = mappaPeriodi;
}

window.mostraDateAnno = (anno, btn) => {
    document.querySelectorAll('#periodi-container .album-group .filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const subContainer = document.getElementById('sub-dates-container');
    const dateAnno = window.mappaPeriodiLeak[anno];
    if (!dateAnno || !subContainer) return;

    let html = '';
    Object.keys(dateAnno).forEach(data => {
        html += `
            <button class="filter-btn" onclick="filtraPerData('${anno}', '${data}', this)">
                ${data}
            </button>`;
    });

    subContainer.innerHTML = html;
    
    const tuttiLeakAnno = Object.values(dateAnno).flat();
    renderizzaLeakGTA(tuttiLeakAnno);
};

window.filtraPerData = (anno, data, btn) => {
    document.querySelectorAll('#sub-dates-container .filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const leakFiltrati = window.mappaPeriodiLeak[anno][data] || [];
    const dataEstesa = formattaDataEstesa(data, anno);
    renderizzaLeakGTA(leakFiltrati, dataEstesa);
};

window.mostraTuttiLeak = (btn) => {
    document.querySelectorAll('#periodi-container .album-group .filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const subContainer = document.getElementById('sub-dates-container');
    if (subContainer) subContainer.innerHTML = '';
    renderizzaLeakGTA(allLeaksList);
};

function estraiTipoFile(nomeFile) {
    if (!nomeFile || typeof nomeFile !== 'string' || !nomeFile.includes('.')) {
        return ' / ';
    }
    const parti = nomeFile.trim().split('.');
    const estensione = parti[parti.length - 1].toLowerCase();
    return estensione ? estensione : ' / ';
}

function generaDivisoreFile(leaks) {
    const filterContainer = document.getElementById('file-container'); 
    if (!filterContainer) return;

    const mappaFile = {};

    leaks.forEach(item => {
        const nome = item['Nome file'] || item.NomeFile || item.Nome || '';
        const tipo = estraiTipoFile(nome);

        if (!mappaFile[tipo]) mappaFile[tipo] = [];
        mappaFile[tipo].push(item);
    });

    const tipiDisponibili = Object.keys(mappaFile).sort();

    let html = `
        <div class="album-group">
            <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center; width: 100%;">
                <span class="filter-label">File:</span>
                <button class="filter-btn active" onclick="mostraTuttiFileLeak(this)">
                    Tutti
                </button>
    `;

    tipiDisponibili.forEach(tipo => {
        html += `
            <button class="filter-btn" onclick="filtraPerTipoFile('${tipo}', this)">
                ${tipo}
            </button>
        `;
    });

    html += `
            </div>
        </div>
    `;

    filterContainer.innerHTML = html;
    filterContainer.style.display = 'block';
    window.mappaFileLeak = mappaFile;
}

window.filtraPerTipoFile = (tipo, btn) => {
    document.querySelectorAll('#file-container .filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const leakFiltrati = window.mappaFileLeak[tipo] || [];
    renderizzaLeakGTA(leakFiltrati);
};

window.mostraTuttiFileLeak = (btn) => {
    document.querySelectorAll('#file-container .filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    renderizzaLeakGTA(allLeaksList);
};

let modalitaDrone = false;
let droneItemsList = [];
let sezioneAttiva = 'gopro';

function aggiornaPulsantiSezione() {
    const container = document.getElementById('section-buttons-container');
    if (!container) return;

    const sezioni = [
        { id: 'gopro', label: 'Video della GoPro' },
        { id: 'fabio', label: 'File di Fabio' },
        { id: 'drone', label: 'Drone' },
        { id: 'gta', label: 'Leak di GTA VI' }
    ];

    container.innerHTML = sezioni
        .filter(s => s.id !== sezioneAttiva)
        .map(s => `<button class="btn-gta-leak" onclick="cambiaSezione('${s.id}')">${s.label}</button>`)
        .join('');
}

async function mostraVideoFabio() {
    if (!ottieniPasswordFabio()) {
        return false;
    }

    sezioneAttiva = 'fabio';
    
    const sezioniFiltri = document.getElementById('sezioni-filtri');
    const periodiContainer = document.getElementById('periodi-container');
    const fileContainer = document.getElementById('file-container');

    if (sezioniFiltri) sezioniFiltri.style.display = 'none';
    if (periodiContainer) { periodiContainer.style.display = 'none'; periodiContainer.innerHTML = ''; }
    if (fileContainer) { fileContainer.style.display = 'none'; fileContainer.innerHTML = ''; }

    aggiornaPulsantiSezione();

    const fabioVideos = allVideos.filter(v => v.Album === "Video Fabio");
    currentVideosList = fabioVideos;

    const container = document.getElementById('video-container');
    container.innerHTML = `
        <div class="month-section" style="grid-column: 1 / -1; width: 100%; margin-bottom: 25px;">
            <h2 class="month-title" style="font-size: 1.3rem; margin: 15px 0; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 6px;">File di Fabio</h2>
            <div class="video-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
                ${fabioVideos.map((v, index) => createVideoCardHtml(v, index)).join('')}
            </div>
        </div>
    `;

    return true;
}

async function cambiaSezione(nuovaSezione) {
    if (sezioneAttiva === nuovaSezione) return;

    if (nuovaSezione === 'fabio') {
        if (!ottieniPasswordFabio()) return;
    } else if (nuovaSezione === 'drone') {
        if (!(await ottieniPasswordDrone())) return;
    }

    sezioneAttiva = nuovaSezione;

    const sezioniFiltri = document.getElementById('sezioni-filtri');
    const periodiContainer = document.getElementById('periodi-container');
    const fileContainer = document.getElementById('file-container');

    if (nuovaSezione === 'fabio') {
        if (sezioniFiltri) sezioniFiltri.style.display = 'none';
        if (periodiContainer) { periodiContainer.style.display = 'none'; periodiContainer.innerHTML = ''; }
        if (fileContainer) { fileContainer.style.display = 'none'; fileContainer.innerHTML = ''; }
        aggiornaPulsantiSezione();
        mostraVideoFabio();
    } else if (nuovaSezione === 'drone') {
        if (sezioniFiltri) sezioniFiltri.style.display = 'none';
        if (periodiContainer) { periodiContainer.style.display = 'none'; periodiContainer.innerHTML = ''; }
        if (fileContainer) { fileContainer.style.display = 'none'; fileContainer.innerHTML = ''; }
        aggiornaPulsantiSezione();
        await mostraDrone();
    } else if (nuovaSezione === 'gopro') {
        if (sezioniFiltri) sezioniFiltri.style.display = 'block';
        if (periodiContainer) periodiContainer.style.display = 'none';
        if (fileContainer) fileContainer.style.display = 'none';
        aggiornaPulsantiSezione();
        const goproVideos = allVideos.filter(v => v.Album !== "Video Fabio");
        renderVideos(goproVideos);
    } else if (nuovaSezione === 'gta') {
        if (sezioniFiltri) sezioniFiltri.style.display = 'none';
        if (periodiContainer) { periodiContainer.style.display = 'none'; periodiContainer.innerHTML = ''; }
        if (fileContainer) { fileContainer.style.display = 'none'; fileContainer.innerHTML = ''; }
        aggiornaPulsantiSezione();
        await mostraLeakGTA();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    aggiornaPulsantiSezione();
});

async function mostraDrone() {
    const container = document.getElementById('video-container');
    if (container) {
        container.innerHTML = '<p style="text-align:center; width:100%;">Caricamento contenuti Drone in corso...</p>';
    }

    try {
        const response = await fetch('data3.json?v=' + Date.now());
        window.droneData = await response.json();
        droneItemsList = window.droneData;
        renderizzaDrone(droneItemsList);
        return true;
    } catch (error) {
        console.error("Errore nel caricamento di data3.json:", error);
        if (container) {
            container.innerHTML = '<p style="text-align:center; width:100%;">Errore nel caricamento dei file Drone.</p>';
        }
        return false;
    }
}

function renderizzaDrone(items) {
    const container = document.getElementById('video-container');
    container.innerHTML = '';

    if (!items || items.length === 0) {
        container.innerHTML = '<p style="text-align:center; width:100%;">Nessun file Drone trovato.</p>';
        return;
    }

    const youtubeFallback = "https://img.youtube.com/vi/00000000000/hqdefault.jpg";

    items.forEach((item, index) => {
        const realLink = decrittografaLinkDrone(item.Link);
        const isDecrypted = realLink && !realLink.startsWith("U2FsdGVkX1");
        const nomeFile = item.Nome || item["Nome file"] || 'File senza nome';

        let mediaPreview = '';

        if (!isDecrypted) {
            mediaPreview = `<img src="${youtubeFallback}" class="video-thumbnail" alt="${nomeFile}" style="width:100%; height:180px; object-fit:cover; border-radius:8px;">`;
        } else {
            const isImage = /\.(jpg|jpeg|png|webp|gif)($|\?)/i.test(realLink) || item["Tipo di File"]?.toLowerCase() === 'jpg';

            if (isImage) {
                mediaPreview = `<img src="${realLink}" class="video-thumbnail" alt="${nomeFile}" style="width:100%; height:180px; object-fit:cover; border-radius:8px;" onerror="this.onerror=null; this.src='${youtubeFallback}';">`;
            } else {
                const thumbUrl = `thumbnails2/${nomeFile}.jpg`;
                mediaPreview = `<img src="${thumbUrl}" class="video-thumbnail" alt="${nomeFile}" style="width:100%; height:180px; object-fit:cover; border-radius:8px;" onerror="this.onerror=null; this.src='${youtubeFallback}';">`;
            }
        }

        const card = document.createElement('div');
        card.className = 'video-card';
        card.style.cursor = 'pointer';
        card.onclick = () => apriModalDrone(index);

        const durataBadge = (item.Durata && item.Durata !== "/") 
            ? `<span class="duration-badge" style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.8); color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">${item.Durata}</span>` 
            : '';

        card.innerHTML = `
            <div class="thumbnail-container" style="position: relative;">
                ${mediaPreview}
                ${durataBadge}
            </div>
            <div class="video-title-main" style="margin-top: 8px;">${nomeFile}</div>
        `;
        container.appendChild(card);
    });
}

function apriModalDrone(index) {
    const item = droneItemsList[index];
    if (!item) return;

    if (item.Link && item.Link.startsWith("U2FsdGVkX1") && !isDroneUnlocked) {
        return;
    }

    const realLink = decrittografaLinkDrone(item.Link);

    if (!realLink) {
        alert("Password errata o impossibile decrittografare il link!");
        passwordDrone = "";
        isDroneUnlocked = false;
        return;
    }

    const modal = document.getElementById('video-modal');
    const modalBody = document.getElementById('modal-body');

    const isImage = /\.(jpg|jpeg|png|webp|gif)($|\?)/i.test(realLink || '') || item["Tipo di File"]?.toLowerCase() === 'jpg';
    const caricatoSu = item["Caricato su"] || 'Catbox';

    let mediaContent = isImage
        ? `<img src="${realLink}" alt="${item.Nome}" style="width:100%; max-height:450px; object-fit:contain; border-radius:8px;">`
        : `<video src="${realLink}" controls style="width:100%; max-height:450px; border-radius:8px;" autoplay></video>`;

    modalBody.innerHTML = `
        <div class="modal-video-wrapper" style="margin-bottom: 15px;">
            ${mediaContent}
        </div>

        <div class="info-section">
            <h4>Informazioni generali</h4>
            <p><strong>Nome:</strong> ${item.Nome || '/'}</p>
            <p><strong>Durata:</strong> ${item.Durata || '/'}</p>
            <p><strong>Data:</strong> ${item.Data || '/'}</p>
        </div>

        <hr>

        <div class="info-section">
            <h4>Altre informazioni</h4>
            <p><strong>Tipo di File:</strong> ${item["Tipo di File"] || '/'}</p>
            <p><strong>Caricato su:</strong> ${caricatoSu}</p>
            <p><strong>Data di Caricamento:</strong> ${item["Data di caricamento"] || '/'}</p>
        </div>

        <hr>

        <div class="info-section">
            <h4>Informazioni Fotocamera</h4>
            <p><strong>Fotocamera:</strong> ${item.Fotocamera || '/'}</p>
            <p><strong>Risoluzione:</strong> ${item.Risoluzione || '/'}</p>
            <p><strong>Fotogrammi:</strong> ${item.Fotogrammi || '/'}</p>
        </div>
    `;

    modal.style.display = "block";
    document.body.classList.add('modal-open');
}

loadGallery();