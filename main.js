/*
    World OF Wanos — Logic & Interactivity v2.0
    Protocolo: DarckRovert Technical
    Correcciones: cursor, initCustomCursor, countdown-title, quote interval,
                  modal accesible, nav activa, scroll progress, boss modal, forge extendido
*/

'use strict';

let isFrenzy = false;
let quoteIntervalId = null;

// Persistencia de la Fase de Frenesí
try {
    if (localStorage.getItem('wanos_frenzy') === 'true') {
        isFrenzy = true;
        document.addEventListener('DOMContentLoaded', () => {
            document.body.classList.add('frenzy-mode');
        });
    }
} catch (e) {}

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initCustomCursor();
    initCountdown();
    initScrollAnimations();
    initRandomQuotes();
    initWeather();
    initAchievements();
    initSecretLore();
    initNavigation();
    initScrollProgress();
    initBossCards();
    initForgeButtons();
    initMobileNav();
    updateTwitchParent();
    initDiscordLive();
    initRecruitModal();
    switchCapRole('melee');

    // Preseleccionar Guerrero como estado inicial en la forja de guías
    if (typeof window.showTip === 'function') {
        window.showTip('WARRIOR');
    }

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
        iframe.src = `https://player.twitch.tv/?channel=tilteadosanonimostv&parent=${encodeURIComponent(hostname)}&muted=true`;
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
                const overlay = document.getElementById('mobile-nav-overlay');
                if (overlay) overlay.classList.remove('open');
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

    try {
        localStorage.setItem('wanos_frenzy', isFrenzy);
    } catch (e) {}

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
        'wisdom': { icon: '📖', title: 'Guías Activadas', sub: 'Las guías del Panteón están a tu disposición.' },
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
// PARTICLES SYSTEM (Aurora, Mist & Smooth Mouse Canvas Trail a 60 FPS)
// ─────────────────────────────────────────────────────────────────────────────
function initParticles() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseParticles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    // Estela reactiva del cursor dentro del canvas (Cero sobrecarga de DOM)
    window.addEventListener('mousemove', (e) => {
        const count = isFrenzy ? 3 : 2;
        for (let i = 0; i < count; i++) {
            mouseParticles.push({
                x: e.clientX + (Math.random() - 0.5) * 6,
                y: e.clientY + (Math.random() - 0.5) * 6,
                vx: (Math.random() - 0.5) * (isFrenzy ? 2.4 : 1.2),
                vy: (Math.random() - (isFrenzy ? 1.4 : 0.6)) * 1.5,
                size: Math.random() * (isFrenzy ? 3.5 : 2.5) + 1,
                life: 1,
                decay: Math.random() * 0.035 + 0.02,
                hue: isFrenzy ? (Math.random() > 0.4 ? 5 : 42) : (Math.random() > 0.5 ? 198 : 185)
            });
        }
        if (mouseParticles.length > 90) mouseParticles.splice(0, 20);
    }, { passive: true });

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
        
        // Dibujar partículas de fondo
        particles.forEach(p => { p.update(); p.draw(); });

        // Dibujar partículas del cursor en el canvas
        for (let i = mouseParticles.length - 1; i >= 0; i--) {
            const mp = mouseParticles[i];
            mp.x += mp.vx;
            mp.y += mp.vy;
            mp.life -= mp.decay;
            if (mp.life <= 0) {
                mouseParticles.splice(i, 1);
                continue;
            }
            ctx.save();
            ctx.fillStyle = `hsla(${mp.hue}, 95%, ${isFrenzy ? '65%' : '75%'}, ${mp.life * 0.85})`;
            ctx.shadowBlur = isFrenzy ? 14 : 8;
            ctx.shadowColor = `hsla(${mp.hue}, 100%, 65%, 0.5)`;
            ctx.beginPath();
            ctx.arc(mp.x, mp.y, mp.size * mp.life, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        requestAnimationFrame(animate);
    }

    animate();
}

