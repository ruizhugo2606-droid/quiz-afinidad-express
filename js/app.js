(() => {
  "use strict";

  const QUESTIONS = [
    {
      text: "¿Qué tipo de música prefieres?",
      options: ["Pop", "Rock", "Electrónica", "Regional mexicano"]
    },
    {
      text: "¿Cómo reaccionas cuando tienes mucho trabajo?",
      options: [
        "Me organizo y hago una lista",
        "Trabajo bajo presión",
        "Pido ayuda",
        "Me estreso, pero lo resuelvo"
      ]
    },
    {
      text: "¿En qué horario prefieres trabajar?",
      options: ["Por la mañana", "Por la tarde", "Por la noche", "En cualquier horario"]
    },
    {
      text: "¿Qué haces cuando surge un problema en un proyecto?",
      options: [
        "Busco una solución inmediatamente",
        "Investigo antes de actuar",
        "Consulto con mis compañeros",
        "Espero indicaciones"
      ]
    },
    {
      text: "¿Cómo prefieres trabajar?",
      options: [
        "Individualmente",
        "En equipo",
        "Depende del proyecto",
        "Me adapto a cualquier situación"
      ]
    },
    {
      text: "¿Qué valoras más en un compañero?",
      options: ["Responsabilidad", "Creatividad", "Comunicación", "Compromiso"]
    }
  ];

  const RESULT_MESSAGES = [
    { min: 90, text: "¡Equipo increíble! Tienen una gran conexión." },
    { min: 70, text: "¡Muy buena afinidad! Pueden formar un gran equipo." },
    { min: 50, text: "Tienen varias cosas en común, pero también pueden complementarse." },
    { min: 30, text: "Son diferentes, pero eso puede aportar nuevas ideas." },
    { min: 0, text: "¡Los opuestos se atraen! Tienen una oportunidad para aprender juntos." }
  ];

  const state = {
    names: ["", ""],
    currentPlayer: 0,
    currentQuestion: 0,
    answers: [[], []],
    selected: null,
    results: null
  };

  const $ = (selector) => document.querySelector(selector);

  const dom = {
    screens: Array.from(document.querySelectorAll(".screen")),
    start: $("#btn-start"),
    registerForm: $("#register-form"),
    name1: $("#name-1"),
    name2: $("#name-2"),
    field1: $("#field-name-1"),
    field2: $("#field-name-2"),
    error1: $("#error-name-1"),
    error2: $("#error-name-2"),
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
    finishName1: $("#finish-name-1"),
    finishName2: $("#finish-name-2"),
    btnResults: $("#btn-results"),
    resultName1: $("#result-name-1"),
    resultName2: $("#result-name-2"),
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

  function init() {
    dom.start.addEventListener("click", () => showScreen("register"));
    dom.registerForm.addEventListener("submit", handleRegister);
    dom.name1.addEventListener("input", () => clearFieldError(1));
    dom.name2.addEventListener("input", () => clearFieldError(2));
    dom.btnNext.addEventListener("click", goNext);
    dom.btnPrev.addEventListener("click", goPrevious);
    dom.options.addEventListener("keydown", handleOptionKeydown);
    dom.btnHandoff.addEventListener("click", startSecondPlayer);
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

    const name1 = normalizeName(dom.name1.value);
    const name2 = normalizeName(dom.name2.value);

    clearFieldError(1);
    clearFieldError(2);
    dom.formError.textContent = "";

    let isValid = true;

    if (!name1) {
      setFieldError(1, "Escribe el nombre del participante 1.");
      isValid = false;
    }

    if (!name2) {
      setFieldError(2, "Escribe el nombre del participante 2.");
      isValid = false;
    }

    if (
      name1 &&
      name2 &&
      name1.toLocaleLowerCase("es") === name2.toLocaleLowerCase("es")
    ) {
      dom.formError.textContent =
        "Los nombres deben ser diferentes para poder identificar a cada participante.";
      setFieldError(2, "Elige un nombre distinto al del participante 1.");
      isValid = false;
    }

    if (!isValid) {
      if (!name1) {
        dom.name1.focus();
      } else {
        dom.name2.focus();
      }
      return;
    }

    state.names = [name1, name2];
    resetGame();
    showScreen("quiz");
    renderQuestion();
  }

  function setFieldError(player, message) {
    const field = player === 1 ? dom.field1 : dom.field2;
    const input = player === 1 ? dom.name1 : dom.name2;
    const error = player === 1 ? dom.error1 : dom.error2;

    field.classList.add("has-error");
    input.setAttribute("aria-invalid", "true");
    error.textContent = message;
  }

  function clearFieldError(player) {
    const field = player === 1 ? dom.field1 : dom.field2;
    const input = player === 1 ? dom.name1 : dom.name2;
    const error = player === 1 ? dom.error1 : dom.error2;

    field.classList.remove("has-error");
    input.removeAttribute("aria-invalid");
    error.textContent = "";
    dom.formError.textContent = "";
  }

  function resetGame() {
    state.currentPlayer = 0;
    state.currentQuestion = 0;
    state.answers = [[], []];
    state.selected = null;
    state.results = null;
    clearQuizStage();
    dom.comparisonList.innerHTML = "";
    dom.comparisonTotal.textContent = "0 de 6 coinciden";
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
    dom.quizPlayerBadge.classList.remove("player-badge--two");
  }

  function renderQuestion() {
    const question = QUESTIONS[state.currentQuestion];
    const playerIndex = state.currentPlayer;
    const questionIndex = state.currentQuestion;
    const savedAnswer = state.answers[playerIndex][questionIndex];

    state.selected = Number.isInteger(savedAnswer) ? savedAnswer : null;

    dom.quizPlayerName.textContent = state.names[playerIndex] || "Participante";
    dom.quizPlayerBadge.classList.toggle("player-badge--two", playerIndex === 1);
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
      key.setAttribute("aria-hidden", "true");

      const text = document.createElement("span");
      text.className = "option-text";
      text.textContent = optionText;

      const check = document.createElement("span");
      check.className = "option-check";
      check.setAttribute("aria-hidden", "true");
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
      dom.btnNextLabel.textContent = state.currentPlayer === 0 ? "Terminar turno" : "Finalizar";
    } else {
      dom.btnNextLabel.textContent = "Siguiente";
    }

    dom.btnPrev.classList.toggle("is-hidden", isFirstQuestion);
    dom.btnPrev.disabled = isFirstQuestion;
  }

  function handleOptionKeydown(event) {
    const keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"];

    if (!keys.includes(event.key)) {
      return;
    }

    const optionElements = Array.from(dom.options.querySelectorAll(".option"));
    const currentIndex = optionElements.indexOf(document.activeElement);

    if (currentIndex === -1) {
      return;
    }

    event.preventDefault();

    let nextIndex = currentIndex;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % optionElements.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + optionElements.length) % optionElements.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = optionElements.length - 1;
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

    if (state.currentQuestion < QUESTIONS.length - 1) {
      state.currentQuestion += 1;
      renderQuestion();
      return;
    }

    if (state.currentPlayer === 0) {
      showHandoff();
    } else {
      showFinish();
    }
  }

  function goPrevious() {
    if (state.currentQuestion === 0) {
      return;
    }

    if (state.selected !== null) {
      state.answers[state.currentPlayer][state.currentQuestion] = state.selected;
    }

    state.currentQuestion -= 1;
    renderQuestion();
  }

  function showHandoff() {
    state.currentPlayer = 1;
    state.currentQuestion = 0;
    state.answers[1] = [];
    clearQuizStage();

    const nextPlayerName = state.names[1];
    dom.handoffNextName.textContent = nextPlayerName;
    dom.handoffBtnName.textContent = nextPlayerName;

    showScreen("handoff");
  }

  function startSecondPlayer() {
    state.currentPlayer = 1;
    state.currentQuestion = 0;
    state.selected = null;
    showScreen("quiz");
    renderQuestion();
  }

  function showFinish() {
    clearQuizStage();
    dom.finishName1.textContent = state.names[0];
    dom.finishName2.textContent = state.names[1];
    showScreen("finish");
  }

  function calculateAffinity(answers1, answers2) {
    const total = QUESTIONS.length;
    let matches = 0;

    for (let index = 0; index < total; index += 1) {
      const answer1 = answers1[index];
      const answer2 = answers2[index];

      if (Number.isInteger(answer1) && Number.isInteger(answer2) && answer1 === answer2) {
        matches += 1;
      }
    }

    const percent = Math.round(((matches / total) * 100) * 100) / 100;

    return {
      total,
      matches,
      differences: total - matches,
      percent
    };
  }

  function getResultMessage(percent) {
    const match = RESULT_MESSAGES.find((item) => percent >= item.min);
    return match ? match.text : RESULT_MESSAGES[RESULT_MESSAGES.length - 1].text;
  }

  function showResults() {
    const result = calculateAffinity(state.answers[0], state.answers[1]);
    state.results = result;

    dom.resultName1.textContent = state.names[0];
    dom.resultName2.textContent = state.names[1];
    dom.matchCount.textContent = String(result.matches);
    dom.diffCount.textContent = String(result.differences);
    dom.comparisonTotal.textContent = `${result.matches} de ${result.total} coinciden`;
    dom.resultMessage.textContent = getResultMessage(result.percent);

    renderComparison();
    showScreen("results");
    animateAffinity(result.percent);
  }

  function renderComparison() {
    dom.comparisonList.innerHTML = "";

    QUESTIONS.forEach((question, index) => {
      const answer1 = state.answers[0][index];
      const answer2 = state.answers[1][index];
      const isMatch =
        Number.isInteger(answer1) && Number.isInteger(answer2) && answer1 === answer2;

      const item = document.createElement("article");
      item.className = `comparison-item ${isMatch ? "is-match" : "is-diff"}`;

      const headRow = document.createElement("div");
      headRow.className = "comparison-head-row";

      const questionWrap = document.createElement("div");
      questionWrap.className = "comparison-question";

      const number = document.createElement("span");
      number.className = "q-num";
      number.textContent = String(index + 1).padStart(2, "0");

      const title = document.createElement("h4");
      title.textContent = question.text;

      questionWrap.append(number, title);

      const badge = document.createElement("span");
      badge.className = `result-badge ${isMatch ? "result-badge--match" : "result-badge--diff"}`;
      badge.innerHTML = isMatch
        ? '<svg class="icon" aria-hidden="true"><use href="#icon-check"></use></svg><span>Coinciden</span>'
        : '<svg class="icon" aria-hidden="true"><use href="#icon-x"></use></svg><span>Diferente</span>';

      headRow.append(questionWrap, badge);

      const answersWrap = document.createElement("div");
      answersWrap.className = "comparison-answers";

      answersWrap.append(
        createCompareAnswer(state.names[0], answer1, 1, question),
        createCompareAnswer(state.names[1], answer2, 2, question)
      );

      item.append(headRow, answersWrap);
      dom.comparisonList.appendChild(item);
    });
  }

  function createCompareAnswer(playerName, answerIndex, playerNumber, question) {
    const wrapper = document.createElement("div");
    wrapper.className = `compare-answer compare-answer--${playerNumber}`;

    const name = document.createElement("span");
    name.className = "compare-name";
    name.textContent = playerName;

    const value = document.createElement("span");
    value.className = "compare-value";
    value.textContent = Number.isInteger(answerIndex)
      ? question.options[answerIndex] || "Sin respuesta"
      : "Sin respuesta";

    wrapper.append(name, value);
    return wrapper;
  }

  function formatPercent(value) {
    const rounded = Math.round(value * 100) / 100;
    return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(2)}%`;
  }

  function animateAffinity(targetPercent) {
    cancelAffinityAnimation();

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

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
    if (!state.names[0] || !state.names[1]) {
      showScreen("register");
      return;
    }

    resetGame();
    showScreen("quiz");
    renderQuestion();
  }

  function goHome() {
    resetGame();
    state.names = ["", ""];
    dom.registerForm.reset();
    clearFieldError(1);
    clearFieldError(2);
    dom.formError.textContent = "";
    showScreen("home");
  }

  init();
})();
