export class SimpsonsPaginationManager {
    constructor() {
        this.state = {
            currentPage: 1,
            isLoading: false,
            hasNextPage: true,
            cache: new Map()
        };

        this.cacheTTL = 5 * 60 * 1000; //5 secs

        this.circuit = {
            failures: 0,
            maxFailures: 3,
            state: 'CLOSED',
            lastFailureTime: null,
            resetTimeout: 10000 //10 secs
        };
    }

    canMakeRequest() {
        if (this.circuit.state === 'OPEN') {
            const now = Date.now();

            if (now - this.circuit.lastFailureTime > this.circuit.resetTimeout) {
                this.circuit.state = 'HALF_OPEN';
                return true;
            }

            return false;
        }

        return true;
    }

    async retry(fn, retries = 2, delay = 500) {
        try {
            return await fn();
        } catch (error) {
            if (retries <= 0) throw error;

            if (error.name === 'AbortError' || error.message === 'Circuit breaker open') {
                throw error;
            }

            await new Promise(resolve => setTimeout(resolve, delay));
            return this.retry(fn, retries - 1, delay * 2);
        }
    }

    async loadPage(page) {
        if (this.state.isLoading) return null;

        const cacheKey = `page-${page}`;

        if (this.state.cache.has(cacheKey)) {
            const cached = this.state.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTTL) {
                this.state.currentPage = page;
                this.state.hasNextPage = cached.data.hasNext;
                return cached.data;
            }
        }

        this.state.isLoading = true;

        try {
            const data = await this.fetchPage(page);

            this.state.currentPage = page;
            this.state.hasNextPage = data.results.length > 0;

            this.state.cache.set(cacheKey, {
                data: {
                    ...data,
                    hasNext: this.state.hasNextPage
                },
                timestamp: Date.now()
            });

            this.cleanupCache();
            return data;

        } finally {
            this.state.isLoading = false;
        }
    }

    async fetchPage(page) {
        if (!this.canMakeRequest()) {
            throw new Error('Circuit breaker open');
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
            const data = await this.retry(async () => {
                const res = await fetch(
                    `https://thesimpsonsapi.com/api/characters?page=${page}`,
                    { signal: controller.signal }
                );

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }

                const json = await res.json();

                if (!Array.isArray(json.results)) {
                    throw new Error('Invalid API response');
                }

                return json;
            });

            if (this.circuit.state === 'HALF_OPEN') {
                console.log('Circuit breaker recovered');
            }
            this.circuit.failures = 0;
            this.circuit.state = 'CLOSED';

            return data;

        } catch (error) {
            if (this.circuit.state === 'HALF_OPEN') {
                this.circuit.state = 'OPEN';
                this.circuit.lastFailureTime = Date.now();
                console.log('Circuit breaker reopened after failed test');
            } else {
                this.circuit.failures++;

                if (this.circuit.failures >= this.circuit.maxFailures) {
                    this.circuit.state = 'OPEN';
                    this.circuit.lastFailureTime = Date.now();
                    console.log('Circuit breaker opened');
                }
            }

            throw error;

        } finally {
            clearTimeout(timeoutId);
        }
    }

    cleanupCache() {
        const now = Date.now();

        for (const [key, value] of this.state.cache.entries()) {
            if (now - value.timestamp > this.cacheTTL) {
                this.state.cache.delete(key);
            }
        }
    }

    nextPage() {
        if (!this.state.hasNextPage) return this.state.currentPage;
        return this.state.currentPage + 1;
    }

    prevPage() {
        return Math.max(1, this.state.currentPage - 1);
    }
}