// ─────────────────────────────────────────────────────────────────────────────
// COUNTDOWN - próximo evento día 28 a las 20:00 hs
// ─────────────────────────────────────────────────────────────────────────────
function initCountdown() {
    function getRaidTarget() {
        const now = new Date();
        let raidStart = new Date(now.getFullYear(), now.getMonth(), 28, 20, 0, 0, 0);
        // Ventana de raid en curso: día 28 entre 20:00 y 23:59
        const raidEnd = new Date(now.getFullYear(), now.getMonth(), 28, 23, 59, 59, 999);

        if (now >= raidStart && now <= raidEnd) {
            return { status: 'active', target: raidEnd };
        }
        if (now > raidEnd) {
            raidStart = new Date(now.getFullYear(), now.getMonth() + 1, 28, 20, 0, 0, 0);
        }
        return { status: 'upcoming', target: raidStart };
    }

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
        const { status, target } = getRaidTarget();
        const distance = target.getTime() - now;

        if (status === 'active') {
            if (titleEl) titleEl.innerText = '🔥 ¡INCURSIÓN EN CURSO! LA PLAGA CAE ANTE EL PODER DE WANOS. 🔥';
            tick(daysEl, 0); tick(hoursEl, 0); tick(minsEl, 0); tick(secsEl, 0);
            return;
        }

        if (distance <= 0) {
            if (titleEl) titleEl.innerText = '🔥 LA CACERÍA HA COMENZADO. FORMACIÓN INMEDIATA. 🔥';
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
            title: 'Crónicas del Dios Antiguo',
            subtitle: 'Bhalanar — Vigilante Cósmico y Dios Antiguo',
            avatar: 'assets/images/bhalanar.png',
            text: `
                <p style="line-height:2; font-style:italic; font-size:1.05rem; color:#ddd; margin-bottom:20px;">
                    "Bhalanar no es un simple mortal; es el orden primordial. Habiendo forjado el Universo Wanos, ahora vigila desde el reposo eterno de los Dioses Antiguos."
                </p>
                <p style="color:var(--text-muted); margin-bottom:15px;">
                    Antiguo guardián de las Salas de la Creación, Bhalanar presenció la caída de los Titanes y eligió preservar lo que quedaba de la orden cósmica. Su lema es implacable:
                </p>
                <p style="color:var(--secondary-gold); font-family:var(--font-titles); letter-spacing:2px; font-size:0.9rem;">
                    "Aquí, el GS no compra el respeto; el alma lo forja."
                </p>
            `,
            tags: ['Dios Antiguo', 'Vigilante Supremo', 'Fundador', 'Ulduar']
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
            title: 'Dios Antiguo Primordial',
            subtitle: 'Bhalanar / Makumbaman (En el Sueño Cósmico)',
            avatar: 'assets/images/bhalanar.png',
            text: `
                <p style="line-height:2; font-style:italic; font-size:1.05rem; color:#ddd; margin-bottom:20px;">
                    "El líder y arquitecto que concibió el Universo Wanos. Aunque ya no empuña el acero en Rasganorte, su voluntad cósmica rige la eternidad del Panteón."
                </p>
                <p style="color:var(--text-muted); margin-bottom:15px;">
                    Habiendo fundado las leyes del Panteón y establecido el orden en Dalaran, Bhalanar ascendió al reposo de los Dioses Antiguos. Su doctrina inmutable sostiene que el honor, el compromiso y el alma colectiva prevalecen eternamente sobre la vanidad del GearScore.
                </p>
                <p style="color:var(--secondary-gold); font-family:var(--font-titles); letter-spacing:2px; font-size:0.9rem;">
                    "En el tablero cósmico del Panteón, mi legado sigue forjando las victorias que ustedes llaman destino."
                </p>
            `,
            tags: ['Dios Antiguo', 'Creador de Wanos', 'Vigilante Eterno', 'Paladín / Brujo']
        },
        'card-morgoroth': {
            title: 'Dios Avalado por los GMs',
            subtitle: 'Morgorotth / Morgott (Brujo / DK)',
            avatar: 'assets/images/morgoroth.png',
            text: `
                <p style="line-height:2; font-style:italic; font-size:1.05rem; color:#ddd; margin-bottom:20px;">
                    "El poder en las sombras, también conocido como el Cristo Jehová impulsador de esta comunidad."
                </p>
                <p style="color:var(--text-muted); margin-bottom:15px;">
                    Morgorotth infunde el respeto teológico en Wanos. Dios de todo ser en Azeroth por aval de las altas entidades (GMs). Es la deidad oscura de la que brota y converge toda la energía caótica para Tilteados Anónimos.
                </p>
                <p style="color:var(--accent-red); font-family:var(--font-titles); letter-spacing:2px; font-size:0.9rem;">
                    "Mi existencia es prueba de que incluso la divinidad puede titubear."
                </p>
            `,
            tags: ['Cristo Jehová de Wanos', 'Motor Principal', 'Brujo', 'DK']
        },
        'card-franfranco': {
            title: 'Financista Eterno',
            subtitle: 'FranFranco (Cazador Elfo Oscuro)',
            avatar: 'assets/images/franfranco.png',
            text: `
                <p style="line-height:2; font-style:italic; font-size:1.05rem; color:#ddd; margin-bottom:20px;">
                    "El dueño de la mitad de Dalaran."
                </p>
                <p style="color:var(--text-muted); margin-bottom:15px;">
                    FranFranco no solo dispara las fechas directas al pecho del Rey Exánime, también asegura la prosperidad y el banco de la hermandad. Las leyendas dicen que los subastadores de Rasganorte rinden pleitesía antes de hablarle. Un Elfo Oscuro cuyas flechas y oro dictan el equilibrio.
                </p>
            `,
            tags: ['Mecenas', 'Cazador', 'As de la Subasta']
        },
        'card-kat': {
            title: 'Dios Antiguo de la Disciplina',
            subtitle: 'Katsurosekai / Kat (Ascendido a la Leyenda)',
            avatar: 'assets/images/kat.png',
            text: `
                <p style="line-height:2; font-style:italic; font-size:1.05rem; color:#ddd; margin-bottom:20px;">
                    "Si no me escuchabas quejarme, significa que el raid iba peligrosamente perfecto. Mis rezongos forjaron la supervivencia de Wanos."
                </p>
                <p style="color:var(--text-muted); margin-bottom:15px;">
                    Ahora venerado como Dios Antiguo de la Táctica, Kat ya no está activo en las incursiones cotidianas, pero su disciplina militar, sus addons recomendados y su intolerancia al error siguen evitando que el Panteón cometa fallos en el camino a ICC 25 Heroico.
                </p>
                <p style="color:var(--accent-red); font-family:var(--font-titles); letter-spacing:2px; font-size:0.9rem;">
                    "El filo de la disciplina no muere con el retiro; vigilo cada movimiento del raid desde las sombras."
                </p>
            `,
            tags: ['Dios Antiguo', 'Disciplina Ancestral', 'Padre Táctico', 'Leyenda de ICC']
        },
        'card-nunurut': {
            title: 'El Ser de Luz',
            subtitle: 'Nunurut (20 PJs)',
            avatar: 'assets/images/nunurut.png',
            text: `
                <p style="line-height:2; font-style:italic; font-size:1.05rem; color:#ddd; margin-bottom:20px;">
                    "Yo no tengo un alter; yo soy la legión."
                </p>
                <p style="color:var(--text-muted); margin-bottom:15px;">
                    Dotado con todas las profesiones de Azeroth y un ejército de 20 personajes. Nunurut mantiene viva la economía, el abastecimiento y el equilibrio mental del grupo con su actitud de ser de luz frente a la hostilidad térmica de ICC.
                </p>
            `,
            tags: ['Ser de Luz', 'Polifacético', 'Maestro de Oficios']
        },
        'card-sunreal': {
            title: 'Namor, El Niño Sin Amor',
            subtitle: 'Sunreal / Yatala — El Solitario Incomprendido',
            avatar: 'assets/images/sunreal.png',
            text: `
                <p style="line-height:1.8; font-style:italic; font-size:1.05rem; color:#ddd; margin-bottom:18px; text-align:center; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px;">
                    "Encuentro más calor en el aliento de Sindragosa que en el corazón de mi Sanador."
                </p>
                <div style="background:rgba(255,255,255,0.03); border-left:3px solid var(--accent-void); padding:12px 16px; margin-bottom:14px; border-radius:4px;">
                    <b style="color:var(--secondary-gold); font-size:0.95rem;">📖 Capítulo I: El Origen del Desamor</b>
                    <p style="color:var(--text-muted); font-size:0.88rem; margin-top:6px; line-height:1.6;">
                        Nacido en los rincones más fríos de Dalaran, Namor (Sunreal / Yatala) juró fidelidad a World OF Wanos con la ingenua ilusión de recibir cariño. Pronto descubrió la cruda realidad de Rasganorte: en esta hermandad el amor no existe; solo existen los 540 de defensa de Morgoroth, el filo implacable del DKP y gritos de disciplina a 120 decibelios por Discord.
                    </p>
                </div>
                <div style="background:rgba(255,255,255,0.03); border-left:3px solid var(--accent-glacial); padding:12px 16px; margin-bottom:14px; border-radius:4px;">
                    <b style="color:var(--secondary-gold); font-size:0.95rem;">💔 Capítulo II: La Conspiración de los Sanadores</b>
                    <p style="color:var(--text-muted); font-size:0.88rem; margin-top:6px; line-height:1.6;">
                        Cuenta la leyenda que Namor se para deliberadamente en las llamas de Tuétano y en los charcos de baba de Panzachancro pensando que son «fuentes termales de afecto». Cuando clama desesperado por Discord: <i>«¡Cúrenme por favor, me desangro!»</i>, los Sacerdotes fingen caída súbita de FPS, los Paladines le tiran Mano de Protección para cancelarle el casteo, y los Druidas le lanzan Rejuvenecimiento cuando su fantasma ya va corriendo desde el cementerio.
                    </p>
                </div>
                <div style="background:rgba(255,255,255,0.03); border-left:3px solid var(--accent-red); padding:12px 16px; margin-bottom:14px; border-radius:4px;">
                    <b style="color:var(--secondary-gold); font-size:0.95rem;">🎲 Capítulo III: La Maldición del Loot (Récord Mundial de 1 en Dados)</b>
                    <p style="color:var(--text-muted); font-size:0.88rem; margin-top:6px; line-height:1.6;">
                        Posee el récord Guinness de tirar 1 en dados por cualquier pieza BiS. Se rumorea que una vez sacó 99 en un abalorio heroico, pero el servidor de UltimoWoW sufrió un rollback cuántico de 3 minutos solo para anular su felicidad. El oficial de botín sentenció: <i>«El loot es para quienes esquivan el Profanar, Namor, no para quienes se acuestan en él a tomar el sol.»</i>
                    </p>
                </div>
                <div style="background:rgba(255,255,255,0.03); border-left:3px solid var(--secondary-gold); padding:12px 16px; margin-bottom:14px; border-radius:4px;">
                    <b style="color:var(--secondary-gold); font-size:0.95rem;">⚔ Capítulo IV: El Mártir Involuntario de Arthas 25N</b>
                    <p style="color:var(--text-muted); font-size:0.88rem; margin-top:6px; line-height:1.6;">
                        Durante la histórica caída del Rey Exánime en 25N, Namor fue el primero en caer al vacío en Fase 1 buscando a un compañero que le diera buff de Intelecto. Su caída fue cósmica: Arthas se quedó tan desconcertado mirándolo caer que descuidó su rotación, permitiendo que el Panteón rematara el 10% final. Nadie le dio las gracias, pero le descontaron 50g del festín de pescado.
                    </p>
                </div>
                <p style="color:var(--secondary-gold); font-family:var(--font-titles); letter-spacing:1px; font-size:0.88rem; text-align:center; margin-top:12px;">
                    ⚡ Veredicto Cósmico: "0% Afecto Recibido, 100% de Daño Evitable Absorbido. Sin Namor para comerse los wipes, la hermandad no existiría."
                </p>
            `,
            tags: ['0% Afecto Recibido', '1 en Dados', 'Absorbedor de Mecánicas', 'Mártir Incomprendido', 'El Niño Sin Amor']
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
        'boss-icc25h': {
            title: 'Rey Exánime (25 Heroico) — La Cima de Rasganorte',
            body: 'El desafío definitivo del parche 3.3.5a en UltimoWoW. Tras purificar el encuentro en 25 Normal, el Panteón de Wanos concentra todo su poder bélico para conquistar la versión Heroica. Sin margen de fallo en Profanar, infestares mitigados al milisegundo y foco absoluto en las Val\'kyrs. Aquí se forja la inmortalidad.'
        },
        'boss-arthas': {
            title: 'El Rey Exánime (25 Normal) — Conquistado por World OF Wanos',
            body: '¡Victoria épica del Panteón! El tirano de la Plaga dobló la rodilla en el Trono Helado en raid de 25 jugadores bajo la coordinación estratégica de Bhalanar y la fuerza oscura de Morgoroth. Un hito que consolidó a la hermandad como una fuerza dominante en Rasganorte.'
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
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('open')) closeBossModal();
    });
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
        '¡EL REY EXÁNIME HA CAÍDO EN 25 NORMAL! El Trono Helado conoció el acero de Wanos.',
        'Próximo objetivo inmutable: ICC 25 HEROICO. La gloria definitiva nos aguarda.',
        'Bhalanar observa la urdimbre... su mirada purifica el espíritu del recluta.',
        'Morgoroth dicta: La toxicidad es la plaga que consumiremos con fuego glacial.',
        'En el Universo Wanos, el honor se forja en el servicio mutuo, no en el GS.',
        '¿Has sintonizado tu alma con el Discord del Panteón hoy?',
        'Morgoroth dice: El GS es vanidad; la ejecución impecable en 25H es la verdadera gloria.',
        'Namor busca el amor en el vacío del olvido. El Panteón busca la victoria en Heroico.',
        'Namor por Discord: "¿Alguien me da buff de reyes o al menos un buenas noches?" — Visto a las 22:00.',
        'Regla cósmica de Wanos: Si no sabes dónde pararte en el boss, busca a Namor y párate al lado contrario.',
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
        tip: 'El escudo es tu fe; la defensa tu dogma. En Furia, el DPS supera la cordura, perfecto para la Fase de Frenesí.',
        stat: 'Defensa: 540 | ArP: Para Furia | Stam: Prioridad máxima en tank',
        guides: [
            { boss: 'Lord Tuétano', strat: 'TANK: Evita el fuego de llamas frías. FURIA: Guarda CD para fase de torbellino.' },
            { boss: 'Profesor Putricidio', strat: 'TANK/DPS: Alto movimiento. Ayuda a tauntear el moco verde o rojo velozmente.' },
            { boss: 'Rey Exánime', strat: 'TANK: Posiciona de espaldas al vacío. FURIA: Guarda Rajar y Torbellino para aniquilar Val\'kyrs inmediatamente.' }
        ]
    },
    PALADIN: {
        speaker: 'Bhalanar',
        tip: 'La Luz es herramienta del Orden. En Sagrado, la cadena de curación es la vida misma del Panteón. Tu pompa salva raids.',
        stat: 'SP: Máximo | Haste: Hasta cap | Int > Mp5 en fase avanzada',
        guides: [
            { boss: 'Reina de Sangre Lana\'thel', strat: 'HEAL: Pre-castea Luz Sagrada en los momentos de remolino de sangre. TANK: Pulea rápido al espejo.' },
            { boss: 'Sindragosa', strat: 'TANK: Resistencia a la escarcha obligatoria fase 3. HEAL: Cuidado con el debuff de magia desatada.' },
            { boss: 'Rey Exánime', strat: 'TANK: Absorción de Infestar total. Usa Sacrificio en la recolección de almas de Fase 3.' }
        ]
    },
    DK: {
        speaker: 'Morgoroth',
        tip: 'El Profano es caos controlado. El Sangre (Protección) es el tanque inamovible frente al Rey.',
        stat: 'ArP: 100% físico | Hit: 8% | Expertise: 26 | Stam: 30k+ en tank',
        guides: [
            { boss: 'Reina de Sangre', strat: 'DPS: Tu escudo antimagia ignora el daño del pacto oscuro. TANK: CD de supervivencia para el pacto.' },
            { boss: 'Sindragosa', strat: 'DPS/TANK: Caparazón Antimágico es tu mejor amigo para limpiar marcas de escarcha o mitigar daño pasivo.' },
            { boss: 'Rey Exánime', strat: 'TANK: Mitiga segar alma con Golpe Letal + Vampírica. DPS: Grip (Atracción) a los horrores y Muerte y Descomposición a las Val\'kyrs.' }
        ]
    },
    WARLOCK: {
        speaker: 'Morgoroth',
        tip: 'El daño por tiempo es la primera mordida del Ejecutor. Tu utilidad con las piedras de salud salva vidas.',
        stat: 'SP: Máximo | Hit: 17% | Haste: Beneficia DoTs | Demo ofrece Replenishment',
        guides: [
            { boss: 'Príncipes de Sangre', strat: 'DPS/TANK: Aflicción puede ser clave para el dps sostenido. Teleport (Círculo) para evitar el vórtice.' },
            { boss: 'Profesor Putricidio', strat: 'Círculo de teletransporte esquiva de los charcos. Mantén DoTs full en mocos rojo y verde.' },
            { boss: 'Rey Exánime', strat: 'Maldición de los Elementos permanente. DoTs en todas las Val\'kyrs. Círculo para defile rápido.' }
        ]
    },
    MAGE: {
        speaker: 'Bhalanar',
        tip: 'Mago Fuego es el caos controlado de Morgoroth, rey definitivo del DPS sostenido en T10 / ICC 25HC.',
        stat: 'SP: Máximo | Hit: 17% | Haste: Cap (1.51s Frostbolt) | Crit: Para Fuego',
        guides: [
            { boss: 'Libramorte Colmillosauro', strat: 'Usa Bloque de Hielo para quitarte la marca del campeón caído si el líder lo permite (o Blink táctico).' },
            { boss: 'Sindragosa', strat: 'Magia Desatada te duele más que a nadie. Controla tus stacks de Fuego o explotarás al raid entero.' },
            { boss: 'Rey Exánime', strat: 'Salto de Traslación (Blink) al segundo uno de Defile (Profanar). Maximiza Lluvia de Meteoritos en Val\'kyr.' }
        ]
    },
    SHAMAN: {
        speaker: 'Bhalanar',
        tip: 'Restauración sostiene al Panteón, sus escudos y cadenas de sanación levantan raids perdidos. Ansia de sangre decide el final.',
        stat: 'Resto: SP + Haste + Mp5 | Mejora: ArP > AP > Haste | Crit para Flurry',
        guides: [
            { boss: 'Tuétano', strat: 'HEAL: Mantén Escudo de Tierra en el tank que no tenga marca. Cadenas constantes durante Torbellino.' },
            { boss: 'Reina de Sangre', strat: 'Tótem de Tremor para los miedos masivos (vital). Sanción en cadena a las víctimas de pacto.' },
            { boss: 'Rey Exánime', strat: 'Ansia de Sangre al iniciar Fase 2 o Fase 3 según lo mande el Líder. Cadena de curación al máximo en infestaciones.' }
        ]
    },
    DRUID: {
        speaker: 'Bhalanar',
        tip: 'El Druida es el corazón del Panteón. Restauración provee HoTs indiscutibles, y el Equilibrio/Feral adapta el grupo.',
        stat: 'Resto: Haste > SP > Crit | Balance: Hit 17% > Haste > SP',
        guides: [
            { boss: 'Profesor Putricidio', strat: 'HEAL: Rejuvenecimiento en todos durante la plaga. DPS: Usa Ciclón veloz si algún DPS es controlado (si aplica).' },
            { boss: 'Sindragosa', strat: 'Feral puede tanquear Sindragosa eficientemente. Forma de oso da Supervivencia pasiva inigualable.' },
            { boss: 'Rey Exánime', strat: 'Renacer de Combate pre-planeado y tranquilidad bajo Profanar urgente. Raíces para las Val\'kyr si caen fuera de alcance.' }
        ]
    },
    HUNTER: {
        speaker: 'Morgoroth',
        tip: 'La flecha no falla. Puntería domina. Usa Redirección religiosamente; el TANK no tiene paciencia para puleos malos.',
        stat: 'ArP: 100% para Puntería | Hit: 8% | Crit: Importante | Haste: Opcional',
        guides: [
            { boss: 'Libramorte Colmillosauro', strat: 'Trampas de escarcha y ralentización a las bestias de sangre (Vital para ICC 25HC).' },
            { boss: 'Profesor Putricidio', strat: 'Fingir Muerte para resetear aggro o desviar habilidades selectas. Deterrence para charcos.' },
            { boss: 'Rey Exánime', strat: 'Trampa de hielo lista para la primera Val\'kyr. Disparo supresor y desvío para espíritus viles en Fase 3.' }
        ]
    },
    ROGUE: {
        speaker: 'Morgoroth',
        tip: 'El Pícaro es el asesino invisible del Panteón. Tu daño sostenido y utilidad con Secretos del Oficio son vitales.',
        stat: 'ArP: 100% para Combate | Hit: 8% (magias 17%) | Expertise: 26',
        guides: [
            { boss: 'Libramorte Colmillosauro', strat: 'Evasión al llamar bestias. Mantén tu ciclo de daño sin interrupciones.' },
            { boss: 'Profesor Putricidio', strat: 'Capa de las Sombras para limpiar plagas o evitar daño masivo.' },
            { boss: 'Rey Exánime', strat: 'Secretos del Oficio al tanque al inicio y siempre a cooldown para maximizar amenaza. Desactivar trampas donde sea necesario.' }
        ]
    },
    PRIEST: {
        speaker: 'Bhalanar',
        tip: 'El Sacerdote Disciplina previene la tragedia antes de que ocurra. El Sombras funde la mente de sus enemigos.',
        stat: 'Disc: SP + Crit | Sombras: Hit 17% > Haste > SP',
        guides: [
            { boss: 'Reina de Sangre', strat: 'HEAL: Escudo de Palabra de Poder en todo el raid antes del pacto y volar.' },
            { boss: 'Príncipes de Sangre', strat: 'DPS/HEAL: Disipar Magia rápido. Sombras: Dispersión para absorber daño letal o recuperar maná.' },
            { boss: 'Rey Exánime', strat: 'HEAL: Mantener Palabra de Poder: Escudo en todos los objetivos posibles para mitigar Infestar (vital).' }
        ]
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

    // Mapeo de guides a HTML
    const guidesHtml = data.guides.map(g => `
        <div style="background:rgba(20,20,30,0.6); padding:10px 14px; margin-bottom:8px; border-left:3px solid var(--secondary-gold); border-radius:3px;">
            <b style="color:var(--secondary-gold); display:block; font-size:0.8rem; margin-bottom:4px; font-family:var(--font-titles); letter-spacing:1px;">🔰 ${g.boss}</b>
            <span style="font-size:0.82rem; color:#bbb; line-height:1.4; display:block;">${g.strat}</span>
        </div>
    `).join('');

    const forumLinks = {
        WARLOCK: 'https://foro.ultimowow.com/forum/173-brujo/',
        DK: 'https://foro.ultimowow.com/forum/174-caballero-de-la-muerte/',
        HUNTER: 'https://foro.ultimowow.com/forum/175-cazador/',
        SHAMAN: 'https://foro.ultimowow.com/forum/176-cham%C3%A1n/',
        DRUID: 'https://foro.ultimowow.com/forum/177-druida/',
        WARRIOR: 'https://foro.ultimowow.com/forum/178-guerrero/',
        MAGE: 'https://foro.ultimowow.com/forum/179-mago/',
        PALADIN: 'https://foro.ultimowow.com/forum/180-palad%C3%ADn/',
        ROGUE: 'https://foro.ultimowow.com/forum/181-p%C3%ADcaro/',
        PRIEST: 'https://foro.ultimowow.com/forum/182-sacerdote/'
    };
    const forumLink = forumLinks[className] || 'https://foro.ultimowow.com/forum/115-gu%C3%ADas/';

    tipElement.style.display = 'block';
    tipElement.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;padding-bottom:15px;border-bottom:1px solid var(--border-neon);">
            <span style="font-size:1.8rem">${getClassIcon(className)}</span>
            <div>
                <p class="gold-text" style="font-family:var(--font-titles);font-size:0.8rem;letter-spacing:2px;margin-bottom:3px;">Sentencia de ${data.speaker}</p>
                <span style="font-size:0.7rem;color:var(--text-dim);font-family:var(--font-titles);letter-spacing:1px;text-transform:uppercase;">${className}</span>
            </div>
        </div>
        
        <p style="color:var(--text-main);margin-bottom:20px;line-height:1.6;font-size:0.92rem;">${data.tip}</p>
        
        <div style="background:var(--bg-mid);border:1px solid var(--border-neon);padding:10px 15px;border-radius:2px;font-family:var(--font-titles);font-size:0.68rem;letter-spacing:1.5px;color:var(--primary-glacial);margin-bottom:20px;">
            📊 ${data.stat}
        </div>

        <div style="margin-bottom: 24px;">
            <p class="glacial-text" style="font-family:var(--font-titles); font-size:0.85rem; letter-spacing:1px; margin-bottom:12px;">⚔ MANUALES DETALLADOS Y ESTRATEGIA (ICC)</p>
            ${guidesHtml}
        </div>

        <a href="https://discord.com/channels/1461511689206890539/1480973134772572210" target="_blank" class="cta-button secondary" style="width:100%; text-align:center; padding:12px; font-size:0.85rem; margin-bottom: 10px;">
            🔍 VER GUÍAS COMPLETAS EN DISCORD
        </a>
        <a href="${forumLink}" target="_blank" class="cta-button secondary" style="width:100%; text-align:center; padding:12px; font-size:0.85rem; border-color: var(--secondary-gold); color: var(--secondary-gold);">
            📖 GUÍA ESPECÍFICA DE CLASE
        </a>
    `;
};

function getClassIcon(className) {
    const icons = { WARRIOR:'⚔', PALADIN:'✨', DK:'❄', WARLOCK:'🔮', MAGE:'🔥', SHAMAN:'🌊', DRUID:'🍃', HUNTER:'🏹', ROGUE:'🗡', PRIEST:'⚕' };
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
// DISCORD LIVE COUNTER WIDGET
// ─────────────────────────────────────────────────────────────────────────────
function initDiscordLive() {
    const countEl = document.getElementById('nav-discord-count');
    if (!countEl) return;

    fetch('https://discord.com/api/guilds/1461511689206890539/widget.json')
        .then(res => res.json())
        .then(data => {
            if (data && data.presence_count) {
                countEl.textContent = `(${data.presence_count} ONLINE)`;
            }
        })
        .catch(() => {
            // Widget no habilitado o CORS; fallback silencioso elegante
            countEl.textContent = '(ACTIVO)';
        });
}

// ─────────────────────────────────────────────────────────────────────────────
// RECRUITMENT MODAL & DISCORD WEBHOOK / DISPATCH
// ─────────────────────────────────────────────────────────────────────────────
window.openRecruitModal = function() {
    const modal = document.getElementById('recruit-modal');
    if (modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
};

window.closeRecruitModal = function() {
    const modal = document.getElementById('recruit-modal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
};

function initRecruitModal() {
    const modal = document.getElementById('recruit-modal');
    const selector = document.getElementById('rec-class-selector');
    const classInput = document.getElementById('rec-class');

    if (selector && classInput) {
        selector.querySelectorAll('.class-select-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                selector.querySelectorAll('.class-select-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                classInput.value = btn.getAttribute('data-class');
            });
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeRecruitModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('open')) closeRecruitModal();
        });
    }
}

window.submitRecruitment = function(e) {
    e.preventDefault();
    const nick = document.getElementById('rec-nick').value.trim();
    const gs = document.getElementById('rec-gs').value.trim();
    const cls = document.getElementById('rec-class').value;
    const spec = document.getElementById('rec-spec').value.trim();
    const disc = document.getElementById('rec-discord').value.trim();
    const exp = document.getElementById('rec-exp').value.trim();

    const textToCopy = `**⚔️ NUEVA POSTULACIÓN AL PANTEÓN — WORLD OF WANOS (ICC 25H) ⚔️**
• **Nick:** ${nick}
• **Clase:** ${cls}
• **Especialización:** ${spec}
• **GearScore:** ${gs}
• **Discord:** ${disc}
• **Experiencia / Notas:** ${exp}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).catch(() => {});
    }

    const dispatchBox = document.getElementById('recruit-dispatch-box');
    if (dispatchBox) {
        dispatchBox.classList.add('visible');
    }

    spawnAchievement('📜', 'Postulación Generada', 'Pega tu ficha en el canal #reclutamiento de Discord.');
};

