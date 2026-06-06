/* ═══════════════════════════════════════════════════════
   SANDA DOJO — script.js
   Quiz interativo com feedback automático, pontuação,
   progresso, acessibilidade e UX melhorada
═══════════════════════════════════════════════════════ */

const database = {
    sanda: {
      questions: [
        {
          q: "Qual o objetivo principal do Catch Kick no Sanda?",
          opts: ["Bloquear o ataque sem contrapartida", "Capturar a perna e executar uma projeção", "Fugir do alcance do adversário"],
          correct: 1,
          explanation: "O Catch Kick (captura de pontapé) é uma das técnicas mais características do Sanda: ao agarrar a perna do adversário, o praticante pode desequilibrá-lo e executar uma projeção (Shuai), ganhando pontos no Lei Tai."
        },
        {
          q: "O equipamento obrigatório no Sanda amador inclui:",
          opts: ["Apenas luvas de boxe", "Capacete homologado e protetor de peito", "Nenhum equipamento de proteção"],
          correct: 1,
          explanation: "No Sanda amador, o capacete e o protetor de peito (peitoral) são obrigatórios por normas de segurança. Ligaduras, caneleiras e protetor bucal também são altamente recomendados."
        },
        {
          q: "A técnica 'Shuai' refere-se a:",
          opts: ["Combinações de pontapés circulares", "Socos em linha reta (jab/direto)", "Técnicas de projeção e derrube"],
          correct: 2,
          explanation: "Shuai (摔) significa 'lançar' ou 'derrubar' em mandarim. No Sanda, as técnicas de Shuai são projeções inspiradas no Shuai Jiao (luta chinesa), que valem pontos quando o adversário toca o chão."
        },
        {
          q: "O ringue tradicional do Sanda é denominado:",
          opts: ["Tatami", "Lei Tai", "Dojo"],
          correct: 1,
          explanation: "O Lei Tai (擂台) é a plataforma elevada tradicional usada no Sanda. Historicamente era uma plataforma sem grades — cair fora do ringue também significa perda de pontos, tornando o posicionamento estratégico crucial."
        },
        {
          q: "Qual o peso aproximado das luvas de treino mais comum no Sanda?",
          opts: ["4oz – 6oz", "10oz – 12oz", "16oz – 18oz"],
          correct: 1,
          explanation: "As luvas de 10oz a 12oz são as mais usadas em treino de Sanda. Luvas mais pesadas (14–16oz) são preferidas em sparring intenso para maior proteção, enquanto as mais leves são usadas em competição profissional."
        }
      ]
    }
  };
  
  /* ── Estado do quiz ─────────────────────────── */
  let currentIndex = 0;
  let score = 0;
  let answered = false;
  let quizType = 'sanda';
  
  /* ── Iniciar quiz ───────────────────────────── */
  function startQuiz(type) {
    quizType = type;
    currentIndex = 0;
    score = 0;
    answered = false;
    renderQuiz();
  }
  
  /* ── Renderizar estrutura base ──────────────── */
  function renderQuiz() {
    const box = document.getElementById('quiz-box');
    if (!box) return;
  
    const total = database[quizType].questions.length;
  
    box.innerHTML = `
      <div id="quiz-container" role="form" aria-label="Quiz de avaliação do Módulo 1">
  
        <!-- Progresso -->
        <div class="quiz-progress" aria-label="Progresso do quiz">
          <div class="quiz-progress-header">
            <span class="quiz-progress-label" id="progress-label">Pergunta <span id="q-num">1</span> de ${total}</span>
            <span class="quiz-score-live" aria-live="polite" aria-atomic="true">
              Pontuação: <strong id="score-display">0</strong>/${total}
            </span>
          </div>
          <div class="quiz-progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="0" id="progress-bar-wrap">
            <div class="quiz-progress-fill" id="progress-fill"></div>
          </div>
        </div>
  
        <!-- Pergunta -->
        <div id="q-text" class="question" tabindex="-1" aria-live="polite"></div>
  
        <!-- Opções -->
        <div id="opt-container" role="group" aria-labelledby="q-text"></div>
  
        <!-- Feedback -->
        <div id="feedback" class="quiz-feedback" role="alert" aria-live="assertive" aria-atomic="true"></div>
  
        <!-- Explicação -->
        <div id="explanation" class="quiz-explanation" aria-live="polite"></div>
  
        <!-- Botão próxima -->
        <div class="quiz-actions">
          <button id="next-btn" class="btn-main" onclick="nextQuestion()" style="display:none" aria-label="Avançar para a próxima pergunta">
            Próxima pergunta
          </button>
        </div>
      </div>
    `;
  
    loadQuestion(quizType);
  }
  
  /* ── Carregar pergunta ──────────────────────── */
  function loadQuestion(type) {
    const questions = database[type].questions;
    const qData = questions[currentIndex];
    const total = questions.length;
  
    answered = false;
  
    // Atualizar progresso
    const pct = (currentIndex / total) * 100;
    const fill = document.getElementById('progress-fill');
    const bar  = document.getElementById('progress-bar-wrap');
    if (fill) fill.style.width = pct + '%';
    if (bar)  bar.setAttribute('aria-valuenow', currentIndex);
    const qNum = document.getElementById('q-num');
    if (qNum) qNum.textContent = currentIndex + 1;
  
    // Pergunta
    const qEl = document.getElementById('q-text');
    if (qEl) {
      qEl.textContent = qData.q;
      qEl.focus();
    }
  
    // Limpar estados anteriores
    const feedback = document.getElementById('feedback');
    if (feedback) { feedback.textContent = ''; feedback.className = 'quiz-feedback'; }
    const explanation = document.getElementById('explanation');
    if (explanation) { explanation.textContent = ''; explanation.style.display = 'none'; }
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) nextBtn.style.display = 'none';
  
    // Opções
    const container = document.getElementById('opt-container');
    if (!container) return;
    container.innerHTML = '';
  
    qData.opts.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.setAttribute('aria-label', `Opção ${i + 1}: ${opt}`);
      btn.setAttribute('data-index', i);
      btn.innerHTML = `<span class="opt-letter" aria-hidden="true">${String.fromCharCode(65 + i)}</span><span class="opt-text">${opt}</span>`;
      btn.addEventListener('click', () => checkAnswer(i, qData.correct, qData.explanation, btn));
      container.appendChild(btn);
    });
  }
  
  /* ── Verificar resposta ─────────────────────── */
  function checkAnswer(selected, correct, explanation, clickedBtn) {
    if (answered) return;
    answered = true;
  
    const isCorrect = selected === correct;
    if (isCorrect) score++;
  
    // Atualizar score display
    const scoreDisplay = document.getElementById('score-display');
    if (scoreDisplay) scoreDisplay.textContent = score;
  
    // Estilizar todos os botões
    const allBtns = document.querySelectorAll('.quiz-option');
    allBtns.forEach((btn, i) => {
      btn.disabled = true;
      btn.setAttribute('aria-disabled', 'true');
      if (i === correct) {
        btn.classList.add('correct');
        btn.setAttribute('aria-label', btn.getAttribute('aria-label') + ' — Resposta correta');
      } else if (i === selected && !isCorrect) {
        btn.classList.add('wrong');
        btn.setAttribute('aria-label', btn.getAttribute('aria-label') + ' — Resposta incorreta');
      } else {
        btn.classList.add('neutral');
      }
    });
  
    // Feedback
    const feedback = document.getElementById('feedback');
    if (feedback) {
      feedback.className = 'quiz-feedback ' + (isCorrect ? 'feedback-correct' : 'feedback-wrong');
      feedback.innerHTML = isCorrect
        ? `<span class="feedback-icon" aria-hidden="true">✓</span> <strong>Excelente!</strong> Resposta correta.`
        : `<span class="feedback-icon" aria-hidden="true">✗</span> <strong>Incorreto.</strong> A resposta certa era a opção ${String.fromCharCode(65 + correct)}.`;
    }
  
    // Explicação
    const expEl = document.getElementById('explanation');
    if (expEl && explanation) {
      expEl.style.display = 'block';
      expEl.innerHTML = `<span class="exp-icon" aria-hidden="true">💡</span> ${explanation}`;
    }
  
    // Botão próxima
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
      const total = database[quizType].questions.length;
      const isLast = currentIndex === total - 1;
      nextBtn.textContent = isLast ? 'Ver resultado final' : 'Próxima pergunta';
      nextBtn.style.display = 'inline-flex';
      nextBtn.setAttribute('aria-label', isLast ? 'Ver resultado final do quiz' : 'Avançar para a próxima pergunta');
    }
  }
  
  /* ── Próxima pergunta / Resultado ───────────── */
  function nextQuestion() {
    currentIndex++;
    const total = database[quizType].questions.length;
  
    if (currentIndex < total) {
      loadQuestion(quizType);
    } else {
      showResult(total);
    }
  }
  
  /* ── Resultado final ────────────────────────── */
  function showResult(total) {
    const pct = Math.round((score / total) * 100);
    const fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = '100%';
  
    let badge, msg;
    if (pct === 100) {
      badge = '🏆'; msg = 'Perfeito! Dominas os fundamentos do Sanda.';
    } else if (pct >= 60) {
      badge = '🥊'; msg = 'Bom trabalho! Revê as perguntas que erraste.';
    } else {
      badge = '📖'; msg = 'Continua a estudar a teoria e o vídeo — consegues!';
    }
  
    const container = document.getElementById('quiz-container');
    if (!container) return;
    container.innerHTML = `
      <div class="quiz-result" role="region" aria-label="Resultado do quiz" tabindex="-1">
        <div class="result-badge" aria-hidden="true">${badge}</div>
        <h3 class="result-title">Módulo 1 Concluído</h3>
        <div class="result-score" aria-label="Pontuação final: ${score} de ${total}">
          <span class="result-num">${score}</span>
          <span class="result-denom">/ ${total}</span>
        </div>
        <div class="result-bar-wrap" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="${pct}% de acertos">
          <div class="result-bar-fill" style="width:${pct}%"></div>
          <span class="result-pct">${pct}%</span>
        </div>
        <p class="result-msg">${msg}</p>
        <button class="btn-main" onclick="startQuiz('sanda')" aria-label="Reiniciar o quiz do Módulo 1">
          Tentar novamente
        </button>
      </div>
    `;
    container.querySelector('.quiz-result').focus();
  }