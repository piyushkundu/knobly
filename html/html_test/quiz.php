<?php
session_start();
if (!isset($_SESSION['username'])) {
    header("Location: index.php");
    exit();
}
?>

<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Basic Computer Practice Test -1 - O Level, CCC & All Computer Exams | olevelcccexam.link</title>
    <meta name="description" content="Prepare for O Level, CCC, and all competitive computer exams with our free basic computer practice test. Test your knowledge on fundamental computer concepts, hardware, software, and programming languages.">
    <meta name="keywords" content="basic computer test, computer practice test, O Level exam, CCC exam, computer fundamentals, free online computer test, competitive exams, computer quiz, computer exam preparation">
    <meta name="author" content="olevelcccexam.link">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta property="og:title" content="Basic Computer Practice Test for O Level, CCC & All Computer Exams | olevelcccexam.link">
    <meta property="og:description" content="Ace your computer exams with our free online computer practice tests covering basic concepts and essential knowledge for O Level, CCC, and other competitive exams.">
    <meta property="og:url" content="https://olevelcccexam.link">
    <meta property="og:type" content="website">
    <meta property="og:image" content="https://olevelcccexam.link/images/computer-practice-test.jpg">
    <meta name="robots" content="index, follow">
    <link rel="stylesheet" href="style.css">
    
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">

    <style>
        * {
            box-sizing: border-box;
        }

        body {
            font-family: 'Poppins', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f3f4f6;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }

        .container {
            display: flex;
            flex-direction: column;
            width: 90%;
            max-width: 1200px;
            background-color: #ffffff;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            border-radius: 12px;
            padding: 20px;
            position: relative;
        }

        .timer {
            font-size: 1.5rem;
            color: #e74c3c;
            text-align: center;
            margin-bottom: 20px;
        }

        .test-content {
            display: flex;
            flex-direction: row;
            width: 100%;
        }

        .question-section {
            flex: 3;
            padding: 20px;
        }

        .tracker-section {
            flex: 1;
            padding: 20px;
            background-color: #2c3e50;
            color: white;
            border-radius: 12px;
            max-height: 600px;
            overflow-y: auto;
            position: sticky;
            top: 100px;
        }

        .tracker-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
        }

        .tracker-box {
            width: 40px;
            height: 40px;
            background-color: #e74c3c;
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 50%;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        .tracker-box.completed {
            background-color: #27ae60;
        }

        .tracker-box:hover {
            background-color: #34495e;
        }

        .question-box {
            background-color: #f9f9f9;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            margin-bottom: 20px;
        }

        .question {
            font-size: 1.2rem;
            margin-bottom: 15px;
            color: #34495e;
        }

        .options {
            list-style-type: none;
            padding: 0;
        }

        .options li {
            margin-bottom: 10px;
            font-size: 1rem;
            color: #2c3e50;
        }

        .navigation-buttons {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
        }

        button {
            padding: 12px 24px;
            background-color: #2980b9;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            transition: background-color 0.3s;
        }

        button:hover {
            background-color: #1f6391;
        }

        button:disabled {
            background-color: #bdc3c7;
            cursor: not-allowed;
        }

        .submit-btn {
            display: none;
            background-color: #27ae60;
            font-size: 1.1rem;
            width: 100%;
            margin-top: 20px;
            text-align: center;
        }

        .result-section {
            display: none;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .result-section h2 {
            color: #27ae60;
            margin-bottom: 20px;
        }

        .result-question {
            margin-bottom: 15px;
        }

        .result-question p {
            margin: 5px 0;
        }

        .correct {
            color: green;
        }

        .incorrect {
            color: red;
        }

        @media (max-width: 768px) {
            .container {
            margin-top:70px;
            padding:0px;
            margin-bottom:10px;
        }
        .question-box {
           width:290px;
        }
            .test-content {
                flex-direction: column;
            }

            .tracker-section {
                width: 100%;
                max-height: none;
                margin-top: 20px;
            }

            .tracker-grid {
                grid-template-columns: repeat(5, 1fr);
            }
        }
    </style>
</head>

<body>
    <header>
        <nav class="navbar">
            <div class="logo">
                <a href="../index.html">olevelcccexam</a>
            </div>
            <ul class="nav-links">
                <li><a href="../index.html" >Home</a></li>
                <li><a href="../notes.html">Notes</a></li>
                <li><a href="../practice_test/practice_test.html" class="active">Practice Test</a></li>
                <li><a href="../syllabus.html">Syllabus</a></li>
            </ul>
            <div class="hamburger">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </div>
        </nav>
    </header>
    
    <div class="container">
        <div class="timer" id="timer">Time Left: 15:00</div>
        <div class="test-content">
            <!-- Question Section -->
            <div class="question-section">
                <div id="question-box" class="question-box">
                    <div id="question" class="question">Question will appear here</div>
                    <ul id="options" class="options">
                        <!-- Options will appear here -->
                    </ul>
                </div>
                <div class="navigation-buttons">
                    <button id="prev" onclick="prevQuestion()" disabled>Previous</button>
                    <button id="next" onclick="nextQuestion()">Next</button>
                </div>
                <button id="submit" class="submit-btn" onclick="submitTest()">Submit Test</button>
            </div>

            <!-- Tracker Section -->
            <div class="tracker-section">
                <div class="tracker-grid">
                    <!-- Tracker boxes for 20 questions -->
                    <div id="q1" class="tracker-box incomplete" onclick="jumpToQuestion(1)">1</div>
                    <div id="q2" class="tracker-box incomplete" onclick="jumpToQuestion(2)">2</div>
                    <div id="q3" class="tracker-box incomplete" onclick="jumpToQuestion(3)">3</div>
                    <div id="q4" class="tracker-box incomplete" onclick="jumpToQuestion(4)">4</div>
                    <div id="q5" class="tracker-box incomplete" onclick="jumpToQuestion(5)">5</div>
                    <div id="q6" class="tracker-box incomplete" onclick="jumpToQuestion(6)">6</div>
                    <div id="q7" class="tracker-box incomplete" onclick="jumpToQuestion(7)">7</div>
                    <div id="q8" class="tracker-box incomplete" onclick="jumpToQuestion(8)">8</div>
                    <div id="q9" class="tracker-box incomplete" onclick="jumpToQuestion(9)">9</div>
                    <div id="q10" class="tracker-box incomplete" onclick="jumpToQuestion(10)">10</div>
                    <div id="q11" class="tracker-box incomplete" onclick="jumpToQuestion(11)">11</div>
                    <div id="q12" class="tracker-box incomplete" onclick="jumpToQuestion(12)">12</div>
                    <div id="q13" class="tracker-box incomplete" onclick="jumpToQuestion(13)">13</div>
                    <div id="q14" class="tracker-box incomplete" onclick="jumpToQuestion(14)">14</div>
                    <div id="q15" class="tracker-box incomplete" onclick="jumpToQuestion(15)">15</div>
                    <div id="q16" class="tracker-box incomplete" onclick="jumpToQuestion(16)">16</div>
                    <div id="q17" class="tracker-box incomplete" onclick="jumpToQuestion(17)">17</div>
                    <div id="q18" class="tracker-box incomplete" onclick="jumpToQuestion(18)">18</div>
                    <div id="q19" class="tracker-box incomplete" onclick="jumpToQuestion(19)">19</div>
                    <div id="q20" class="tracker-box incomplete" onclick="jumpToQuestion(20)">20</div>
                </div>
            </div>
        </div>

        <!-- Result Section -->
        <div id="result-section" class="result-section">
            <h2>Your Test Results</h2>
            <p id="score"></p>
            <div id="detailed-results"></div>
        </div>
    </div>
    </html>

<!-- Add this to your existing script section -->
<script>


        const questions = [
    {
        question: "1. Which tag is used for inserting line breaks in HTML? (HTML में लाइन ब्रेक जोड़ने के लिए किस टैग का उपयोग किया जाता है?)",
        options: [
            "&lt;br&gt; (ब्रेक)",
            "&lt;hr&gt; (क्षैतिज रेखा)",
            "&lt;pre&gt; (पूर्व निर्धारित)",
            "&lt;lb&gt; (लाइन ब्रेक)"
        ],
        answer: 0
    },
    {
        question: "2. Which tag is used to create a division or section in an HTML document? (HTML दस्तावेज़ में एक विभाजन या अनुभाग बनाने के लिए किस टैग का उपयोग किया जाता है?)",
        options: [
            "&lt;div&gt; (डिव)",
            "&lt;section&gt; (अनुभाग)",
            "&lt;hr&gt; (क्षैतिज रेखा)",
            "&lt;span&gt; (स्पैन)"
        ],
        answer: 0
    },
    {
        question: "3. What is the purpose of the &lt;font&gt; tag? (&lt;font&gt; टैग का उद्देश्य क्या है?)",
        options: [
            "To define font style (फॉन्ट शैली को परिभाषित करना)",
            "To insert images (छवियाँ जोड़ना)",
            "To create hyperlinks (हाइपरलिंक बनाना)",
            "To create a list (सूची बनाना)"
        ],
        answer: 0
    },
    {
        question: "4. Which attribute is used to add alternative text to an image? (छवि में वैकल्पिक पाठ जोड़ने के लिए कौन सा गुण उपयोग किया जाता है?)",
        options: [
            "alt",
            "src",
            "href",
            "title"
        ],
        answer: 0
    },
    {
        question: "5. Which tag is used for inserting a comment in HTML? (HTML में टिप्पणी डालने के लिए किस टैग का उपयोग किया जाता है?)",
        options: [
            "&lt;!-- --&gt;",
            "//",
            "&lt;comment&gt;",
            "&lt;remarks&gt;"
        ],
        answer: 0
    },
    {
        question: "6. Which tag is used to create a bulleted list in HTML? (HTML में बुलेटेड सूची बनाने के लिए किस टैग का उपयोग किया जाता है?)",
        options: [
            "&lt;ul&gt;",
            "&lt;ol&gt;",
            "&lt;li&gt;",
            "&lt;dl&gt;"
        ],
        answer: 0
    },
    {
        question: "7. In HTML, what does the &lt;center&gt; tag do? (HTML में &lt;center&gt; टैग क्या करता है?)",
        options: [
            "Centers text or content (टेक्स्ट या सामग्री को केंद्र में करता है)",
            "Aligns text to the left (टेक्स्ट को बाईं ओर संरेखित करता है)",
            "Inserts an image (एक छवि डालता है)",
            "Defines a paragraph (एक पैराग्राफ को परिभाषित करता है)"
        ],
        answer: 0
    },
    {
        question: "8. Which tag is used to add a horizontal line in HTML? (HTML में क्षैतिज रेखा जोड़ने के लिए किस टैग का उपयोग किया जाता है?)",
        options: [
            "&lt;hr&gt;",
            "&lt;br&gt;",
            "&lt;pre&gt;",
            "&lt;line&gt;"
        ],
        answer: 0
    },
    {
        question: "9. Which tag is used to display preformatted text in HTML? (HTML में पूर्वनिर्धारित टेक्स्ट प्रदर्शित करने के लिए किस टैग का उपयोग किया जाता है?)",
        options: [
            "&lt;pre&gt;",
            "&lt;br&gt;",
            "&lt;code&gt;",
            "&lt;tt&gt;"
        ],
        answer: 0
    },
    {
        question: "10. What does HTML stand for? (HTML का पूरा नाम क्या है?)",
        options: [
            "HyperText Markup Language (हाइपरटेक्स्ट मार्कअप भाषा)",
            "HighText Markup Language (हाईटेक्स्ट मार्कअप भाषा)",
            "HyperTool Markup Language (हाइपरटूल मार्कअप भाषा)",
            "None of the above (इनमें से कोई नहीं)"
        ],
        answer: 0
    },
    {
        question: "11. Which tag is used to create a scrolling text in HTML? (HTML में स्क्रॉलिंग टेक्स्ट बनाने के लिए किस टैग का उपयोग किया जाता है?)",
        options: [
            "&lt;marquee&gt;",
            "&lt;scroll&gt;",
            "&lt;move&gt;",
            "&lt;slide&gt;"
        ],
        answer: 0
    },
    {
        question: "12. Which attribute is used to specify the URL of an image in HTML? (HTML में छवि के URL को निर्दिष्ट करने के लिए कौन सा गुण उपयोग किया जाता है?)",
        options: [
            "src",
            "alt",
            "href",
            "link"
        ],
        answer: 0
    },
    {
        question: "13. Which attribute is used to merge cells in an HTML table? (HTML तालिका में कक्षों को जोड़ने के लिए कौन सा गुण उपयोग किया जाता है?)",
        options: [
            "colspan",
            "rowspan",
            "merge",
            "width"
        ],
        answer: 0
    },
    {
        question: "14. In HTML, which tag is used for the largest heading? (HTML में सबसे बड़े शीर्षक के लिए किस टैग का उपयोग किया जाता है?)",
        options: [
            "&lt;h1&gt;",
            "&lt;h6&gt;",
            "&lt;h3&gt;",
            "&lt;h5&gt;"
        ],
        answer: 0
    },
    {
        question: "15. Which HTML tag is used to define an unordered list? (HTML टैग में असंगठित सूची को परिभाषित करने के लिए कौन सा टैग उपयोग किया जाता है?)",
        options: [
            "&lt;ul&gt;",
            "&lt;ol&gt;",
            "&lt;li&gt;",
            "&lt;dl&gt;"
        ],
        answer: 0
    },
    {
        question: "16. Which of these languages is considered a frontend language? (इनमें से कौन सी भाषा को फ्रंटएंड भाषा माना जाता है?)",
        options: [
            "JavaScript",
            "Python",
            "Java",
            "PHP"
        ],
        answer: 0
    },
    {
        question: "17. Which language is primarily used for backend development? (प्राथमिक रूप से बैकएंड विकास के लिए कौन सी भाषा उपयोग की जाती है?)",
        options: [
            "PHP",
            "HTML",
            "CSS",
            "JavaScript"
        ],
        answer: 0
    },
    {
        question: "18. When was HTML first developed? (HTML पहली बार कब विकसित हुआ था?)",
        options: [
            "1991",
            "1989",
            "1995",
            "2000"
        ],
        answer: 0
    },
    {
        question: "19. Which HTML attribute is used to set the font color? (HTML गुण का उपयोग फॉन्ट रंग सेट करने के लिए किया जाता है?)",
        options: [
            "color",
            "font-color",
            "text-color",
            "style"
        ],
        answer: 0
    },
    {
        question: "20. Which tag is used to create a table in HTML? (HTML में एक तालिका बनाने के लिए किस टैग का उपयोग किया जाता है?)",
        options: [
            "&lt;table&gt;",
            "&lt;td&gt;",
            "&lt;tr&gt;",
            "&lt;tab&gt;"
        ],
        answer: 0
    }
];

        let currentQuestionIndex = 0;
        let userAnswers = Array(questions.length).fill(null);
        let timer;
        let totalTime = 60 * 15; // 60 minutes

        const timerElement = document.getElementById('timer');
        const questionBox = document.getElementById('question');
        const optionsBox = document.getElementById('options');
        const prevButton = document.getElementById('prev');
        const nextButton = document.getElementById('next');
        const submitButton = document.getElementById('submit');
        const resultSection = document.getElementById('result-section');
        const scoreElement = document.getElementById('score');
        const detailedResults = document.getElementById('detailed-results');

        function startTimer() {
            timer = setInterval(() => {
                totalTime--;
                const minutes = Math.floor(totalTime / 60);
                const seconds = totalTime % 60;
                timerElement.textContent = `Time Left: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

                if (totalTime <= 0) {
                    submitTest();
                }
            }, 1000);
        }

        function loadQuestion() {
            const currentQuestion = questions[currentQuestionIndex];
            questionBox.textContent = currentQuestion.question;
            optionsBox.innerHTML = '';
            currentQuestion.options.forEach((option, index) => {
                const li = document.createElement('li');
                li.innerHTML = `<input type="radio" name="option" value="${index}" id="option${index}" ${userAnswers[currentQuestionIndex] === index ? 'checked' : ''}>
                            <label for="option${index}">${option}</label>`;
                optionsBox.appendChild(li);
            });

            prevButton.disabled = currentQuestionIndex === 0;
            nextButton.disabled = currentQuestionIndex === questions.length - 1;
            if (currentQuestionIndex === questions.length - 1) {
                submitButton.style.display = 'block';
            } else {
                submitButton.style.display = 'none';
            }
        }

        function nextQuestion() {
            const selectedOption = document.querySelector('input[name="option"]:checked');
            if (selectedOption) {
                userAnswers[currentQuestionIndex] = parseInt(selectedOption.value);
                document.getElementById(`q${currentQuestionIndex + 1}`).classList.add('completed');
            }
            currentQuestionIndex++;
            loadQuestion();
        }

        function prevQuestion() {
            currentQuestionIndex--;
            loadQuestion();
        }

        function jumpToQuestion(index) {
            currentQuestionIndex = index - 1;
            loadQuestion();
        }

        function submitTest() {
            clearInterval(timer);
            
            // Save the answer for the last question if selected
            const selectedOption = document.querySelector('input[name="option"]:checked');
            if (selectedOption) {
                userAnswers[currentQuestionIndex] = parseInt(selectedOption.value);
                document.getElementById(`q${currentQuestionIndex + 1}`).classList.add('completed');
            }
            
            document.querySelector('.test-content').style.display = 'none';
            resultSection.style.display = 'block';

            let correctAnswers = 0;
            detailedResults.innerHTML = '';

            questions.forEach((question, index) => {
                const userAnswer = userAnswers[index];
                const isCorrect = userAnswer === question.answer;
                if (isCorrect) {
                    correctAnswers++;
                }

                const questionElement = document.createElement('div');
                questionElement.classList.add('result-question');
                questionElement.innerHTML = `
                <p class="${isCorrect ? 'correct' : 'incorrect'}">${question.question}</p>
                <p>Your Answer: ${userAnswer !== null ? question.options[userAnswer] : 'No Answer'}</p>
                <p>Correct Answer: ${question.options[question.answer]}</p>
            `;
                detailedResults.appendChild(questionElement);
            });

            scoreElement.textContent = `Your Score: ${correctAnswers} / ${questions.length}`;
        }

        // Start the timer when the page loads
        window.onload = () => {
            loadQuestion();
            startTimer();
        };
    </script>
<script>
async function submitTest() {
    clearInterval(timer);
    
    // Save the answer for the last question if selected
    const selectedOption = document.querySelector('input[name="option"]:checked');
    if (selectedOption) {
        userAnswers[currentQuestionIndex] = parseInt(selectedOption.value);
        document.getElementById(`q${currentQuestionIndex + 1}`).classList.add('completed');
    }
    
    document.querySelector('.test-content').style.display = 'none';
    resultSection.style.display = 'block';

    let correctAnswers = 0;
    detailedResults.innerHTML = '';

    // Display detailed results for each question
    questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.answer;
        if (isCorrect) correctAnswers++;

        const questionElement = document.createElement('div');
        questionElement.classList.add('result-question');
        questionElement.innerHTML = `
            <p class="${isCorrect ? 'correct' : 'incorrect'}">${question.question}</p>
            <p>Your Answer: ${userAnswer !== null ? question.options[userAnswer] : 'No Answer'}</p>
            <p>Correct Answer: ${question.options[question.answer]}</p>
        `;
        detailedResults.appendChild(questionElement);
    });

    const score = Math.round(correctAnswers);
    scoreElement.textContent = `Your Score: ${correctAnswers} / ${questions.length}`;

    // Save results to database
    try {
        const response = await fetch('save_result.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                score: score
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to save results');
        }
        
        const data = await response.json();
        if (data.success) {
            console.log('Results saved successfully');
        }
    } catch (error) {
        console.error('Error saving results:', error);
    }
}
</script>