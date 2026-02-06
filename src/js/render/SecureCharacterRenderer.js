export class SecureCharacterRenderer {

    constructor(container) {
        this.container = container;
    }

    //STATES
    showLoading() {
        this.container.innerHTML = '';

        const wrapper = document.createElement('div');
        wrapper.className = 'col-span-full text-center items-center text-center';

        const img = document.createElement('img');
        img.src = './img/ic_loading.gif';
        img.alt = 'Loading characters';


        wrapper.appendChild(img);
        this.container.appendChild(wrapper);
    }

    showError(message, onRetry) {
        this.container.innerHTML = '';

        const wrapper = document.createElement('div');
        wrapper.className = 'text-center col-span-full';

        const p = document.createElement('p');
        p.className = 'text-red-500 mb-2';
        p.textContent = message;

        const button = document.createElement('button');
        button.className = 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition';
        button.textContent = 'Retry';
        button.addEventListener('click', onRetry);

        wrapper.append(p, button);
        this.container.appendChild(wrapper);
    }

    showEmpty() {
        this.container.innerHTML = '';
        const p = document.createElement('p');
        p.textContent = 'No more characters.';
        this.container.appendChild(p);
    }

    //CARDS

    renderCharacters(characters) {
        this.container.innerHTML = '';

        characters.forEach(character => {
            const card = this.createCharacterCard(character);
            this.container.appendChild(card);
        });
    }

    createCharacterCard(character) {
        const card = document.createElement('div');
        card.className =
            'character-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300';

        card.append(
            this.createImage(character),
            this.createInfo(character)
        );

        return card;
    }

    createImage(character) {
        const wrapper = document.createElement('div');
        wrapper.className = 'w-full h-48 overflow-hidden';

        const img = document.createElement('img');
        img.className = 'w-full h-full object-contain';
        img.loading = 'lazy';
        img.decoding = 'async';

        img.dataset.src = this.sanitizeImageUrl(character);
        img.alt = `Portrait of ${character.name || 'character'}`;

        img.onerror = () => {
            img.src = 'https://via.placeholder.com/200x200/cccccc/666666?text=No+Image';
        };

        wrapper.appendChild(img);
        return wrapper;
    }

    createInfo(character) {
        const div = document.createElement('div');
        div.className = 'p-4';

        const name = document.createElement('h3');
        name.className = 'text-lg font-semibold mb-2';
        name.textContent = character.name || 'No name';

        const age = document.createElement('p');
        age.className = 'text-gray-600 mb-1';
        age.textContent = `Age: ${character.age || 'Unknown'}`;

        const occupation = document.createElement('p');
        occupation.className = 'text-gray-600 mb-1';
        occupation.textContent = `Occupation: ${character.occupation || 'Unknown'}`;

        const gender = document.createElement('p');
        gender.className = 'text-gray-800 font-bold';
        gender.textContent = `Gender: ${character.gender || 'N/A'}`;

        div.append(name, age, occupation, gender);
        return div;
    }

    //SANITIZATION

    sanitizeImageUrl(character) {
        if (!character.portrait_path) {
            return 'https://via.placeholder.com/200x200/cccccc/666666?text=No+Image';
        }

        const path = String(character.portrait_path);

        if (!path.startsWith('/') || path.includes('..') || path.includes('//')) {
            console.warn('Invalid image path:', path);
            return 'https://via.placeholder.com/200x200/cccccc/666666?text=Invalid+Image';
        }

        return `https://cdn.thesimpsonsapi.com/200${path}`;
    }
}
