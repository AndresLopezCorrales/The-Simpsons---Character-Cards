import { ApiConsumer } from './api_consumer.js';

export class SimpsonsApp {

    constructor() {
        this.api = null;
        this.init();
    }

    init() {
        const container = document.getElementById('characters-container');
        const nextBtn = document.querySelectorAll('.next-page-api');
        const prevBtn = document.querySelectorAll('.previous-page-api');
        this.api = new ApiConsumer(container, nextBtn, prevBtn);

        this.setupNavigation();
        this.api.loadInitial();
    }

    setupNavigation() {
        let debounce;

        document.querySelectorAll('.next-page-api').forEach(btn => {
            btn.addEventListener('click', () => {
                clearTimeout(debounce);
                debounce = setTimeout(() => {
                    this.api.next();
                }, 100);
            });
        });

        document.querySelectorAll('.previous-page-api').forEach(btn => {
            btn.addEventListener('click', () => {
                clearTimeout(debounce);
                debounce = setTimeout(() => {
                    this.api.previous();
                }, 100);
            });
        });


    }
}
