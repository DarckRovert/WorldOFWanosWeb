/*
    World OF Wanos — Logic & Interactivity v2.0
    Protocolo: DarckRovert Technical
    Correcciones: cursor, initCustomCursor, countdown-title, quote interval,
                  modal accesible, nav activa, scroll progress, boss modal, forge extendido
*/

'use strict';

let isFrenzy = false;
let quoteIntervalId = null;

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initCountdown();
    initScrollAnimations();
    initRandomQuotes();
    initWeather();
    initCustomCursor();
    initAchievements();
    initSecretLore();
    initNavigation();
    initScrollProgress();
    initBossCards();
    initForgeButtons();
    initMobileNav();
    updateTwitchParent();

    // Disparo achievement de bienvenida
    setTimeout(() => {
        spawnAchievement('👁', 'Alerta del Panteón', 'Los Vigilantes han detectado tu presencia en Rasganorte.');
    }, 2500);
});

// ─────────────────────────────────────────────────────────────────────────────
// TWITCH: auto-parent para producción
// ─────────────────────────────────────────────────────────────────────────────
function updateTwitchParent() {
    const iframe = document.getElementById('twitch-iframe');
    if (!iframe) return;
    try {
        const hostname = window.location.hostname || 'localhost';
        const url = new URL(iframe.src);
        url.searchParams.set('parent', hostname);
        iframe.src = url.toString();
    } catch (e) {
        console.error('Error actualizando parent de Twitch:', e);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL PROGRESS BAR
// ─────────────────────────────────────────────────────────────────────────────
function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
        bar.style.width = pct + '%';
    }, { passive: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION: activa + scroll styling
// ─────────────────────────────────────────────────────────────────────────────
function initNavigation() {
    const nav = document.getElementById('main-nav');
    const links = document.querySelectorAll('.nav-link[data-section]');
    const sections = document.querySelectorAll('section[id]');

    // Scroll → nav scrolled
    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        // Actualizar link activo por sección visible
        let current = '';
        sections.forEach(sec => {
            const top = sec.offsetTop - 120;
            if (window.scrollY >= top) {
                current = sec.getAttribute('id');
            }
        });

        links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === current) {
                link.classList.add('active');
            }
        });
    }, { passive: true });

    // Smooth scroll al hacer click en links de nav
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Cerrar mobile nav si está abierto
                document.getElementById('mobile-nav-overlay').classList.remove('open');
            }
        });
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE NAV TOGGLE
// ─────────────────────────────────────────────────────────────────────────────
function initMobileNav() {
    const toggle = document.getElementById('nav-mobile-toggle');
    const overlay = document.getElementById('mobile-nav-overlay');
    if (!toggle || !overlay) return;

    toggle.addEventListener('click', () => {
        overlay.classList.toggle('open');
        toggle.textContent = overlay.classList.contains('open') ? '✕' : '☰';
    });

    overlay.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            overlay.classList.remove('open');
            toggle.textContent = '☰';
        });
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// FASE DE FRENESÍ (Tilteados Anónimos)
// ─────────────────────────────────────────────────────────────────────────────
window.toggleFrenzy = function() {
    isFrenzy = !isFrenzy;
    document.body.classList.toggle('frenzy-mode', isFrenzy);

    if (isFrenzy) {
        spawnAchievement('🔥', 'FASE DE FRENESÍ ACTIVADA', 'Sintonía con Tilteados Anónimos. El Universo Wanos vibra bajo el caos.');
    } else {
        spawnAchievement('❄', 'Orden Glacial Restaurado', 'Bhalanar ha purificado el frenesí. La calma retorna al Panteón.');
    }

    // Reiniciar las citas inmediatamente con el set correcto
    if (quoteIntervalId) {
        clearInterval(quoteIntervalId);
        quoteIntervalId = null;
    }
    initRandomQuotes();
};

