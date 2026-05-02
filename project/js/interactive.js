/**
 * interactive.js
 * Handles particle background, scroll-triggered animations,
 * eye comparison slider, animated counters, and SVG drawing.
 */
(function() {
    'use strict';

    // ============================================================
    // 1. HERO PARTICLE CANVAS
    // ============================================================
    const canvas = document.getElementById('heroCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animFrame;

        function resizeCanvas() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }

        function createParticles() {
            particles = [];
            const count = Math.min(120, Math.floor((canvas.width * canvas.height) / 10000));
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 2.5 + 0.5,
                    speedX: (Math.random() - 0.5) * 0.6,
                    speedY: (Math.random() - 0.5) * 0.6,
                    alpha: Math.random() * 0.5 + 0.15
                });
            }
        }

        function drawParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Draw connections between nearby particles
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(255,193,7,${0.08 * (1 - dist/120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,193,7,${p.alpha})`;
                ctx.fill();
                p.x += p.speedX;
                p.y += p.speedY;
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;
            });
            animFrame = requestAnimationFrame(drawParticles);
        }

        window.addEventListener('resize', () => {
            resizeCanvas();
            createParticles();
        });
        resizeCanvas();
        createParticles();
        drawParticles();

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            if (animFrame) cancelAnimationFrame(animFrame);
        });
    }

    // ============================================================
    // 2. HERO STAT COUNTERS (animated on mount)
    // ============================================================
    function initHeroCounters() {
        const counters = document.querySelectorAll('.hero-stat-number');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'), 10);
            const duration = 2000; // ms
            const step = Math.ceil(target / 60); // ~60fps
            let current = 0;

            // For percentages, add % suffix
            const suffix = counter.getAttribute('data-target') === '100' ? '%' : '';
            const prefix = counter.getAttribute('data-target') === '2' ? '>' : '';

            const interval = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(interval);
                }
                counter.textContent = prefix + current + suffix;
            }, duration / 60);
        });
    }
    window.initHeroCounters = initHeroCounters;

    // Initial counters on page load
    if (document.querySelector('.hero-stat-number')) {
        // Wait a beat for DOM to settle
        setTimeout(initHeroCounters, 500);
    }

    // ============================================================
    // 3. SCROLL-TRIGGERED ANIMATIONS (IntersectionObserver)
    // ============================================================
    let scrollObserver = null;

    function setupScrollAnimations() {
        // Disconnect old observer if re-initializing
        if (scrollObserver) scrollObserver.disconnect();

        const animatedElements = document.querySelectorAll(
            '.section-article, .fact-bubble, .stat-badge, .highlight-box, ' +
            '.flow-diagram, .evolution-timeline, .anti-nutrient-table, ' +
            '.comparison-slider, .chart-bar, .hormone-flow, .eye-comparison'
        );

        if (animatedElements.length === 0) return;

        scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    scrollObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(el => {
            el.classList.add('animate-on-scroll');
            scrollObserver.observe(el);
        });
    }

    // ============================================================
    // 4. EYE COMPARISON SLIDER
    // ============================================================
    function setupEyeComparison() {
        const sliders = document.querySelectorAll('.comparison-slider');
        sliders.forEach(slider => {
            const handle = slider.querySelector('.comparison-handle');
            const leftImg = slider.querySelector('.comparison-left');
            if (!handle || !leftImg) return;

            function updateSlider(x) {
                const rect = slider.getBoundingClientRect();
                let pos = (x - rect.left) / rect.width;
                pos = Math.max(0.05, Math.min(0.95, pos));
                leftImg.style.clipPath = `inset(0 ${(1-pos)*100}% 0 0)`;
                handle.style.left = (pos * 100) + '%';
            }

            // Mouse events
            let isDragging = false;
            handle.addEventListener('mousedown', (e) => {
                isDragging = true;
                e.preventDefault();
            });
            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                updateSlider(e.clientX);
            });
            document.addEventListener('mouseup', () => {
                isDragging = false;
            });

            // Touch events
            handle.addEventListener('touchstart', (e) => {
                isDragging = true;
                e.preventDefault();
            });
            document.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                const touch = e.touches[0];
                updateSlider(touch.clientX);
            });
            document.addEventListener('touchend', () => {
                isDragging = false;
            });

            // Click to move
            slider.addEventListener('click', (e) => {
                if (e.target === handle) return;
                updateSlider(e.clientX);
            });
        });
    }

    // ============================================================
    // 5. SECTION LOAD EVENT HANDLER
    // ============================================================
    document.addEventListener('sectionLoaded', () => {
        setupScrollAnimations();
        setupEyeComparison();
        // Re-trigger hero counters if home section is loaded
        if (window.location.hash.slice(1) === 'home' || !window.location.hash) {
            if (window.initHeroCounters) window.initHeroCounters();
        }
    });

    // Initial setup
    document.addEventListener('DOMContentLoaded', () => {
        setupScrollAnimations();
        setupEyeComparison();
    });

})();
