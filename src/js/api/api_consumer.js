import { SecureCharacterRenderer } from '../render/SecureCharacterRenderer.js';
import { SimpsonsPaginationManager } from './SimpsonsPaginationManager.js';
import { ImageLazyLoader } from '../utils/ImageLazyLoader.js';


export class ApiConsumer {

    constructor(container, nextBtn, prevBtn) {
        this.container = container;
        this.renderer = new SecureCharacterRenderer(container);
        this.pagination = new SimpsonsPaginationManager();
        this.lazyLoader = new ImageLazyLoader(container);

        this.nextBtn = nextBtn;
        this.prevBtn = prevBtn;
    }

    async loadInitial() {
        await this.loadPage(1);
    }

    updateNavigationButtons(hasResults) {
        const { currentPage, hasNextPage } = this.pagination.state;

        // Previous
        this.toggleButtonState(this.prevBtn, currentPage <= 1);

        // Next
        let disableNext;

        if (!hasResults) {
            disableNext = true;
        } else {
            disableNext = hasNextPage === false;
        }

        this.toggleButtonState(this.nextBtn, disableNext);
    }

    toggleButtonState(buttons, disabled) {
        if (!buttons) return;

        const list = buttons instanceof NodeList ? buttons : [buttons];

        list.forEach(button => {
            button.disabled = disabled;
            button.classList.toggle('opacity-50', disabled);
            button.classList.toggle('cursor-not-allowed', disabled);
            button.classList.toggle('pointer-events-none', disabled);
        });
    }


    async loadPage(page) {
        this.renderer.showLoading();

        try {
            const data = await this.pagination.loadPage(page);

            if (!data || data.results.length === 0) {
                this.renderer.showEmpty();
                this.updateNavigationButtons(false);
                return;
            }

            this.renderer.renderCharacters(data.results);
            this.updateNavigationButtons(true);

        } catch (error) {
            console.error(error);
            this.renderer.showError(
                'Failed to load information',
                () => this.loadPage(this.pagination.state.currentPage)
            );
        }
    }

    async next() {
        if (!this.pagination.state.hasNextPage) return;

        const page = this.pagination.nextPage();
        await this.loadPage(page);
    }

    async previous() {
        if (this.pagination.state.currentPage <= 1) return;

        const page = this.pagination.prevPage();
        await this.loadPage(page);
    }
}
