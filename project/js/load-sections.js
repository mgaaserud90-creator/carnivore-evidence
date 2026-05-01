document.addEventListener('DOMContentLoaded', () => {
    const contentDiv = document.getElementById('content');
    const homeSection = contentDiv.querySelector('#home');
    const homeHTML = homeSection
        ? homeSection.outerHTML
        : '<section id="home" class="mb-5"><h1 class="display-4">Karnivore – Slik vi er designet</h1><p class="lead">En rapport av en hjertekirurg ...</p><p>Klikk på menyen for å utforske bevisene.</p></section>';

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
        // Prevent repeated or simultaneous loads
        if (slug === lastSlug || isLoading) return;
        lastSlug = slug;
        setActiveNav(slug);

        // Show the home view and return
        if (slug === 'home' || slug === '') {
            contentDiv.innerHTML = homeHTML;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        isLoading = true;
        // Show a loading spinner while we prepare the section
        contentDiv.innerHTML =
            '<div class="text-center mt-5"><div class="spinner-border text-warning" role="status">' +
            '<span class="visually-hidden">Laster...</span></div></div>';
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Retrieve the section from the hidden templates already embedded in index.html
        const templateContainer = document.getElementById('section-templates');
        if (templateContainer) {
            const template = templateContainer.querySelector(`section[data-slug="${slug}"]`);
            if (template) {
                const clone = template.cloneNode(true);
                // Avoid duplicate IDs when the section is moved into #content
                clone.removeAttribute('id');
                contentDiv.innerHTML = clone.outerHTML;
                isLoading = false;
                return;
            }
        }

        // If we reach this point the section was not found
        contentDiv.innerHTML = '<p class="text-center mt-5">Seksjonen ble ikke funnet.</p>';
        isLoading = false;
    }

    function handleHash() {
        const hash = window.location.hash.slice(1);
        showSection(hash || 'home');
    }

    window.addEventListener('hashchange', handleHash);

    // Initial load based on current URL hash
    const startSlug = window.location.hash.slice(1) || 'home';
    showSection(startSlug);
    setActiveNav(startSlug);

    // Back‑to‑top button toggle and scroll
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
