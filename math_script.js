    <script>
        let currentQuestion = 0;
        let correctAnswers = 0;
        let startTime;
        let timerInterval;
        let currentLevel = 1;
        let studentName = '';
        let num1, num2, correctAnswer;

        function startQuiz() {
            const nameInput = document.getElementById('student-name');
            const errorDiv = document.getElementById('name-error');
            
            // Clear previous error
            errorDiv.style.display = 'none';
            nameInput.style.borderColor = '#1976d2';
            
            // Validate student name
            if (!nameInput.value.trim()) {
                errorDiv.style.display = 'block';
                nameInput.style.borderColor = '#d32f2f';
                nameInput.focus();
                return;
            }
            
            // If validation passes
            studentName = nameInput.value.trim();
            currentLevel = parseInt(document.getElementById('module-select').value);
            
            document.getElementById('welcome-screen').style.display = 'none';
            document.querySelector('.container').style.display = 'grid';
            
            startTime = Date.now();
            timerInterval = setInterval(updateTimer, 1000);
            generateQuestion();
        }

        function generateQuestion() {
            const max = Math.pow(10, currentLevel);
            const min = Math.pow(10, currentLevel - 1);
            num1 = Math.floor(Math.random() * (max - min)) + min;
            num2 = Math.floor(Math.random() * (max - min)) + min;
            correctAnswer = num1 + num2;
            document.getElementById('question').textContent = `${num1} + ${num2} = ?`;
        }

        function updateTimer() {
            const elapsed = Date.now() - startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            document.getElementById('timer').textContent = 
                `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        function showResults() {
            clearInterval(timerInterval);
            const elapsed = Date.now() - startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            const percentage = (correctAnswers / 20 * 100).toFixed(1);
            
            document.getElementById('results').innerHTML = `
                <h2>Results for ${studentName}</h2>
                <p>Module: ${currentLevel}-Digit Addition</p>
                <p>Time Taken: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}</p>
                <p>Correct Answers: ${correctAnswers}/20</p>
                <p>Percentage Correct: ${percentage}%</p>
                <p>Percentage Wrong: ${100 - percentage}%</p>
                <button class="btn" onclick="location.reload()">Try Again</button>
            `;
            document.querySelector('.container').style.display = 'none';
            document.getElementById('results').style.display = 'block';
        }

        // Event listeners
        document.querySelectorAll('.key:not(#backspace)').forEach(button => {
            button.addEventListener('click', (e) => {
                const input = document.getElementById('answer-input');
                input.value += e.target.dataset.value;
            });
        });

        document.getElementById('backspace').addEventListener('click', () => {
            const input = document.getElementById('answer-input');
            input.value = input.value.slice(0, -1);
        });

        document.getElementById('submit').addEventListener('click', () => {
            const userAnswer = parseInt(document.getElementById('answer-input').value) || 0;
            if (userAnswer === correctAnswer) correctAnswers++;
            document.getElementById('answer-input').value = '';
            
            currentQuestion++;
            if (currentQuestion >= 20) {
                showResults();
            } else {
                generateQuestion();
            }
        });

        // Input validation
        document.getElementById('student-name').addEventListener('input', function() {
            if (this.value.trim()) {
                document.getElementById('name-error').style.display = 'none';
                this.style.borderColor = '#1976d2';
            }
        });

        // Add history storage
        let answerHistory = [];
        let quizHistory = JSON.parse(localStorage.getItem('mathQuizHistory')) || [];

        // Modified showResults function
        function showResults() {
            clearInterval(timerInterval);
            const elapsed = Date.now() - startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            const percentage = (correctAnswers / 20 * 100).toFixed(1);
            
            // Store quiz attempt
            const quizAttempt = {
                date: new Date().toISOString(),
                name: studentName,
                level: currentLevel,
                correct: correctAnswers,
                time: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
                percentage: percentage,
                wrongAnswers: answerHistory.filter(a => !a.correct)
            };
            
            quizHistory.push(quizAttempt);
            localStorage.setItem('mathQuizHistory', JSON.stringify(quizHistory));

            // Build results display
            let wrongAnswersHTML = '';
            answerHistory.forEach((answer, index) => {
                if (!answer.correct) {
                    wrongAnswersHTML += `
                        <div class="wrong-answer">
                            Q${index + 1}: ${answer.num1} + ${answer.num2} = 
                            (Your Answer: ${answer.userAnswer}, Correct: ${answer.correctAnswer})
                        </div>
                    `;
                }
            });

            document.getElementById('results').innerHTML = `
                <h2>Results for ${studentName}</h2>
                <p>Module: ${currentLevel}-Digit Addition</p>
                <p>Time Taken: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}</p>
                <p>Correct Answers: ${correctAnswers}/20</p>
                <p>Percentage Correct: ${percentage}%</p>
                ${wrongAnswersHTML ? `
                    <div class="wrong-answers">
                        <h3>Incorrect Answers:</h3>
                        ${wrongAnswersHTML}
                    </div>
                ` : ''}
                <button class="btn" onclick="location.reload()">Try Again</button>
                <div class="toggle-history" onclick="showHistory()">View History ➔</div>
            `;
            
            document.querySelector('.container').style.display = 'none';
            document.getElementById('results').style.display = 'block';
        }

        // Add history functions
        function showHistory() {
            const historyHTML = quizHistory.map((attempt, index) => `
                <div class="history-item">
                    <strong>Attempt #${index + 1}</strong>
                    <div>Date: ${new Date(attempt.date).toLocaleString()}</div>
                    <div>Name: ${attempt.name}</div>
                    <div>Level: ${attempt.level}-digit</div>
                    <div>Score: ${attempt.correct}/20 (${attempt.percentage}%)</div>
                    <div>Time: ${attempt.time}</div>
                    ${attempt.wrongAnswers.length ? `
                        <div class="wrong-answers">
                            <div>Mistakes:</div>
                            ${attempt.wrongAnswers.map(wrong => `
                                <div class="wrong-answer">
                                    ${wrong.num1} + ${wrong.num2} = 
                                    (Your Answer: ${wrong.userAnswer}, Correct: ${wrong.correctAnswer})
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `).join('');

            document.getElementById('history').innerHTML = `
                <h2>Quiz History</h2>
                ${quizHistory.length ? historyHTML : '<p>No previous attempts found</p>'}
                <button class="btn" onclick="clearHistory()">Clear History</button>
                <div class="toggle-history" onclick="showResults()">← Back to Results</div>
            `;

            document.getElementById('results').style.display = 'none';
            document.getElementById('history').style.display = 'block';
        }

        function clearHistory() {
            localStorage.removeItem('mathQuizHistory');
            quizHistory = [];
            showHistory();
        }

        // Modified answer submission
        document.getElementById('submit').addEventListener('click', () => {
            const userAnswer = parseInt(document.getElementById('answer-input').value) || 0;
            const isCorrect = userAnswer === correctAnswer;
            
            answerHistory.push({
                num1: num1,
                num2: num2,
                correctAnswer: correctAnswer,
                userAnswer: userAnswer,
                correct: isCorrect,
                timestamp: Date.now()
            });

            if (isCorrect) correctAnswers++;
            document.getElementById('answer-input').value = '';
            
            currentQuestion++;
            if (currentQuestion >= 20) {
                showResults();
            } else {
                generateQuestion();
            }
        });


    </script>
