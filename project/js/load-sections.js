document.addEventListener('DOMContentLoaded', () => {
    const contentDiv = document.getElementById('content');
    const homeSection = contentDiv.querySelector('#home');

    function showSection(slug) {
        if (slug === 'home' || slug === '') {
            // Show only home
            contentDiv.innerHTML = '';
            contentDiv.appendChild(homeSection);
            return;
        }
        fetch(`sections/${slug}.html`)
            .then(resp => {
                if (!resp.ok) throw new Error('Not found');
                return resp.text();
            })
            .then(html => {
                contentDiv.innerHTML = html;
                // re-run any dynamic elements if needed
            })
            .catch(() => {
                contentDiv.innerHTML = '<p>Seksjonen ble ikke funnet.</p>';
            });
    }

    function handleHash() {
        const hash = window.location.hash.slice(1); // remove '#'
        showSection(hash || 'home');
    }

    window.addEventListener('hashchange', handleHash);
    handleHash(); // initial load
});
