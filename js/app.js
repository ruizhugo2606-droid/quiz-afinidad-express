(() => {
  "use strict";

  const QUESTIONS = [
    {
      text: "¿Cuál es tu combustible principal para concentrarte?",
      options: [
        "Café negro / expreso",
        "Té / Infusiones",
        "Bebida energética o refresco",
        "Pura agua mineral / natural"
      ]
    },
    {
      text: "¿Cómo prefieres trabajar en grupo?",
      options: [
        "Llamada en Google Meet / Discord mientras programamos",
        "Cada quien hace su parte en silencio y juntamos por GitHub",
        "Avances por mensajes rápidos de WhatsApp",
        "Reunirnos presencialmente para trabajar todos juntos."
      ]
    },
    {
      text: "¿Cuál es tu mayor superpoder (o defecto) al trabajar en equipo?",
      options: [
        "Desaparecer misteriosamente y aparecer con la chamba lista a última hora",
        "Sobrevivir a base de cafeína pura y puro pánico",
        "El que organiza todo y pone orden en el caos",
        "El que solo manda stickers y moral support"
      ]
    },
    {
      text: "Si el equipo fuera una película de terror, ¿qué papel te tocaría?",
      options: [
        "El que se separa del grupo por curiosidad y se muere primero",
        "El que encuentra la solución técnica pero nadie le hace caso",
        "El que grita por todo pero sobrevive de milagro",
        "El villano (el que deja los bugs para el mero día de la entrega)"
      ]
    },
    {
      text: "¿Qué harías si tu código funciona perfectamente y de repente deja de funcionar?",
      options: [
        "Reviso cada línea hasta encontrar el error.",
        "Busco el error en Google o ChatGPT.",
        "Reinicio todo esperando que se solucione mágicamente.",
        "Le echo la culpa a la computadora."
      ]
    },
    {
      text: "¿Qué situación te desespera más durante un proyecto?",
      options: [
        "Que nadie responda los mensajes.",
        "Que cambien los requisitos a última hora.",
        "Que alguien no cumpla con su parte.",
        "Que todo falle justo antes de entregar."
      ]
    }
  ];

  const RESULT_MESSAGES = [
    { min: 90, text: "¡Equipo increíble! Tienen una conexión brutal." },
    { min: 70, text: "¡Muy buena afinidad! Harán un trabajo excelente." },
    { min: 50, text: "Tienen varias cosas en común y se complementan bien." },
    { min: 30, text: "Son diferentes, pero eso aporta ideas muy variadas." },
    { min: 0, text: "¡Los opuestos se atraen! Tienen el reto de unirse más." }
  ];

  const state = {
    names: [],
    currentPlayer: 0,
    currentQuestion: 0,
    answers: [], // Matriz dinamica: [jugadorIndex][preguntaIndex]
    selected: null,
    results: null
  };

  const $ = (selector) => document.querySelector(selector);

  const dom = {
    screens: Array.from(document.querySelectorAll(".screen")),
    start: $("#btn-start"),
    registerForm: $("#register-form"),
    playerCountSelect: $("#player-count"),
    playersInputs: $("#players-inputs"),
    formError: $("#form-error"),
    quizPlayerBadge: $("#quiz-player-badge"),
    quizPlayerName: $("#quiz-player-name"),
    questionCounter: $("#question-counter"),
    progress: $("#progress"),
    progressFill: $("#progress-fill"),
    questionCard: $("#question-card"),
    questionIndex: $("#question-index"),
    questionText: $("#question-text"),
    options: $("#options"),
    answerHint: $("#answer-hint"),
    btnPrev: $("#btn-prev"),
    btnNext: $("#btn-next"),
    btnNextLabel: $("#btn-next-label"),
    handoffNextName: $("#handoff-next-name"),
    handoffBtnName: $("#handoff-btn-name"),
    btnHandoff: $("#btn-handoff"),
    finishNamesText: $("#finish-names-text"),
    btnResults: $("#btn-results"),
    affinityRing: $("#affinity-ring"),
    affinityValue: $("#affinity-value"),
    resultMessage: $("#result-message"),
    matchCount: $("#match-count"),
    diffCount: $("#diff-count"),
    comparisonTotal: $("#comparison-total"),
    comparisonList: $("#comparison-list"),
    btnRepeat: $("#btn-repeat"),
    goHomeButtons: Array.from(document.querySelectorAll("[data-go-home]"))
  };

  let affinityAnimationFrame = null;
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  function initParticles() {
    const container = document.getElementById("particles");
    if (!container) return;
    container.innerHTML = "";
    if (reduceMotionQuery.matches) return;

    const count = window.innerWidth < 640 ? 18 : 32;
    const fragment = document.createDocumentFragment();

    for (let index = 0; index < count; index += 1) {
      const particle = document.createElement("span");
      const size = 2 + Math.random() * 4;
      particle.className = "particle";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.animationDuration = `${12 + Math.random() * 18}s`;
      particle.style.animationDelay = `${-Math.random() * 30}s`;
      particle.style.setProperty("--drift", `${(Math.random() - 0.5) * 90}px`);
      particle.style.setProperty("--peak-opacity", (0.25 + Math.random() * 0.5).toFixed(2));
      fragment.appendChild(particle);
    }
    container.appendChild(fragment);
  }

  function renderPlayerInputs() {
    const count = parseInt(dom.playerCountSelect.value, 10);
    dom.playersInputs.innerHTML = "";

    for (let i = 0; i < count; i++) {
      const field = document.createElement("div");
      field.className = "field";
      field.style.marginBottom = "12px";
      field.innerHTML = `
        <label class="field-label" for="name-${i}">
          <span class="player-dot player-dot--1">${i + 1}</span>
          Participante ${i + 1}
        </label>
        <div class="input-wrap">
          <svg class="icon input-icon"><use href="#icon-user"></use></svg>
          <input type="text" id="name-${i}" name="name-${i}" placeholder="Ej. Participante ${i + 1}" autocomplete="off" maxlength="24" required>
        </div>
        <span class="field-error" id="error-name-${i}" role="alert"></span>
      `;
      dom.playersInputs.appendChild(field);
    }
  }

  function init() {
    initParticles();
    renderPlayerInputs();

    dom.playerCountSelect.addEventListener("change", renderPlayerInputs);
    dom.start.addEventListener("click", () => showScreen("register"));
    dom.registerForm.addEventListener("submit", handleRegister);
    dom.btnNext.addEventListener("click", goNext);
    dom.btnPrev.addEventListener("click", goPrevious);
    dom.options.addEventListener("keydown", handleOptionKeydown);
    dom.btnHandoff.addEventListener("click", startNextPlayerTurn);
    dom.btnResults.addEventListener("click", showResults);
    dom.btnRepeat.addEventListener("click", repeatQuiz);
    dom.goHomeButtons.forEach((button) => button.addEventListener("click", goHome));

    dom.questionCard.addEventListener("animationend", (event) => {
      if (event.target === dom.questionCard) {
        dom.questionCard.classList.remove("is-entering");
      }
    });

    showScreen("home");
  }

  function showScreen(name) {
    dom.screens.forEach((screen) => {
      const isActive = screen.dataset.screen === name;
      screen.classList.toggle("is-active", isActive);
      screen.setAttribute("aria-hidden", String(!isActive));
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function normalizeName(value) {
    return value.trim().replace(/\s+/g, " ");
  }

  function handleRegister(event) {
    event.preventDefault();
    dom.formError.textContent = "";

    const count = parseInt(dom.playerCountSelect.value, 10);
    const names = [];
    let isValid = true;

    for (let i = 0; i < count; i++) {
      const input = $(`#name-${i}`);
      const errorSpan = $(`#error-name-${i}`);
      const fieldDiv = input.closest(".field");
      const val = normalizeName(input.value);

      fieldDiv.classList.remove("has-error");
      errorSpan.textContent = "";

      if (!val) {
        fieldDiv.classList.add("has-error");
        errorSpan.textContent = `Escribe el nombre del participante ${i + 1}.`;
        isValid = false;
      } else if (names.map(n => n.toLowerCase()).includes(val.toLowerCase())) {
        fieldDiv.classList.add("has-error");
        errorSpan.textContent = "Los nombres deben ser diferentes.";
        isValid = false;
      } else {
        names.push(val);
      }
    }

    if (!isValid) return;

    state.names = names;
    resetGame();
    showScreen("quiz");
    renderQuestion();
  }

  function resetGame() {
    state.currentPlayer = 0;
    state.currentQuestion = 0;
    state.answers = Array.from({ length: state.names.length }, () => []);
    state.selected = null;
    state.results = null;
    clearQuizStage();
    dom.comparisonList.innerHTML = "";
    dom.comparisonTotal.textContent = "Análisis grupal";
    dom.matchCount.textContent = "0";
    dom.diffCount.textContent = "0";
    dom.resultMessage.textContent = "Calculando afinidad...";
    dom.affinityValue.textContent = "0%";
    dom.affinityRing.style.setProperty("--p", "0");
    cancelAffinityAnimation();
  }

  function clearQuizStage() {
    state.selected = null;
    dom.questionText.textContent = "";
    dom.questionIndex.textContent = "";
    dom.quizPlayerName.textContent = "";
    dom.options.innerHTML = "";
    dom.progressFill.style.width = "0%";
    dom.progress.setAttribute("aria-valuenow", "0");
    dom.answerHint.textContent = "Selecciona una opción para continuar";
    dom.answerHint.classList.remove("is-ready", "is-warning");
    dom.btnNext.disabled = true;
    dom.btnNextLabel.textContent = "Siguiente";
    dom.btnPrev.classList.add("is-hidden");
    dom.btnPrev.disabled = true;
  }

  function renderQuestion() {
    const question = QUESTIONS[state.currentQuestion];
    const playerIndex = state.currentPlayer;
    const questionIndex = state.currentQuestion;
    const savedAnswer = state.answers[playerIndex][questionIndex];

    state.selected = Number.isInteger(savedAnswer) ? savedAnswer : null;

    dom.quizPlayerName.textContent = state.names[playerIndex] || "Participante";
    dom.quizPlayerBadge.classList.toggle("player-badge--two", playerIndex % 2 === 1);
    dom.questionCounter.textContent = `Pregunta ${questionIndex + 1} de ${QUESTIONS.length}`;
    dom.questionIndex.textContent = String(questionIndex + 1).padStart(2, "0");
    dom.questionText.textContent = question.text;

    const progressValue = ((questionIndex + 1) / QUESTIONS.length) * 100;
    dom.progressFill.style.width = `${progressValue}%`;
    dom.progress.setAttribute("aria-valuenow", String(questionIndex + 1));

    dom.options.innerHTML = "";

    question.options.forEach((optionText, optionIndex) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "option";
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", "false");
      button.dataset.index = String(optionIndex);

      const key = document.createElement("span");
      key.className = "option-key";
      key.textContent = String.fromCharCode(65 + optionIndex);

      const text = document.createElement("span");
      text.className = "option-text";
      text.textContent = optionText;

      const check = document.createElement("span");
      check.className = "option-check";
      check.innerHTML = '<svg class="icon"><use href="#icon-check"></use></svg>';

      button.append(key, text, check);
      button.addEventListener("click", () => selectOption(optionIndex));
      dom.options.appendChild(button);
    });

    updateSelectionUI();
    updateNavigation();
    animateQuestion();
  }

  function animateQuestion() {
    dom.questionCard.classList.remove("is-entering");
    void dom.questionCard.offsetWidth;
    dom.questionCard.classList.add("is-entering");
  }

  function selectOption(optionIndex) {
    state.selected = optionIndex;
    updateSelectionUI();
  }

  function updateSelectionUI() {
    const optionElements = Array.from(dom.options.querySelectorAll(".option"));
    optionElements.forEach((option, index) => {
      const isSelected = state.selected === index;
      option.classList.toggle("is-selected", isSelected);
      option.setAttribute("aria-checked", String(isSelected));
    });

    const hasSelection = state.selected !== null;
    dom.btnNext.disabled = !hasSelection;
    dom.answerHint.classList.toggle("is-ready", hasSelection);
    dom.answerHint.classList.remove("is-warning");
    dom.answerHint.textContent = hasSelection
      ? "Respuesta seleccionada. Puedes continuar."
      : "Selecciona una opción para continuar";
  }

  function updateNavigation() {
    const isLastQuestion = state.currentQuestion === QUESTIONS.length - 1;
    const isFirstQuestion = state.currentQuestion === 0;

    if (isLastQuestion) {
      dom.btnNextLabel.textContent = state.currentPlayer < state.names.length - 1 ? "Terminar turno" : "Finalizar";
    } else {
      dom.btnNextLabel.textContent = "Siguiente";
    }

    dom.btnPrev.classList.toggle("is-hidden", isFirstQuestion);
    dom.btnPrev.disabled = isFirstQuestion;
  }

  function handleOptionKeydown(event) {
    const keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"];
    if (!keys.includes(event.key)) return;
    const optionElements = Array.from(dom.options.querySelectorAll(".option"));
    const currentIndex = optionElements.indexOf(document.activeElement);
    if (currentIndex === -1) return;

    event.preventDefault();
    let nextIndex = currentIndex;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % optionElements.length;
    } else {
      nextIndex = (currentIndex - 1 + optionElements.length) % optionElements.length;
    }
    optionElements[nextIndex].focus();
    selectOption(nextIndex);
  }

  function goNext() {
    if (state.selected === null) {
      dom.answerHint.classList.add("is-warning");
      dom.answerHint.textContent = "Primero selecciona una respuesta.";
      setTimeout(() => {
        if (state.selected === null) {
          dom.answerHint.classList.remove("is-warning");
          dom.answerHint.textContent = "Selecciona una opción para continuar";
        }
      }, 1200);
      return;
    }

    state.answers[state.currentPlayer][state.currentQuestion] = state.selected;

    // Si aún hay preguntas en el turno actual, avanzar
    if (state.currentQuestion < QUESTIONS.length - 1) {
      state.currentQuestion += 1;
      renderQuestion();
      return;
    }

    // Si es el último usuario y última pregunta, ir directo a finalizar
    if (state.currentPlayer >= state.names.length - 1) {
      showFinish();
      return;
    }

    // Si hay más jugadores, mostrar pantalla de cambio de turno (handoff)
    showHandoff();
  }

  function goPrevious() {
    if (state.currentQuestion === 0) return;
    if (state.selected !== null) {
      state.answers[state.currentPlayer][state.currentQuestion] = state.selected;
    }
    state.currentQuestion -= 1;
    renderQuestion();
  }

  function showHandoff() {
    const nextPlayerIndex = state.currentPlayer + 1;
    const nextPlayerName = state.names[nextPlayerIndex];
    clearQuizStage();

    dom.handoffNextName.textContent = nextPlayerName;
    dom.handoffBtnName.textContent = nextPlayerName;
    showScreen("handoff");
  }

  function startNextPlayerTurn() {
    state.currentPlayer += 1;
    state.currentQuestion = 0;
    state.selected = null;
    showScreen("quiz");
    renderQuestion();
  }

  function showFinish() {
    clearQuizStage();
    dom.finishNamesText.textContent = state.names.join(", ");
    showScreen("finish");
  }

  function calculateGroupAffinity(allAnswers) {
    const totalQuestions = QUESTIONS.length;
    const numPlayers = allAnswers.length;
    let totalMatches = 0;
    let totalComparisons = 0;

    for (let i = 0; i < numPlayers; i++) {
      for (let j = i + 1; j < numPlayers; j++) {
        for (let q = 0; q < totalQuestions; q++) {
          totalComparisons++;
          if (
            Number.isInteger(allAnswers[i][q]) &&
            Number.isInteger(allAnswers[j][q]) &&
            allAnswers[i][q] === allAnswers[j][q]
          ) {
            totalMatches++;
          }
        }
      }
    }

    const percent = totalComparisons > 0 ? Math.round(((totalMatches / totalComparisons) * 100) * 100) / 100 : 0;
    return {
      total: totalComparisons,
      matches: totalMatches,
      differences: totalComparisons - totalMatches,
      percent
    };
  }

  function getResultMessage(percent) {
    const match = RESULT_MESSAGES.find((item) => percent >= item.min);
    return match ? match.text : RESULT_MESSAGES[RESULT_MESSAGES.length - 1].text;
  }

  function showResults() {
    const result = calculateGroupAffinity(state.answers);
    state.results = result;

    dom.matchCount.textContent = String(result.matches);
    dom.diffCount.textContent = String(result.differences);
    dom.comparisonTotal.textContent = `${result.matches} de ${result.total} coincidencias de equipo`;
    dom.resultMessage.textContent = getResultMessage(result.percent);

    renderComparisonGrid();
    showScreen("results");
    animateAffinity(result.percent);
  }

  function renderComparisonGrid() {
    dom.comparisonList.innerHTML = "";

    QUESTIONS.forEach((question, qIndex) => {
      const item = document.createElement("article");
      item.className = "comparison-item";

      const headRow = document.createElement("div");
      headRow.className = "comparison-head-row";

      const questionWrap = document.createElement("div");
      questionWrap.className = "comparison-question";

      const number = document.createElement("span");
      number.className = "q-num";
      number.textContent = String(qIndex + 1).padStart(2, "0");

      const title = document.createElement("h4");
      title.textContent = question.text;

      questionWrap.append(number, title);
      headRow.append(questionWrap);

      const answersWrap = document.createElement("div");
      answersWrap.className = "comparison-answers";
      answersWrap.style.gridTemplateColumns = `repeat(${Math.min(state.names.length, 3)}, minmax(0, 1fr))`;

      state.names.forEach((name, pIndex) => {
        const ansIndex = state.answers[pIndex][qIndex];
        const ansText = Number.isInteger(ansIndex) ? question.options[ansIndex] : "Sin respuesta";

        const col = document.createElement("div");
        col.className = `compare-answer compare-answer--${(pIndex % 2) + 1}`;
        col.innerHTML = `
          <span class="compare-name">${name}</span>
          <span class="compare-value">${ansText}</span>
        `;
        answersWrap.appendChild(col);
      });

      item.append(headRow, answersWrap);
      dom.comparisonList.appendChild(item);
    });
  }

  function formatPercent(value) {
    const rounded = Math.round(value * 100) / 100;
    return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(2)}%`;
  }

  function animateAffinity(targetPercent) {
    cancelAffinityAnimation();
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    dom.affinityRing.style.setProperty("--p", "0");
    dom.affinityValue.textContent = "0%";

    if (prefersReducedMotion) {
      dom.affinityRing.style.setProperty("--p", String(targetPercent));
      dom.affinityValue.textContent = formatPercent(targetPercent);
      return;
    }

    const duration = 1500;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      const current = targetPercent * eased;

      dom.affinityRing.style.setProperty("--p", String(current));
      dom.affinityValue.textContent = `${Math.round(current)}%`;

      if (elapsed < 1) {
        affinityAnimationFrame = requestAnimationFrame(tick);
      } else {
        affinityAnimationFrame = null;
        dom.affinityRing.style.setProperty("--p", String(targetPercent));
        dom.affinityValue.textContent = formatPercent(targetPercent);
      }
    };

    affinityAnimationFrame = requestAnimationFrame(tick);
  }

  function cancelAffinityAnimation() {
    if (affinityAnimationFrame !== null) {
      cancelAnimationFrame(affinityAnimationFrame);
      affinityAnimationFrame = null;
    }
  }

  function repeatQuiz() {
    if (state.names.length === 0) {
      showScreen("register");
      return;
    }
    resetGame();
    showScreen("quiz");
    renderQuestion();
  }

  function goHome() {
    resetGame();
    state.names = [];
    dom.registerForm.reset();
    renderPlayerInputs();
    showScreen("home");
  }

  init();
})();