// ─────────────────────────────────────────────────────────────────────────────
// WOTLK RAID CAPS CALCULATOR (ICC 10/25)
// ─────────────────────────────────────────────────────────────────────────────
const capsData = {
    melee: [
        { title: 'Índice de Golpe (Hit Rating)', val: '8% (263 rating)', desc: 'Garantiza que ningún golpe especial o habilidad física falle contra jefes de raid (Nivel 83 / Calavera).', crit: true },
        { title: 'Pericia (Expertise)', val: '26 / 26 (214 rating)', desc: 'Soft cap obligatorio para golpear por la espalda sin que el jefe esquive tus ataques.', crit: true },
        { title: 'Penetración de Armadura (ArP)', val: '1400 (100% Hard Cap)', desc: 'Cap supremo para Guerrero Furia, Pícaro Combate, DK Sangre y Cazador Puntería.', crit: false, glacial: true },
        { title: 'Crítico en Raid (Melee)', val: 'Cap suave ~76%', desc: 'Varía según clase teniendo en cuenta la tabla de golpes (Glancing Blows 24%).', crit: false }
    ],
    caster: [
        { title: 'Índice de Golpe Hechizos', val: '17% (446 rating)', desc: 'Con Spriest (Miseria) o Pollo (Fuego Feérico) en raid, el cap real baja a 14% (368 rating). En Alianza con Draenei baja a 13%.', crit: true },
        { title: 'Celeridad Hechizos (Haste)', val: '1269 rating (Soft Cap)', desc: 'Reduce el GCD (Global Cooldown) a 1 segundo exacto sin necesidad de Ansia de Sangre.', crit: false, glacial: true },
        { title: 'Poder con Hechizos (SP)', val: 'Sin límite (Máximo posible)', desc: 'Escalado lineal continuo prioritario tras haber alcanzado el cap de golpe.', crit: false },
        { title: 'Golpe Crítico Caster', val: 'Cap suave dinámico', desc: 'Prioridad secundaria tras Hit y Haste para Magos Fuego y Brujos.', crit: false }
    ],
    tank: [
        { title: 'Defensa Anti-Crítico', val: '540 Defensa (689 rating)', desc: 'OBLIGATORIO: Otorga inmunidad total a golpes críticos de jefes nivel 83 en ICC 10 y 25.', crit: true },
        { title: 'Aguante / Vida Efectiva (EHP)', val: 'Prioridad Absoluta', desc: 'Vital para sobrevivir a Segador de Almas del Rey Exánime e impactos masivos.', crit: true },
        { title: 'Pericia Tanque', val: '26 Soft / 56 Hard', desc: '26 evita esquivas del boss; 56 elimina paradas y previene Parry-Haste letal.', crit: false, glacial: true },
        { title: 'Índice de Golpe Tanque', val: '8% (263 rating)', desc: 'Previene fallos en Taunts (Provocar) y habilidades generadoras de amenaza masiva.', crit: false }
    ],
    healer: [
        { title: 'Celeridad Sanación', val: 'Soft Cap según Clase', desc: 'Paladín: ~676 haste con Sello de Sabiduría. Chamán: ~1260 haste para Ola de Sanación.', crit: false, glacial: true },
        { title: 'Regeneración Maná (Mp5 / Spi)', val: 'Sostenibilidad > 300', desc: 'Vital para encuentros de largo desgaste como Sindragosa y Rey Exánime.', crit: true },
        { title: 'Poder con Hechizos Healer', val: 'Máximo posible', desc: 'Aumenta el rendimiento por sanación directa y mitigación de escudos (Disci).', crit: false },
        { title: 'Crítico Sanación', val: 'Prioritario en Paladín/Chamán', desc: 'Activa Iluminación (reembolso de maná) y Sanación Ancestral.', crit: false }
    ]
};

