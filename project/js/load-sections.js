/**
 * load-sections.js
 * Loads section content from hidden DOM templates embedded in index.html.
 * This works reliably with both file:// and http:// protocols.
 *
 * For modular editing: Individual section files live in /sections/ folder.
 * Run "node build.js" after editing section files to rebuild index.html.
 */
document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    var contentDiv = document.getElementById('content');
    var homeHTML = contentDiv ? contentDiv.innerHTML : '';
    var sectionTemplates = {};
    var lastSlug = null;
    var isLoading = false;

    // Cache all section templates from hidden DOM
    var templateContainer = document.getElementById('section-templates');
    if (templateContainer) {
        var templateDivs = templateContainer.querySelectorAll('div[data-section]');
        templateDivs.forEach(function(div) {
            var slug = div.getAttribute('data-section');
            if (slug) {
                // Wrap the inner content in a proper section element
                sectionTemplates[slug] = '<section class="section-article" id="' + slug + '">\n' +
                    div.innerHTML.trim() + '\n</section>';
            }
        });
    }

    function setActiveNav(slug) {
        var navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        navLinks.forEach(function(link) {
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

        // Home view
        if (slug === 'home' || slug === '') {
            contentDiv.innerHTML = homeHTML;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (window.initHeroCounters) window.initHeroCounters();
            return;
        }

        isLoading = true;

        // Show loading spinner
        contentDiv.innerHTML =
            '<div class="text-center mt-5 py-5"><div class="spinner-border text-warning" role="status" style="width:3rem;height:3rem;">' +
            '<span class="visually-hidden">Laster...</span></div><p class="text-muted mt-2">Laster seksjon...</p></div>';
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Small delay so the spinner is visible
        setTimeout(function() {
            var html = sectionTemplates[slug];

            if (html) {
                contentDiv.innerHTML = html;
            } else {
                // Fallback: try fetch() (works when served via HTTP)
                fetchSection(slug);
                return;
            }

            isLoading = false;
            document.dispatchEvent(new CustomEvent('sectionLoaded'));
        }, 200);
    }

    // Fallback fetch method - used if template not found in DOM
    function fetchSection(slug) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'sections/' + slug + '.html', true);
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 400) {
                contentDiv.innerHTML = xhr.responseText;
            } else {
                contentDiv.innerHTML =
                    '<div class="text-center mt-5 py-5"><p class="text-danger fs-4">' +
                    '<i class="fa-solid fa-circle-exclamation me-2"></i>Kunne ikke laste seksjonen.</p>' +
                    '<p class="text-muted">Prøv å laste siden på nytt.</p></div>';
            }
            isLoading = false;
            document.dispatchEvent(new CustomEvent('sectionLoaded'));
        };
        xhr.onerror = function() {
            contentDiv.innerHTML =
                '<div class="text-center mt-5 py-5"><p class="text-danger fs-4">' +
                '<i class="fa-solid fa-circle-exclamation me-2"></i>Kunne ikke laste seksjonen.</p>' +
                '<p class="text-muted">Prøv å laste siden på nytt, eller åpne med en lokal server.</p></div>';
            isLoading = false;
        };
        xhr.send();
    }

    function handleHash() {
        var hash = window.location.hash.slice(1);
        showSection(hash || 'home');
    }

    // Listen for hash changes
    window.addEventListener('hashchange', handleHash);

    // Initial load
    var startSlug = window.location.hash.slice(1) || 'home';
    showSection(startSlug);
    setActiveNav(startSlug);

    // Back-to-top button
    var backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', function() {
            backToTop.classList.toggle('d-none', window.scrollY < 400);
        });
        backToTop.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Progress bar
    var progressBar = document.getElementById('progressBar');
    if (progressBar) {
        window.addEventListener('scroll', function() {
            var windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            var scrolled = (window.scrollY / windowHeight) * 100;
            progressBar.style.width = scrolled + '%';
        });
    }
});
