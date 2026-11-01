
const defaultCards = [
    {
        question: "What does HTML stand for?",
        answer: "HyperText Markup Language."
    },
    {
        question: "What is CSS used for?",
        answer: "CSS is used to style web pages."
    },
    {
        question: "What is JavaScript?",
        answer: "JavaScript makes web pages interactive."
    },
    {
        question: "What does CPU stand for?",
        answer: "Central Processing Unit."
    },
    {
        question: "What is an algorithm?",
        answer: "A step-by-step procedure for solving a problem."
    }
];

const STORAGE_KEY = "flashlearn_cards";

let cards = loadCards();
let currentIndex = 0;
let answerVisible = false;
let editingIndex = -1;

const cardContent = document.getElementById("cardContent");
const cardLabel = document.getElementById("cardLabel");
const cardHint = document.getElementById("cardHint");
const cardCounter = document.getElementById("cardCounter");
const progressPercent = document.getElementById("progressPercent");
const progressBar = document.getElementById("progressBar");

const showAnswerBtn = document.getElementById("showAnswerBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const addBtn = document.getElementById("addBtn");
const editBtn = document.getElementById("editBtn");
const deleteBtn = document.getElementById("deleteBtn");

const formSection = document.getElementById("formSection");
const cardForm = document.getElementById("cardForm");
const formTitle = document.getElementById("formTitle");
const questionInput = document.getElementById("questionInput");
const answerInput = document.getElementById("answerInput");
const cancelBtn = document.getElementById("cancelBtn");
const saveBtn = document.getElementById("saveBtn");
const emptyMessage = document.getElementById("emptyMessage");

function loadCards() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved !== null) {
            const parsed = JSON.parse(saved);

            if (
                Array.isArray(parsed) &&
                parsed.every(card =>
                    card &&
                    typeof card.question === "string" &&
                    typeof card.answer === "string"
                )
            ) {
                return parsed;
            }
        }
    } catch (error) {
        console.error("Could not load saved cards:", error);
    }

    return defaultCards.map(card => ({ ...card }));
}

function saveCards() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(cards)
        );
    } catch (error) {
        alert("Could not save cards. Check your browser storage.");
    }
}

function renderCard() {
    const hasCards = cards.length > 0;

    emptyMessage.hidden = hasCards;
    document.getElementById("flashcard").hidden = !hasCards;
    document.querySelector(".progress-section").hidden = !hasCards;
    document.querySelector(".navigation").hidden = !hasCards;
    document.querySelector(".manage-buttons").hidden = !hasCards;

    if (!hasCards) {
        cardCounter.textContent = "No cards";
        progressPercent.textContent = "0% completed";
        progressBar.style.width = "0%";
        return;
    }

    const card = cards[currentIndex];

    cardLabel.textContent = answerVisible ? "ANSWER" : "QUESTION";
    cardContent.textContent = answerVisible
        ? card.answer
        : card.question;

    cardHint.textContent = answerVisible
        ? "Great! Ready for the next card?"
        : "Think about your answer before revealing it.";

    showAnswerBtn.textContent = answerVisible
        ? "Show Question"
        : "Show Answer";

    cardCounter.textContent =
        `Card ${currentIndex + 1} of ${cards.length}`;

    const progress = Math.round(
        ((currentIndex + 1) / cards.length) * 100
    );

    progressPercent.textContent = `${progress}% completed`;
    progressBar.style.width = `${progress}%`;

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === cards.length - 1;

    prevBtn.style.opacity = prevBtn.disabled ? "0.5" : "1";
    nextBtn.style.opacity = nextBtn.disabled ? "0.5" : "1";
}

function openForm(index = -1) {
    editingIndex = index;
    cardForm.reset();

    if (index >= 0) {
        formTitle.textContent = "Edit Flashcard";
        questionInput.value = cards[index].question;
        answerInput.value = cards[index].answer;
        saveBtn.textContent = "Update Card";
    } else {
        formTitle.textContent = "Add a Flashcard";
        saveBtn.textContent = "Save Card";
    }

    formSection.hidden = false;
    questionInput.focus();

    formSection.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

function closeForm() {
    formSection.hidden = true;
    cardForm.reset();
    editingIndex = -1;
}

showAnswerBtn.addEventListener("click", () => {
    answerVisible = !answerVisible;
    renderCard();
});

prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
        currentIndex--;
        answerVisible = false;
        renderCard();
    }
});

nextBtn.addEventListener("click", () => {
    if (currentIndex < cards.length - 1) {
        currentIndex++;
        answerVisible = false;
        renderCard();
    }
});

addBtn.addEventListener("click", () => {
    openForm();
});

editBtn.addEventListener("click", () => {
    if (cards.length > 0) {
        openForm(currentIndex);
    }
});

deleteBtn.addEventListener("click", () => {
    if (cards.length === 0) return;

    const confirmed = confirm(
        "Are you sure you want to delete this flashcard?"
    );

    if (!confirmed) return;

    cards.splice(currentIndex, 1);

    currentIndex = Math.min(
        currentIndex,
        Math.max(0, cards.length - 1)
    );

    answerVisible = false;
    saveCards();
    renderCard();
});

cardForm.addEventListener("submit", event => {
    event.preventDefault();

    const question = questionInput.value.trim();
    const answer = answerInput.value.trim();

    if (!question || !answer) {
        alert("Please enter both a question and an answer.");
        return;
    }

    if (editingIndex >= 0) {
        cards[editingIndex] = { question, answer };
        currentIndex = editingIndex;
    } else {
        cards.push({ question, answer });
        currentIndex = cards.length - 1;
    }

    answerVisible = false;
    saveCards();
    closeForm();
    renderCard();
});

cancelBtn.addEventListener("click", closeForm);

// Display the first flashcard.
renderCard();
