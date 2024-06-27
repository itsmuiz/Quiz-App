const questionElement = document.querySelector('.question');
const ansBtnsElement = document.getElementById('Ansbtns');
const nextButton = document.getElementById('next');
let currentQindex = 0;
let score = 0;
let questions = [];

// Fetch questions from the API
async function fetchQuestions() {
    const url = 'https://opentdb.com/api.php?amount=10';
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.results.map(question => ({
            question: question.question,
            answers: shuffle([
                ...question.incorrect_answers.map(answer => ({ text: answer, correct: false })),
                { text: question.correct_answer, correct: true }
            ])
        }));
    } catch (error) {
        console.error('Error fetching questions:', error);
        return [];
    }
}

// Function to shuffle the answers array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function startQuiz() {
    questions = await fetchQuestions();
    if (questions.length === 0) {
        questionElement.innerHTML = 'Error fetching questions. Please try again later.';
        return;
    }
    currentQindex = 0;
    score = 0;
    nextButton.innerHTML = 'Next';
    nextButton.style.display = 'none';
    showQuestion();
}

function showQuestion() {
    resetState();
    let currentQ = questions[currentQindex];
    let Qno = currentQindex + 1;
    questionElement.innerHTML = `${Qno}. ${currentQ.question}`;

    currentQ.answers.forEach(answer => {
        let button = document.createElement('button');
        button.innerHTML = answer.text;
        button.classList.add('btn');
        ansBtnsElement.appendChild(button);

        if (answer.correct) {
            button.dataset.correct = answer.correct;
        }

        button.addEventListener('click', selectAnswer);
    });
}

function resetState() {
    nextButton.style.display = 'none';
    while (ansBtnsElement.firstChild) {
        ansBtnsElement.removeChild(ansBtnsElement.firstChild);
    }
}

function selectAnswer(e) {
    const selectedBtn = e.target;
    const isCorrect = selectedBtn.dataset.correct === 'true';
    if (isCorrect) {
        selectedBtn.classList.add('correct');
        score++;
    } else {
        selectedBtn.classList.add('wrong');
    }

    Array.from(ansBtnsElement.children).forEach(button => {
        if (button.dataset.correct === 'true') {
            button.classList.add('correct');
        }
        button.disabled = true;
    });

    nextButton.style.display = 'block';
    nextButton.onclick = () => {
        currentQindex++;
        if (currentQindex < questions.length) {
            showQuestion();
        } else {
            showScore();
        }
    };
}

function showScore() {
    resetState();
    questionElement.innerHTML = `You scored ${score} out of ${questions.length}!`;
    nextButton.innerHTML = 'Restart';
    nextButton.style.display = 'block';
    nextButton.onclick = startQuiz;
}

startQuiz();
