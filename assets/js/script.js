// Get the HTML Elements by their Tag Name and assigned to variable

// Start Quiz Home Section
const startQuiz = document.getElementById('home-container');
const userNameInput = document.getElementById("username-input");
const startQuizBtn = document.getElementById("startQuiz-btn");
const errorMsg = document.getElementById("error");

// Greeting Box Section
let playerName = userNameInput.value;
const playerNameTxt = document.querySelectorAll(".player-name");
const greetingBox = document.getElementById("greeting-box");
const quizRulesBtn = document.getElementById("quizRules-Btn");

// Quiz Rule Box Section
const ruleBox = document.getElementById("rule-box");
const nextBtn = document.getElementById("next-Btn");
const backHome = document.getElementById("back-home-btn");

// Questions Section
const quizBox = document.getElementById("quiz-box");
const timeCounter = document.getElementById("time-counter");
const questionCounter = document.getElementById("questions-counter");
const questionText = document.getElementById("question-text");
const quizOptions = document.getElementById("quiz-options");
const nextQuestionBtn = document.getElementById("next-question-btn");
const quizEnd = document.querySelector(".quiz-end");

let userScore = document.getElementById("score");

// Progress Bar
const progressBar = document.querySelector(".progress-bar"),
        progressText = document.querySelector(".progress-text");


// Result Section
const quizResult = document.getElementById("quiz-result");
const resultText = document.getElementById("result-text");
const restartQuiz = document.getElementById("restart-btn");

/** Function to Check UserName input and display error message if invalid or empty
    User name display when the Start Quiz button is clicked (onload) on greetingBox
*/ 
function checkUserName() {
    const playerName = userNameInput.value.trim();
    let errorTxt = "";

    // Remove any existing validation classes first
    userNameInput.classList.remove('valid', 'invalid');

    for (let i = 0; i < playerNameTxt.length; i++) {
        playerNameTxt[i].innerHTML = playerName;
    }

    // if username input is empty, display error message
    if (playerName === "") {
        errorTxt = "Please enter your name";
        greetingBox.style.display = "none";

        userNameInput.classList.add('invalid');
    }
    // if username input exceeds maximum length (8)
    else if (playerName.length > 8) {
        // errorTxt = "Name must have a maximum of 8 characters";
        userNameInput.classList.add('invalid');
    }
    else {
        userNameInput.classList.add('valid');
    }

    // display error message in the errorMsg div on home page
    
    if (errorTxt !== "") {
        errorMsg.innerHTML = errorTxt;
    }
    else {
        // clear the input value
        userNameInput.value = "";
        userNameInput.classList.add('valid');
        localStorage.setItem("player-name", playerName);
        startQuiz.classList.add('hide');
        greetingBox.style.display = "block";

    } 
}

// Wait for DOM to load
window.addEventListener('DOMContentLoaded', () => {
    startQuizBtn.addEventListener("click", checkUserName);
});


// Redirect to Quiz Rules Box when Quiz Rules Button is clicked
quizRulesBtn.addEventListener("click", function() {
    greetingBox.style.display = "none";
    ruleBox.style.display = "block";
});


// Redirect to Quiz questions Box when Next Button is clicked
nextBtn.addEventListener("click", function() {
    ruleBox.style.display = "none";
    quizBox.style.display = "block";

    // Load Questions from API
    loadQuestions();
    startTimer(counter);
});

// Redirect to Home Section when Home Button is clicked
backHome.addEventListener('click', () => {
    
    window.location.reload();
});

// Set global variables for Quiz Functionality - Questions, Score, Timer
let questionArr = [];
let questionIndex = 0;
let score = 0;

let time = 20;
let counter;


const progress = (value) => {
    const percentage = (value / time) * 100;
    progressBar.style.width = `${percentage}%`;
    progressText.innerHTML = `${value}`;
};


// function to load questions from API call

let quizApiUrl = "https://opentdb.com/api.php?amount=5&category=18";
function loadQuestions() {
    fetch(quizApiUrl)
    .then((response) => response.json())
    .then((data) => {
        questionArr = data.results;
        displayQuestions(questionArr[questionIndex]);
    });
}

// function to display questions and options to the user
function displayQuestions(questionData) {
    if (!questionData) return;
    questionText.innerHTML = (questionData.question);
    questionCounter.innerHTML = questionIndex + 1;
    loadAnswers(questionData);
}

// function to load answers
function loadAnswers(questionData) {
    quizOptions.innerHTML = "";
    let answers = [...questionData.incorrect_answers, 
        questionData.correct_answer];
    
        // Shuffle answers
    answers = answers.sort(() => Math.random() - 0.5);
    answers.forEach((answer) => {
        let option = document.createElement("li");
        option.innerHTML = answer;
        option.addEventListener("click", () => {
            checkAnswer(option, answers, questionData.correct_answer);
        })
        
        quizOptions.appendChild(option);
    });
    // Reset and start timer for each question
    startTimer(time);
}


// function to check answer and compare correct and incorrect answers
function checkAnswer(answerOption, answers, correctAnswer) {

    clearInterval(counter);
    let isCorrect;
    
    answers.forEach((answer) => {
        if (decodeHtml(answer) === decodeHtml(correctAnswer)) {
            isCorrect = [...quizOptions.childNodes].find(
                (li) => li.innerText === decodeHtml(correctAnswer)
            );
        }
    });
    
    quizOptions.childNodes.forEach((option) => {
        option.style.pointerEvents = "none";
    });

    if (decodeHtml(correctAnswer) === answerOption.innerText){
        answerOption.classList.add("correct");
        userScore.innerHTML = `${++score}/5`

    } else {
        answerOption.classList.add("incorrect");
        isCorrect.classList.add("correct");
    }
}

// Show the results button when quiz finishes
nextQuestionBtn.addEventListener('click', () => {
    clearInterval(counter);
    
    if (nextQuestionBtn.innerText == "Next Question") {
        questionIndex++;
        displayQuestions(questionArr[questionIndex]);
    } else {
        showResult();
    }
    
    if (questionIndex === questionArr.length - 1) {
        quizEnd.innerHTML = "End of Quiz.";
        nextQuestionBtn.innerText = "Submit";
    }
});

// function to show results
function showResult() {
    quizBox.style.display = "none";
    quizResult.style.display = "block";
    userScore.innerHTML = score;
    playerName = localStorage.getItem("player-name");
    
    resultText.innerHTML = `Great effort <span class="player-name"> ${playerName} </span>! You scored ${score} out of 5 questions.`;
}

// helper function to decode HTML entities for a more readable format
function decodeHtml(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

const startTimer = (time) => {
    clearInterval(counter);
    counter = setInterval(() => {
        if (time >= 0) {
            progress(time);
            time--;
        } else {
            clearInterval(counter);

            quizOptions.childNodes.forEach((option) => {
                option.classList.add("disabled");
            });
            // Show results when time is up
            showResult();

        }
    },1000);
};

// Restart Quiz when Restart Button is clicked
restartQuiz.addEventListener("click", () => {
    quizResult.style.display = "none";

    //reload the current window
    window.location.reload(); 
    clearInterval(counter);

});

// Set footer with the current year
  const year = document.querySelector('#current-year');
  year.innerHTML = new Date().getFullYear();