window.switchCapRole = function(role) {
    const container = document.getElementById('caps-content-box');
    if (!container) return;

    // Actualizar botones de tabs
    document.querySelectorAll('.caps-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        const oc = btn.getAttribute('onclick') || '';
        if (oc.includes(role)) {
            btn.classList.add('active');
        }
    });

    const metrics = capsData[role] || capsData.melee;
    container.innerHTML = metrics.map(m => `
        <div class="cap-metric-card ${m.crit ? 'critical' : (m.glacial ? 'glacial' : '')}">
            <div class="cap-metric-title">${m.title}</div>
            <div class="cap-metric-value">${m.val}</div>
            <p class="cap-metric-desc">${m.desc}</p>
        </div>
    `).join('');
};

// ─────────────────────────────────────────────────────────────────────────────
// REAL-TIME ADDONS SEARCH FILTER
// ─────────────────────────────────────────────────────────────────────────────
window.filterAddons = function() {
    const input = document.getElementById('addon-filter');
    const grid = document.getElementById('addons-grid');
    if (!input || !grid) return;

    const query = input.value.toLowerCase().trim();
    const cards = grid.querySelectorAll('.market-card');
    const noMsg = document.getElementById('no-addons-msg');
    let matches = 0;

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (!query || text.includes(query)) {
            card.style.display = '';
            matches++;
        } else {
            card.style.display = 'none';
        }
    });

    if (noMsg) {
        noMsg.style.display = (matches === 0) ? 'block' : 'none';
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM CURSOR & HOVER REACTION
// ─────────────────────────────────────────────────────────────────────────────
function initCustomCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;

    let isVisible = false;

    window.addEventListener('mousemove', (e) => {
        if (!isVisible) {
            cursor.classList.add('visible');
            isVisible = true;
        }
        cursor.style.transform = `translate3d(${e.clientX - 6}px, ${e.clientY - 6}px, 0)`;
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
        cursor.classList.remove('visible');
        isVisible = false;
    });

    const hoverSelectors = 'a, button, [role="button"], input, textarea, select, .forge-btn, .caps-tab-btn, .market-card, .lore-card, .boss-card';
    document.querySelectorAll(hoverSelectors).forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
    });
}
