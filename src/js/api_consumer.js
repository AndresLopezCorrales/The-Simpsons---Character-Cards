document.addEventListener("DOMContentLoaded", () => {

    const cardsContainer = document.getElementById("characters-container");
    const nextBtns = document.querySelectorAll(".next-page-api");
    const previousBtns = document.querySelectorAll(".previous-page-api")

    let currentPage = 1;

    function showLoading() {
        cardsContainer.innerHTML = `
        <img src="./img/ic_loading.gif" alt="Loading">
        `;
    }

    function setButtonDisabled(state) {
        nextBtns.forEach(btn => btn.disabled = state);
        previousBtns.forEach(btn => btn.disabled = state);
    }

    function showNetworkError() {
        cardsContainer.innerHTML = `
            <div class="text-center col-span-full">
                <p class="text-red-500 mb-2">Failed to load information</p>
                <button id="retry-btn" class="px-4 py-2 bg-blue-500 text-white rounded">
                    Retry
                </button>
            </div>`;

        document.getElementById("retry-btn").addEventListener("click", () => {
            loadCharacters(currentPage);
        });
    }

    async function loadCharacters(page) {

        showLoading();
        setButtonDisabled(true);

        previousBtns.forEach(btn => {
            btn.classList.toggle("hidden", page === 1);
        });

        try {
            const URL = `https://thesimpsonsapi.com/api/characters?page=${page}`
            const res = await fetch(URL);

            if (!res.ok) {
                throw new Error(`Http error ${res.status}`)
            }

            const data = await res.json();

            if (!data.results || !Array.isArray(data.results)) {
                throw new Error("Data Invalid");
            }

            cardsContainer.innerHTML = ``;

            nextBtns.forEach(btn => {
                btn.disabled = false;
                btn.classList.remove("opacity-50", "cursor-not-allowed");
            });

            if (data.results.length === 0) {
                nextBtns.forEach(btn => {
                    btn.disabled = true;
                    btn.classList.add("opacity-50", "cursor-not-allowed");
                });
                cardsContainer.innerHTML = `<p>No more characters.</p>`;
                return;
            }

            data.results.forEach(character => {

                const image = character.portrait_path ? `https://cdn.thesimpsonsapi.com/200${character.portrait_path}` : "https://via.placeholder.com/200x200?text=No+Image";

                const characterCard = document.createElement("div");
                characterCard.classList.add("character-card", "bg-white", "rounded-lg", "shadow-md", "overflow-hidden", "hover:shadow-xl", "transition-shadow", "duration-300");
                characterCard.innerHTML = `
                <img src=${image} alt="${character.name}" class="w-full h-48 object-contain">
                <div class="p-4">
                    <h3 class="text-lg font-semibold mb-2">${character.name || "No entries"}</h3>
                    <p class="text-gray-600 mb-1">Age: ${character.age || "Unknown"}</p>
                    <p class="text-gray-600 mb-1">Occupation ${character.occupation || "Unknown"}</p>
                    <p class="text-gray-800 font-bold">Gender: ${character.gender || "N/A"}</p>
                </div>`

                cardsContainer.appendChild(characterCard);
            });



        } catch (error) {
            console.error("Error fetching character data:", error);
            showNetworkError();
        } finally {
            setButtonDisabled(false);
        }


    }

    nextBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            currentPage++;
            loadCharacters(currentPage);
        })
    });

    previousBtns.forEach(btn => {
        btn.addEventListener("click", () => {

            if (currentPage > 1) {
                currentPage--;
                loadCharacters(currentPage);
            }

        })
    });


    loadCharacters(currentPage);

});