// ─────────────────────────────────────────────────────────────────────────────
// ACHIEVEMENT SYSTEM
// ─────────────────────────────────────────────────────────────────────────────
function spawnAchievement(icon, title, subtitle) {
    const container = document.getElementById('achievement-container');
    if (!container) return;

    const el = document.createElement('div');
    el.className = 'achievement';
    el.innerHTML = `
        <div style="font-size:2rem;flex-shrink:0;">${icon}</div>
        <div>
            <strong style="display:block;font-family:var(--font-titles);font-size:0.75rem;letter-spacing:2px;color:var(--secondary-gold);">${title}</strong>
            <span style="font-size:0.8rem;color:var(--text-muted);">${subtitle}</span>
        </div>
    `;
    container.appendChild(el);
    setTimeout(() => {
        if (el.parentNode) el.remove();
    }, 5200);
}

function initAchievements() {
    // Observador para achievements al entrar en secciones
    const achievementMap = {
        'architects': { icon: '👁', title: 'Crónica Desbloqueada', sub: 'Los Forjadores del Orden se revelan ante ti.' },
        'conquest': { icon: '⚔', title: 'Mapa de Batalla Accedido', sub: 'Las Crónicas de la Conquista están abiertas.' },
        'streaming': { icon: '🔴', title: 'Sintonía Establecida', sub: 'Los Ventanales del Vacío se han abierto.' },
        'recruit': { icon: '📜', title: 'Convocatoria Recibida', sub: 'El Panteón examina tu valía, guerrero.' },
        'wisdom': { icon: '🔨', title: 'Forja Activada', sub: 'La sabiduría del Panteón está a tu disposición.' },
    };

    const triggeredSections = new Set();

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                if (id && achievementMap[id] && !triggeredSections.has(id)) {
                    triggeredSections.add(id);
                    const data = achievementMap[id];
                    setTimeout(() => spawnAchievement(data.icon, data.title, data.sub), 600);
                }
            }
        });
    }, { threshold: 0.4 });

    Object.keys(achievementMap).forEach(id => {
        const el = document.getElementById(id);
        if (el) obs.observe(el);
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// PARTICLES SYSTEM (Aurora / Mist Effect)
// ─────────────────────────────────────────────────────────────────────────────
function initParticles() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animFrameId;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    class Particle {
        constructor() { this.reset(true); }

        reset(init) {
            this.x = Math.random() * canvas.width;
            this.y = init ? Math.random() * canvas.height : (Math.random() < 0.5 ? -10 : canvas.height + 10);
            this.size = Math.random() * 2.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.6;
            this.speedY = (Math.random() - 0.5) * 0.6;
            this.opacity = Math.random() * 0.45 + 0.05;
            this.maxOpacity = this.opacity;
            this.hue = isFrenzy ? 0 : 198;
            this.saturation = isFrenzy ? 85 : 88;
            this.life = 1;
            this.decayRate = Math.random() * 0.003 + 0.001;
        }

        update() {
            const speedMult = isFrenzy ? 3.5 : 1;
            this.x += this.speedX * speedMult;
            this.y += this.speedY * speedMult;
            this.life -= this.decayRate * (isFrenzy ? 2.5 : 1);
            this.opacity = this.maxOpacity * this.life;

            if (this.life <= 0) {
                this.reset(false);
                this.hue = isFrenzy ? 0 : 198;
            }
        }

        draw() {
            ctx.save();
            ctx.fillStyle = `hsla(${this.hue}, ${this.saturation}%, 65%, ${this.opacity})`;
            ctx.shadowBlur = isFrenzy ? 18 : 8;
            ctx.shadowColor = `hsla(${this.hue}, ${this.saturation}%, 65%, 0.4)`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * (isFrenzy ? 1.6 : 1), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    for (let i = 0; i < 80; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.fillStyle = isFrenzy ? 'rgba(18, 2, 2, 0.12)' : 'rgba(8, 8, 14, 0.06)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        animFrameId = requestAnimationFrame(animate);
    }

    animate();
}

// ─────────────────────────────────────────────────────────────────────────────
// COUNTDOWN - próximo raid sábado 20hs
// ─────────────────────────────────────────────────────────────────────────────
function initCountdown() {
    function getNextRaidDate() {
        const now = new Date();
        const next = new Date(now);
        const dayOfWeek = now.getDay(); // 0=domingo, 6=sábado
        const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
        next.setDate(now.getDate() + (daysUntilSaturday === 0 ? 7 : daysUntilSaturday));
        next.setHours(20, 0, 0, 0);
        // Si ya pasó el sábado de esta semana a las 20hs, ir al próximo
        if (next <= now) {
            next.setDate(next.getDate() + 7);
        }
        return next;
    }

    const nextRaid = getNextRaidDate();
    const titleEl = document.getElementById('countdown-title');

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minsEl = document.getElementById('minutes');
    const secsEl = document.getElementById('seconds');

    function tick(el, value) {
        if (!el) return;
        const newVal = value.toString().padStart(2, '0');
        if (el.innerText !== newVal) {
            el.classList.remove('tick');
            void el.offsetWidth; // reflow
            el.classList.add('tick');
            el.innerText = newVal;
        }
    }

    const updateTimer = () => {
        const now = new Date().getTime();
        const distance = nextRaid - now;

        if (distance <= 0) {
            if (titleEl) titleEl.innerText = '🔥 LA CACERÍA HA COMENZADO. POR EL UNIVERSO WANOS. 🔥';
            tick(daysEl, 0); tick(hoursEl, 0); tick(minsEl, 0); tick(secsEl, 0);
            return;
        }

        const d = Math.floor(distance / (1000 * 60 * 60 * 24));
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);

        tick(daysEl, d);
        tick(hoursEl, h);
        tick(minsEl, m);
        tick(secsEl, s);

        if (titleEl) {
            if (d > 1) {
                titleEl.innerText = `Los Vigilantes dictan preparación. Faltan ${d} días para la incursión.`;
            } else if (d === 1) {
                titleEl.innerText = '🛡 Mañana es la batalla. Revisa tu equipamiento y consumibles.';
            } else if (h > 2) {
                titleEl.innerText = `⚔ Hoy es el día. Conéctate en ${h} horas. El Panteón convoca.`;
            } else if (h < 1 && d === 0) {
                titleEl.innerText = '🔥 Morgoroth convoca a las sombras. Formación inmediata en Discord.';
            } else {
                titleEl.innerText = '⚡ El raid se acerca. ¡Afilen el acero, guerreros del Panteón!';
            }
        }
    };

    setInterval(updateTimer, 1000);
    updateTimer();
}

// ─────────────────────────────────────────────────────────────────────────────
// SECRET LORE MODALS
// ─────────────────────────────────────────────────────────────────────────────
function initSecretLore() {
    const modal = document.getElementById('lore-modal');
    const titleEl = document.getElementById('lore-title');
    const subtitleEl = document.getElementById('lore-subtitle');
    const bodyEl = document.getElementById('lore-body');
    const tagsEl = document.getElementById('lore-tags');
    const avatarEl = document.getElementById('modal-avatar');
    const closeBtn = document.querySelector('#lore-modal .close-modal');

    const loreDatabase = {
        'rune-1': {
            title: 'Crónicas del Vigilante',
            subtitle: 'Bhalanar — Vigilante de la Urdimbre',
            avatar: 'assets/images/bhalanar.png',
            text: `
                <p style="line-height:2; font-style:italic; font-size:1.05rem; color:#ddd; margin-bottom:20px;">
                    "Bhalanar no es un simple líder; es un remanente del Orden. Mientras el mundo se desmorona bajo el peso de la traición en Ulduar, él mantiene el equilibrio en el Universo Wanos."
                </p>
                <p style="color:var(--text-muted); margin-bottom:15px;">
                    Antiguo guardián de las Salas de la Creación, Bhalanar presenció la caída de los Titanes y eligió preservar lo que quedaba de la orden cósmica. Su lema es implacable:
                </p>
                <p style="color:var(--secondary-gold); font-family:var(--font-titles); letter-spacing:2px; font-size:0.9rem;">
                    "Aquí, el GS no compra el respeto; el alma lo forja."
                </p>
            `,
            tags: ['Vigilante Supremo', 'GM', 'Fundador', 'Ulduar']
        },
        'rune-2': {
            title: 'Sentencia del Ejecutor',
            subtitle: 'Morgoroth — Gran Ejecutor / Co-GM',
            avatar: 'assets/images/morgoroth.png',
            text: `
                <p style="line-height:2; font-style:italic; font-size:1.05rem; color:#ddd; margin-bottom:20px;">
                    "Morgoroth no conoce el descanso. Su justicia es tan fría como el hielo de ICC. Aquellos que traen toxicidad al Universo Wanos no son expulsados, son borrados de las crónicas."
                </p>
                <p style="color:var(--text-muted); margin-bottom:15px;">
                    Comandante veterano de la Espada de Ébano, Morgoroth es el catalizador de la <b style="color:var(--accent-red)">Fase de Frenesí</b>. Bajo su mando, la hermandad <i>Tilteados Anónimos</i> libera un poder incontenible que solo su disciplina puede contener.
                </p>
                <p style="color:var(--accent-red); font-family:var(--font-titles); letter-spacing:2px; font-size:0.9rem;">
                    "El filo de la justicia glacial no distingue entre aliados y toxicidad."
                </p>
            `,
            tags: ['Gran Ejecutor', 'Co-GM', 'Tilteados Anónimos', 'Espada de Ébano']
        },
        'card-bhalanar': {
            title: 'Crónicas del Vigilante',
            subtitle: 'Bhalanar — Vigilante de la Urdimbre',
            avatar: 'assets/images/bhalanar.png',
            text: `
                <p style="line-height:2; font-style:italic; font-size:1.05rem; color:#ddd; margin-bottom:20px;">
                    "Bhalanar no es un simple líder; es un remanente del Orden que teje los hilos del destino desde las alturas de Ulduar."
                </p>
                <p style="color:var(--text-muted); margin-bottom:15px;">
                    Antiguo observador de las Salas de la Creación, Bhalanar presenció la corrupción de Yogg-Saron y eligió preservar la chispa del Orden en el Universo Wanos. Fundó la hermandad para que ningún alma más se perdiera en el caos de Rasganorte.
                </p>
                <p style="color:var(--secondary-gold); font-family:var(--font-titles); letter-spacing:2px; font-size:0.9rem;">
                    "Aquí, el GS no compra el respeto; el alma lo forja."
                </p>
            `,
            tags: ['Vigilante Supremo', 'GM', 'Fundador', 'Ulduar', 'Arquitecto de Realidades']
        },
        'card-morgoroth': {
            title: 'Sentencia del Ejecutor',
            subtitle: 'Morgoroth — Gran Ejecutor / Co-GM',
            avatar: 'assets/images/morgoroth.png',
            text: `
                <p style="line-height:2; font-style:italic; font-size:1.05rem; color:#ddd; margin-bottom:20px;">
                    "Morgoroth encarna la justicia glacial. No hay ni perdón ni segunda oportunidad para quienes manchan el honor del Panteón."
                </p>
                <p style="color:var(--text-muted); margin-bottom:15px;">
                    Veterano de cien batallas en la Ciudadela de la Corona de Hielo, Morgoroth es el pilar que sostiene la disciplina del raid. Su alter ego en <b style="color:var(--accent-red)">Tilteados Anónimos</b> revela una faceta caótica pero controlada — el frenesí como herramienta de victoria.
                </p>
                <p style="color:var(--accent-red); font-family:var(--font-titles); letter-spacing:2px; font-size:0.9rem;">
                    "El caos es mi arma. La victoria, mi única doctrina."
                </p>
            `,
            tags: ['Gran Ejecutor', 'Co-GM', 'Tilteados Anónimos', 'Segador de Almas', 'ICC Experto']
        }
    };

    function openLoreModal(id) {
        const data = loreDatabase[id];
        if (!data || !modal) return;

        titleEl.innerText = data.title;
        if (subtitleEl) subtitleEl.innerText = data.subtitle;
        if (avatarEl) { avatarEl.src = data.avatar; avatarEl.alt = data.title; }
        bodyEl.innerHTML = data.text;
        if (tagsEl) {
            tagsEl.innerHTML = data.tags.map(t =>
                `<span class="tag tag-glacial">${t}</span>`
            ).join('');
        }
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeLoreModal() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    // Secret runes
    document.querySelectorAll('.secret-rune:not(.frenzy-trigger)').forEach(rune => {
        rune.addEventListener('click', () => openLoreModal(rune.id));
    });

    // Lore cards
    document.querySelectorAll('.lore-card').forEach(card => {
        card.addEventListener('click', () => openLoreModal(card.id));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') openLoreModal(card.id);
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLoreModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeLoreModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLoreModal(); });
}

// ─────────────────────────────────────────────────────────────────────────────
// BOSS CARDS MODAL
// ─────────────────────────────────────────────────────────────────────────────
function initBossCards() {
    const modal = document.getElementById('boss-modal');
    const titleEl = document.getElementById('boss-modal-title');
    const bodyEl = document.getElementById('boss-modal-body');
    const closeBtn = document.getElementById('close-boss-modal');

    const bossLore = {
        'boss-arthas': {
            title: 'El Rey Exánime — Arthas Menethil',
            body: 'El príncipe caído que traicionó a su pueblo. Sentado en el Trono Helado de la Ciudadela de la Corona de Hielo, comanda a los muertos que alguna vez fueron sus aliados. El Universo Wanos marcha hacia su caída. Bhalanar ya prepara la estrategia final.'
        },
        'boss-anubarak': {
            title: "Anub'arak — El Rey Araña",
            body: "Antiguo rey nerubio resucitado por la Plaga. Fue derrotado en la Prueba del Cruzado por el Panteón de Wanos. Sus restos yacen como trofeo en el banco de hermandad. Primera gran conquista del Universo Wanos en raid de 25 jugadores."
        },
        'boss-algalon': {
            title: 'Algalon el Observador — Ulduar',
            body: 'Mensajero cósmico enviado para evaluar si Azeroth merece continuar existiendo. Bhalanar lo convenció de recalibrar su juicio. Una victoria que trasciende el combate — fue ganada con argumento, valentía y el poder colectivo del Panteón.'
        }
    };

    function openBossModal(id) {
        const data = bossLore[id];
        if (!data || !modal) return;
        titleEl.innerText = data.title;
        bodyEl.innerText = data.body;
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeBossModal() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    document.querySelectorAll('.boss-card').forEach(card => {
        card.addEventListener('click', () => openBossModal(card.id));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') openBossModal(card.id);
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeBossModal);
    if (modal) {
        modal.addEventListener('click', (e) => { if (e.target === modal) closeBossModal(); });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL ANIMATIONS
// ─────────────────────────────────────────────────────────────────────────────
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('section').forEach(section => observer.observe(section));
}

// ─────────────────────────────────────────────────────────────────────────────
// RANDOM QUOTES
// ─────────────────────────────────────────────────────────────────────────────
function initRandomQuotes() {
    const quotesFrenzy = [
        '¡POR LOS TILTEADOS ANÓNIMOS! EL CAOS NOS GUÍA.',
        'CAOS CONTROLADO. DOLOR COMPARTIDO. VICTORIA ASEGURADA.',
        'EL FRENESÍ NOS UNE, LA SANGRE DEL RAID NOS FORTALECE.',
        'NO HAY PAZ. SOLO EL RITMO IMPLACABLE DE LA GUERRA.',
        'SINTONIZA LA FRECUENCIA DEL TILTEO. MORGOROTH DICTA: MASACRE.',
        '🔥 EL UNIVERSO WANOS VIBRA BAJO EL CAOS DE LA FASE DE FRENESÍ. 🔥',
    ];

    const quotesNormal = [
        'Bhalanar observa la urdimbre... su mirada purifica el espíritu del recluta.',
        'Morgoroth dicta: La toxicidad es la plaga que consumiremos con fuego glacial.',
        'En el Universo Wanos, el honor se forja en el servicio mutuo, no en el GS.',
        '¿Has sintonizado tu alma con el Discord del Panteón hoy?',
        'Morgoroth dice: El GS es vanidad; la ejecución impecable es la verdadera gloria.',
        'Namor busca el amor en el vacío del olvido. El Panteón busca la victoria.',
        'Cada wipe es una lección. Cada victoria, una crónica eterna del Universo Wanos.',
        'Los Custodios no duermen; vigilan los portales de Rasganorte por el Panteón.',
    ];

    const quotes = isFrenzy ? quotesFrenzy : quotesNormal;
    const quoteElement = document.getElementById('random-quote');

    if (!quoteElement) return;

    const setQuote = () => {
        quoteElement.style.opacity = '0';
        setTimeout(() => {
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            quoteElement.textContent = `"${randomQuote}"`;
            quoteElement.style.opacity = '0.8';
        }, 500);
    };

    setQuote();
    quoteIntervalId = setInterval(setQuote, 9000);
}

// ─────────────────────────────────────────────────────────────────────────────
// FORGE (Class Tips)
// ─────────────────────────────────────────────────────────────────────────────
const forgeTips = {
    WARRIOR: {
        speaker: 'Morgoroth',
        tip: 'El escudo es tu fe; la defensa tu dogma. Mantén los 540 de temple. En Furia, el DPS supera la cordura — esa es la Fase de Frenesí encarnada.',
        stat: 'Defensa: 540 | ArP: Para Furia | Stam: Prioridad máxima en tank'
    },
    PALADIN: {
        speaker: 'Bhalanar',
        tip: 'La Luz es una herramienta del Orden. Sintoniza tu aura con la hermandad. En Sagrado, la cadena de curación es la vida misma del Panteón.',
        stat: 'SP: Máximo | Haste: Hasta cap | Int > Mp5 en fase avanzada'
    },
    DK: {
        speaker: 'Morgoroth',
        tip: 'Viniste de la muerte para servir a la vida de este Universo. El Profano es puro caos controlado — como el Frenesí. En Escarcha, el DPS es glacial y certero.',
        stat: 'ArP: 100% físico | Hit: 8% | Expertise: 26 | Stam: 30k+ en tank'
    },
    WARLOCK: {
        speaker: 'Morgoroth',
        tip: 'El fuego del vacío debe ser canalizado, no liberado sin control. Tu DPS es sagrado — el daño por tiempo es la primera mordida del Ejecutor.',
        stat: 'SP: Máximo | Hit: 17% | Haste: Beneficia DoTs | Demo ofrece Replenishment'
    },
    MAGE: {
        speaker: 'Bhalanar',
        tip: 'Escarcha congela la voluntad del enemigo. Fuego es el caos controlado de Morgoroth. En ICC, el Mago de Escarcha es el rey del DPS sostenido en raid de 25.',
        stat: 'SP: Máximo | Hit: 17% | Haste: Cap de Escarcha (1.51s Frostbolt) | Crit: secundario'
    },
    SHAMAN: {
        speaker: 'Bhalanar',
        tip: 'La naturaleza misma responde al llamado del Chamán. Restauración sostiene al Panteón; Mejora lleva la tormenta al cuerpo a cuerpo con Windfury eterno.',
        stat: 'Resto: SP + Haste + Mp5 | Mejora: ArP > AP > Haste | Crit para Flurry'
    },
    DRUID: {
        speaker: 'Bhalanar',
        tip: 'El Druida es el corazón del Panteón. Restauración provee HoTs indispensables en progression. Balance aporta replenishment y control de masas en ICC.',
        stat: 'Resto: Haste > SP > Crit | Balance: Hit 17% > Haste > SP | Crítico < Haste'
    },
    HUNTER: {
        speaker: 'Morgoroth',
        tip: 'La flecha del Cazador no falla en manos precisas. Puntería domina el DPS de cola en ICC. El pet es una extensión de tu voluntad — como los soldados del Panteón.',
        stat: 'ArP: 100% para Puntería | Hit: 8% | Crit: Importante | Haste: Opcional'
    }
};

window.showTip = function(className) {
    const tipElement = document.getElementById('forge-tip');
    if (!tipElement) return;

    const data = forgeTips[className];
    if (!data) return;

    // Quitar active de todos
    document.querySelectorAll('.forge-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById('forge-' + className.toLowerCase());
    if (activeBtn) activeBtn.classList.add('active');

    tipElement.style.display = 'block';
    tipElement.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;padding-bottom:15px;border-bottom:1px solid var(--border-neon);">
            <span style="font-size:1.8rem">${getClassIcon(className)}</span>
            <div>
                <p class="gold-text" style="font-family:var(--font-titles);font-size:0.8rem;letter-spacing:2px;margin-bottom:3px;">Sentencia de ${data.speaker}</p>
                <span style="font-size:0.7rem;color:var(--text-dim);font-family:var(--font-titles);letter-spacing:1px;">${className}</span>
            </div>
        </div>
        <p style="color:var(--text-main);margin-bottom:20px;line-height:1.8;font-size:0.92rem;">${data.tip}</p>
        <div style="background:var(--bg-mid);border:1px solid var(--border-neon);padding:15px 20px;border-radius:2px;font-family:var(--font-titles);font-size:0.68rem;letter-spacing:1.5px;color:var(--primary-glacial);">
            📊 ${data.stat}
        </div>
    `;
};

function getClassIcon(className) {
    const icons = { WARRIOR:'⚔', PALADIN:'✨', DK:'❄', WARLOCK:'🔮', MAGE:'🔥', SHAMAN:'🌊', DRUID:'🍃', HUNTER:'🏹' };
    return icons[className] || '⚔';
}

// Mark forge buttons as buttons for accessibility
function initForgeButtons() {
    document.querySelectorAll('.forge-btn').forEach(btn => {
        btn.setAttribute('type', 'button');
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// WEATHER SIMULATOR
// ─────────────────────────────────────────────────────────────────────────────
function initWeather() {
    const weathers = [
        { icon: '🌨', text: 'Tormenta de Sombras (Purificación en curso)' },
        { icon: '🌌', text: 'Aurora del Vacío (Energía mística máxima)' },
        { icon: '❄', text: 'Ventisca Glacial (La voluntad de Morgoroth)' },
        { icon: '☀', text: 'Cielos de Ulduar (La paz de Bhalanar)' },
        { icon: '⚡', text: 'Tormenta de Descargas (Frenesí detectado)' },
        { icon: '🌑', text: 'Eclipse del Vacío (Presencia Oscura)' },
    ];

    const statusEl = document.getElementById('weather-status');
    const iconEl = document.querySelector('.weather-icon');

    const updateWeather = () => {
        const w = weathers[Math.floor(Math.random() * weathers.length)];
        if (statusEl) statusEl.innerText = w.text;
        if (iconEl) iconEl.textContent = w.icon;
    };

    updateWeather();
    setInterval(updateWeather, 28000);
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM CURSOR con trail de partículas
// ─────────────────────────────────────────────────────────────────────────────
function initCustomCursor() {
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let raf;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        spawnCursorParticle(e.clientX, e.clientY);
    }, { passive: true });

    // Smooth cursor follow
    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        cursor.style.left = cursorX - 6 + 'px';
        cursor.style.top = cursorY - 6 + 'px';
        raf = requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Cursor hover effect en elementos interactivos
    const interactables = 'a, button, .cta-button, .lore-card, .boss-card, .forge-btn, .secret-rune, .nav-link, .close-modal';
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(interactables)) {
            cursor.classList.add('cursor-hover');
        }
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactables)) {
            cursor.classList.remove('cursor-hover');
        }
    });

    // Ocultar cursor nativo solo si el dispositivo tiene mouse
    const mq = window.matchMedia('(pointer: fine)');
    if (!mq.matches) {
        cursor.style.display = 'none';
        document.documentElement.style.cursor = 'auto';
    }
}

function spawnCursorParticle(x, y) {
    if (Math.random() > 0.35) return; // Limitar cantidad
    const particle = document.createElement('div');
    particle.className = 'cursor-particle';
    const size = Math.random() * 4 + 1;
    particle.style.cssText = `
        width:${size}px;
        height:${size}px;
        left:${x - size/2}px;
        top:${y - size/2}px;
        opacity:${Math.random() * 0.5 + 0.2};
    `;
    document.body.appendChild(particle);

    let opacity = parseFloat(particle.style.opacity);
    const fade = setInterval(() => {
        opacity -= 0.04;
        particle.style.opacity = opacity;
        if (opacity <= 0) {
            clearInterval(fade);
            if (particle.parentNode) particle.remove();
        }
    }, 30);
}
