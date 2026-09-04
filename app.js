
(() => {
  const bank = window.EXAM_QUESTIONS || [];
  const $ = (id) => document.getElementById(id);

  const els = {
    setupView: $("setupView"),
    examView: $("examView"),
    resultsView: $("resultsView"),
    questionCount: $("questionCount"),
    shuffleQuestions: $("shuffleQuestions"),
    shuffleOptions: $("shuffleOptions"),
    instantFeedback: $("instantFeedback"),
    startBtn: $("startBtn"),
    quitBtn: $("quitBtn"),
    progressText: $("progressText"),
    progressBar: $("progressBar"),
    liveScore: $("liveScore"),
    sourceQuestion: $("sourceQuestion"),
    selectionRule: $("selectionRule"),
    questionText: $("questionText"),
    optionsList: $("optionsList"),
    feedback: $("feedback"),
    explanation: $("explanation"),
    checkBtn: $("checkBtn"),
    nextBtn: $("nextBtn"),
    finalPercent: $("finalPercent"),
    correctCount: $("correctCount"),
    wrongCount: $("wrongCount"),
    answeredCount: $("answeredCount"),
    reviewBtn: $("reviewBtn"),
    restartBtn: $("restartBtn"),
    themeBtn: $("themeBtn"),
  };

  let state = null;

  const shuffle = (arr) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const sameSet = (a, b) =>
    a.length === b.length && [...a].sort().every((v, i) => v === [...b].sort()[i]);

  function configureTheme() {
    const saved = localStorage.getItem("sf-sim-theme");
    if (saved) document.documentElement.dataset.theme = saved;
    els.themeBtn.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      localStorage.setItem("sf-sim-theme", next);
    });
  }

  function makeSession(sourceQuestions = null) {
    const count = Number(els.questionCount.value);
    let pool = sourceQuestions ? [...sourceQuestions] : [...bank];
    if (!sourceQuestions && els.shuffleQuestions.checked) pool = shuffle(pool);
    if (!sourceQuestions) pool = pool.slice(0, Math.min(count, pool.length));

    state = {
      questions: pool,
      index: 0,
      selected: [],
      checked: false,
      correct: 0,
      answers: [],
      instant: els.instantFeedback.checked,
      shuffleOptions: els.shuffleOptions.checked,
      optionOrders: {}
    };
  }

  function startExam(sourceQuestions = null) {
    makeSession(sourceQuestions);
    els.setupView.classList.add("hidden");
    els.resultsView.classList.add("hidden");
    els.examView.classList.remove("hidden");
    renderQuestion();
  }

  function currentQuestion() {
    return state.questions[state.index];
  }

  function getOptionOrder(q) {
    if (!state.optionOrders[q.id]) {
      const letters = Object.keys(q.options);
      state.optionOrders[q.id] = state.shuffleOptions ? shuffle(letters) : letters;
    }
    return state.optionOrders[q.id];
  }

  function renderQuestion() {
    const q = currentQuestion();
    const maxSelections = q.answer.length;
    state.selected = [];
    state.checked = false;

    els.progressText.textContent = `Pregunta ${state.index + 1} de ${state.questions.length}`;
    els.progressBar.style.width = `${((state.index + 1) / state.questions.length) * 100}%`;
    els.liveScore.textContent = state.correct;
    els.sourceQuestion.textContent = `Pregunta #${q.id}`;
    els.selectionRule.textContent = `Selecciona ${maxSelections} ${maxSelections === 1 ? "opción" : "opciones"}`;
    els.questionText.textContent = q.question;
    els.optionsList.innerHTML = "";
    els.feedback.className = "feedback hidden";
    els.explanation.className = "explanation hidden";
    els.explanation.innerHTML = "";
    els.checkBtn.classList.remove("hidden");
    els.checkBtn.disabled = true;
    els.nextBtn.classList.add("hidden");
    els.nextBtn.textContent = state.index === state.questions.length - 1 ? "Ver resultado" : "Siguiente";

    for (const letter of getOptionOrder(q)) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option";
      btn.dataset.letter = letter;
      btn.innerHTML = `<span class="option-letter">${letter}</span><span class="option-text"></span>`;
      btn.querySelector(".option-text").textContent = q.options[letter];
      btn.addEventListener("click", () => toggleOption(letter, btn));
      els.optionsList.appendChild(btn);
    }
  }

  function toggleOption(letter, btn) {
    if (state.checked) return;
    const q = currentQuestion();
    const maxSelections = q.answer.length;
    const exists = state.selected.includes(letter);

    if (exists) {
      state.selected = state.selected.filter(x => x !== letter);
      btn.classList.remove("selected");
    } else {
      if (maxSelections === 1) {
        state.selected = [letter];
        [...els.optionsList.children].forEach(x => x.classList.remove("selected"));
        btn.classList.add("selected");
      } else if (state.selected.length < maxSelections) {
        state.selected.push(letter);
        btn.classList.add("selected");
      }
    }
    els.checkBtn.disabled = state.selected.length !== maxSelections;
  }

  function checkAnswer() {
    if (state.checked || els.checkBtn.disabled) return;
    const q = currentQuestion();
    const correct = sameSet(state.selected, q.answer);
    state.checked = true;
    if (correct) state.correct += 1;

    state.answers.push({
      id: q.id,
      selected: [...state.selected],
      correct,
      expected: [...q.answer]
    });

    [...els.optionsList.children].forEach(btn => {
      const letter = btn.dataset.letter;
      btn.disabled = true;
      if (q.answer.includes(letter)) btn.classList.add("correct");
      else if (state.selected.includes(letter)) btn.classList.add("incorrect");
    });

    els.liveScore.textContent = state.correct;
    els.feedback.className = `feedback ${correct ? "good" : "bad"}`;
    els.feedback.textContent = correct
      ? "✓ Respuesta correcta"
      : `✕ Respuesta incorrecta. Respuesta correcta: ${q.answer.join(", ")}`;
    els.feedback.classList.remove("hidden");

    if (q.explanation) {
      els.explanation.innerHTML = `<strong>Explicación del archivo</strong><span></span>`;
      els.explanation.querySelector("span").textContent = q.explanation;
      els.explanation.classList.remove("hidden");
    }

    els.checkBtn.classList.add("hidden");
    els.nextBtn.classList.remove("hidden");

    if (!state.instant) {
      // Feedback remains available after checking; "instant" is kept as a setting
      // for compatibility with future exam-mode extensions.
    }
  }

  function nextQuestion() {
    if (!state.checked) return;
    if (state.index >= state.questions.length - 1) {
      showResults();
      return;
    }
    state.index += 1;
    renderQuestion();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showResults() {
    els.examView.classList.add("hidden");
    els.resultsView.classList.remove("hidden");

    const total = state.questions.length;
    const answered = state.answers.length;
    const percent = total ? Math.round((state.correct / total) * 100) : 0;

    els.finalPercent.textContent = `${percent}%`;
    els.correctCount.textContent = state.correct;
    els.wrongCount.textContent = Math.max(0, answered - state.correct);
    els.answeredCount.textContent = `${answered}/${total}`;

    const wrongIds = new Set(state.answers.filter(a => !a.correct).map(a => a.id));
    const missed = state.questions.filter(q => wrongIds.has(q.id));
    els.reviewBtn.disabled = missed.length === 0;
    els.reviewBtn.textContent = missed.length ? `Repasar incorrectas (${missed.length})` : "Sin errores";
    els.reviewBtn.onclick = () => {
      if (missed.length) startExam(missed);
    };

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restart() {
    state = null;
    els.examView.classList.add("hidden");
    els.resultsView.classList.add("hidden");
    els.setupView.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  els.startBtn.addEventListener("click", () => startExam());
  els.checkBtn.addEventListener("click", checkAnswer);
  els.nextBtn.addEventListener("click", nextQuestion);
  els.restartBtn.addEventListener("click", restart);
  els.quitBtn.addEventListener("click", showResults);

  configureTheme();
})();
