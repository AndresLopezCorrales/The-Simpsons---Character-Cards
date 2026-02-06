export class ImageLazyLoader {
    constructor(container) {
        this.container = container;

        this.observer = new IntersectionObserver(
            this.onIntersection.bind(this),
            {
                root: null,
                rootMargin: '50px',
                threshold: 0.1
            }
        );

        this.observeExistingImages();
        this.observeNewImages();
    }

    onIntersection(entries) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const img = entry.target;
            const src = img.dataset.src;

            if (src) {
                img.src = src;
                img.classList.remove('lazy');
                delete img.dataset.src;
            }

            this.observer.unobserve(img);
        });
    }

    observeExistingImages() {
        const images = this.container.querySelectorAll('img[data-src]');
        images.forEach(img => this.observer.observe(img));
    }

    observeNewImages() {
        const mutationObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType !== 1) return;

                    const imgs = node.querySelectorAll
                        ? node.querySelectorAll('img[data-src]')
                        : [];

                    imgs.forEach(img => this.observer.observe(img));
                });
            });
        });

        mutationObserver.observe(this.container, {
            childList: true,
            subtree: true
        });
    }
}
