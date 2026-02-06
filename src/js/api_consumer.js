document.addEventListener("DOMContentLoaded", () => {

    const cardsContainer = document.getElementById("characters-container");
    const nextBtns = document.querySelectorAll(".next-page-api");
    const previousBtns = document.querySelectorAll(".previous-page-api")

    let currentPage = 1;

    function showLoading() {
        cardsContainer.innerHTML = "";

        const img = document.createElement("img");
        img.src = "./img/ic_loading.gif";
        img.alt = "Loading";
        cardsContainer.appendChild(img);
    }

    function setButtonDisabled(state) {
        nextBtns.forEach(btn => btn.disabled = state);
        previousBtns.forEach(btn => btn.disabled = state);
    }

    function showNetworkError() {
        cardsContainer.innerHTML = "";

        const wrapper = document.createElement("div");
        wrapper.className = "text-center col-span-full";

        const p = document.createElement("p");
        p.className = "text-red-500 mb-2";
        p.textContent = "Failed to load information";

        const retryBtn = document.createElement("button");
        retryBtn.className = "px-4 py-2 bg-blue-500 text-white rounded";
        retryBtn.textContent = "Retry";

        retryBtn.addEventListener("click", () => {
            loadCharacters(currentPage);
        });

        wrapper.append(p, retryBtn);
        cardsContainer.appendChild(wrapper);
    }

    function sanitizeImageUrl(portraitPath) {
        const FALLBACK =
            "https://via.placeholder.com/200x200/cccccc/666666?text=No+Image";

        if (!portraitPath) return FALLBACK;

        const path = portraitPath.toString();

        if (
            !path.startsWith("/") ||
            path.includes("..") ||
            path.includes("//")
        ) {
            console.warn("Invalid image path:", path);
            return FALLBACK;
        }

        return `https://cdn.thesimpsonsapi.com/200${path}`;
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

            cardsContainer.innerHTML = "";

            nextBtns.forEach(btn => {
                btn.disabled = false;
                btn.classList.remove("opacity-50", "cursor-not-allowed", "pointer-events-none");
            });

            if (data.results.length === 0) {
                nextBtns.forEach(btn => {
                    btn.disabled = true;

                    btn.classList.add("opacity-50", "cursor-not-allowed", "pointer-events-none");
                });
                cardsContainer.innerHTML = `<p>No more characters.</p>`;
                return;
            }

            data.results.forEach(character => {

                const characterCard = document.createElement("div");
                characterCard.classList.add("character-card", "bg-white", "rounded-lg", "shadow-md", "overflow-hidden", "hover:shadow-xl", "transition-shadow", "duration-300");

                // IMG
                const img = document.createElement("img");
                img.className = "w-full h-48 object-contain";
                img.alt = character.name || "Character";
                img.src = sanitizeImageUrl(character.portrait_path);

                img.onerror = () => {
                    img.src = "https://via.placeholder.com/200x200/cccccc/666666?text=Image+Error";
                };

                const infoDiv = document.createElement("div");
                infoDiv.className = "p-4";

                // Name
                const name = document.createElement("h3");
                name.className = "text-lg font-semibold mb-2";
                name.textContent = character.name || "No entries";

                // Age
                const age = document.createElement("p");
                age.className = "text-gray-600 mb-1";
                age.textContent = `Age: ${character.age || "Unknown"}`;

                // Occupation
                const occupation = document.createElement("p");
                occupation.className = "text-gray-600 mb-1";
                occupation.textContent = `Occupation: ${character.occupation || "Unknown"}`;

                // Gender
                const gender = document.createElement("p");
                gender.className = "text-gray-800 font-bold";
                gender.textContent = `Gender: ${character.gender || "N/A"}`;

                // Assemble
                infoDiv.append(name, age, occupation, gender);
                characterCard.append(img, infoDiv);
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