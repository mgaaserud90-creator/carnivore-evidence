document.addEventListener('DOMContentLoaded', () => {
    const contentDiv = document.getElementById('content');
    const homeSection = contentDiv.querySelector('#home');
    const homeHTML = homeSection ? homeSection.outerHTML : '<section id="home" class="mb-5"><h1 class="display-4">Karnivore – Slik vi er designet</h1><p class="lead">En rapport av en hjertekirurg ...</p><p>Klikk på menyen for å utforske bevisene.</p></section>';
    let lastSlug = null;
    let isLoading = false;

    function setActiveNav(slug) {
        document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + slug) {
                link.classList.add('active');
            }
        });
    }

    function showSection(slug) {
        if (slug === lastSlug || isLoading) return;
        lastSlug = slug;
        setActiveNav(slug);

        if (slug === 'home' || slug === '') {
            contentDiv.innerHTML = homeHTML;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        isLoading = true;
        contentDiv.innerHTML = '<div class="text-center mt-5"><div class="spinner-border text-warning" role="status"><span class="visually-hidden">Laster...</span></div></div>';
        window.scrollTo({ top: 0, behavior: 'smooth' });

        fetch(`sections/${slug}.html`)
            .then(resp => {
                if (!resp.ok) throw new Error('Not found');
                return resp.text();
            })
            .then(html => {
                contentDiv.innerHTML = html;
                isLoading = false;
            })
            .catch(() => {
                contentDiv.innerHTML = '<p class="text-center mt-5">Seksjonen ble ikke funnet.</p>';
                isLoading = false;
            });
    }

    function handleHash() {
        const hash = window.location.hash.slice(1);
        showSection(hash || 'home');
    }

    window.addEventListener('hashchange', handleHash);

    // initial load
    const startSlug = window.location.hash.slice(1) || 'home';
    showSection(startSlug);
    setActiveNav(startSlug);

    // Back‑to‑top button
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('d-none', window.scrollY < 400);
        });
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});
