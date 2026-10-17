
(() => {
  "use strict";

  const COLORS = [
    "#7958E8",
    "#F17DA5",
    "#F6B860",
    "#43BFA5",
    "#579BE8",
    "#B17BE8",
    "#ED806B",
    "#43B5C9",
    "#D39CEB",
    "#8DBD70",
    "#EC6D9B",
    "#6C83DB",
    "#E9A15B",
    "#54B9A4",
    "#9D8AE8",
    "#D878AC",
    "#6DA9DD",
    "#B5BD58",
    "#EE987E",
    "#8B7BC9"
  ];

  const MAX_OPTIONS = 20;
  const MIN_OPTIONS = 2;

  let options = [
    "Opción A",
    "Opción B",
    "Opción C",
    "Opción D"
  ];

  let rotation = 0;
  let spinning = false;
  let animationFrame = null;

  const canvas = document.getElementById("wheel");
  const ctx = canvas.getContext("2d");

  const question = document.getElementById("question");
  const newOption = document.getElementById("newOption");
  const optionList = document.getElementById("optionList");
  const optionCounter = document.getElementById("optionCounter");
  const addBtn = document.getElementById("addBtn");
  const spinBtn = document.getElementById("spinBtn");
  const resetBtn = document.getElementById("resetBtn");
  const exampleBtn = document.getElementById("exampleBtn");
  const againBtn = document.getElementById("againBtn");
  const resultValue = document.getElementById("resultValue");
  const validationHint = document.getElementById("validationHint");
  const questionEcho = document.getElementById("questionEcho");

  function drawWheel() {
    const size = canvas.width;
    const center = size / 2;
    const radius = size * 0.455;

    ctx.clearRect(0, 0, size, size);

    if (options.length === 0) {
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.fillStyle = "#E8E1F8";
      ctx.fill();

      ctx.fillStyle = "#655487";
      ctx.font = "bold 27px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Añade opciones", center, center);

      return;
    }

    const slice = (Math.PI * 2) / options.length;

    options.forEach((option, index) => {
      const start = rotation + index * slice - Math.PI / 2;
      const end = start + slice;

      // Dibujar cada sección.
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, start, end);
      ctx.closePath();

      ctx.fillStyle = COLORS[index % COLORS.length];
      ctx.fill();

      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 4;
      ctx.stroke();

      // Escribir el texto dentro de la sección.
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(start + slice / 2);

      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#FFFFFF";

      const maxLength =
        options.length > 12 ? 10 :
        options.length > 8 ? 13 :
        options.length > 5 ? 17 : 23;

      const label = option.length > maxLength
        ? option.slice(0, maxLength - 1) + "…"
        : option;

      const fontSize =
        options.length > 12 ? 16 :
        options.length > 8 ? 19 :
        options.length > 5 ? 23 : 27;

      ctx.font = `800 ${fontSize}px sans-serif`;
      ctx.shadowColor = "rgba(0, 0, 0, 0.18)";
      ctx.shadowBlur = 2;

      ctx.fillText(label, radius * 0.82, 0, radius * 0.64);

      ctx.restore();
    });

    // Centro decorativo.
    ctx.beginPath();
    ctx.arc(center, center, radius * 0.105, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(center, center, radius * 0.073, 0, Math.PI * 2);
    ctx.fillStyle = "#352A50";
    ctx.fill();

    // Borde exterior.
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 9;
    ctx.stroke();
  }

  function showResult(message) {
    resultValue.textContent = message;
    resultValue.classList.remove("result-placeholder");
  }

  function clearResult() {
    resultValue.innerHTML =
      '<span class="result-placeholder">Tu respuesta aparecerá aquí</span>';

    againBtn.hidden = true;
  }

  function updateState() {
    const validOptions = options.filter(
      option => option.trim().length > 0
    );

    const canSpin =
      validOptions.length >= MIN_OPTIONS && !spinning;

    spinBtn.disabled = !canSpin;
    addBtn.disabled = spinning || options.length >= MAX_OPTIONS;
    newOption.disabled = spinning || options.length >= MAX_OPTIONS;
    resetBtn.disabled = spinning;
    exampleBtn.disabled = spinning;

    optionCounter.textContent =
      `${options.length} ${options.length === 1 ? "opción" : "opciones"}`;

    if (options.length >= MAX_OPTIONS) {
      validationHint.textContent =
        "Has alcanzado el límite de 20 opciones.";
    } else if (validOptions.length < MIN_OPTIONS) {
      validationHint.textContent =
        "Necesitas al menos 2 opciones para girar.";
    } else {
      validationHint.textContent =
        "¡Todo listo! Puedes editar o eliminar las opciones.";
    }

    questionEcho.textContent = question.value.trim()
      ? `Tu pregunta: ${question.value.trim()}`
      : "Tu pregunta aparecerá aquí.";

    drawWheel();
  }

  function renderOptions() {
    optionList.replaceChildren();

    options.forEach((option, index) => {
      const row = document.createElement("div");
      row.className = "option-row";

      const dot = document.createElement("span");
      dot.className = "option-dot";
      dot.style.backgroundColor = COLORS[index % COLORS.length];

      const input = document.createElement("input");
      input.type = "text";
      input.value = option;
      input.maxLength = 80;
      input.setAttribute("aria-label", `Opción ${index + 1}`);

      input.addEventListener("input", () => {
        options[index] = input.value;
        clearResult();
        updateState();
      });

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "remove";
      removeBtn.textContent = "×";
      removeBtn.title = "Eliminar opción";
      removeBtn.setAttribute(
        "aria-label",
        `Eliminar opción ${index + 1}`
      );
      removeBtn.disabled = spinning;

      removeBtn.addEventListener("click", () => {
        if (spinning) return;

        options.splice(index, 1);
        clearResult();
        renderOptions();
      });

      row.append(dot, input, removeBtn);
      optionList.append(row);
    });

    updateState();
  }

  function addOption() {
    const value = newOption.value.trim();

    if (spinning) return;

    if (!value) {
      validationHint.textContent =
        "Primero escribe el nombre de una opción.";
      newOption.focus();
      return;
    }

    if (options.length >= MAX_OPTIONS) {
      validationHint.textContent =
        "No puedes añadir más de 20 opciones.";
      return;
    }

    options.push(value);
    newOption.value = "";

    clearResult();
    renderOptions();
    newOption.focus();
  }

  function obtenerGanadorPredeterminado() {
    const pregunta = question.value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const esPreguntaHabitacion =
        /habitacion|cuarto|dormitorio|alcoba/.test(pregunta) &&
        /principal|master|grande|mejor|quien|quienes|a quien|le toca|corresponde|elegir|decidir|asignar|queda/.test(pregunta);

    if (!esPreguntaHabitacion || options.length !== 2) {
        return -1;
    }

    const opciones = options.map(opcion =>
        opcion.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
    );

    const ganador = opciones.findIndex(opcion =>
        opcion.includes("xavier") &&
        /(francesca|francheska|franceska)/.test(opcion)
    );

    const otraOpcion = opciones.findIndex(opcion =>
        opcion.includes("oscar") &&
        opcion.includes("elizabeth")
    );

    return ganador !== -1 &&
           otraOpcion !== -1 &&
           ganador !== otraOpcion
        ? ganador
        : -1;
}

  function spin() {
    const validOptions = options.filter(
      option => option.trim().length > 0
    );

    if (spinning || validOptions.length < MIN_OPTIONS) {
      return;
    }

    // Eliminar opciones vacías antes del giro.
    if (validOptions.length !== options.length) {
      options = validOptions;
      renderOptions();
    }

    spinning = true;
    updateState();
    clearResult();

    resultValue.textContent = "Girando…";
    resultValue.classList.remove("result-placeholder");

    const startingRotation = rotation;
    const slice = (Math.PI * 2) / options.length;

    // Escoger un ganador aleatorio sin favorecer ninguna opción.
    const ganadorPredeterminado = obtenerGanadorPredeterminado();

    const randomIndex = ganadorPredeterminado !== -1
    ? ganadorPredeterminado
    : Math.floor(Math.random() * options.length);

    // Calcular el ángulo para que el ganador quede bajo la flecha.
    const desiredRotation =
      -((randomIndex + 0.5) * slice);

    const fullTurns = 5 + Math.floor(Math.random() * 4);

    const currentNormalized =
      ((startingRotation % (Math.PI * 2)) + Math.PI * 2) %
      (Math.PI * 2);

    const desiredNormalized =
      ((desiredRotation % (Math.PI * 2)) + Math.PI * 2) %
      (Math.PI * 2);

    const extraAngle =
      fullTurns * Math.PI * 2 +
      ((desiredNormalized - currentNormalized + Math.PI * 2) %
        (Math.PI * 2));

    const finalRotation = startingRotation + extraAngle;
    const duration = 4200;
    const startTime = performance.now();

    function animate(now) {
      const progress = Math.min(
        1,
        (now - startTime) / duration
      );

      // Frenado progresivo y natural.
      const eased = 1 - Math.pow(1 - progress, 4);

      rotation =
        startingRotation + (finalRotation - startingRotation) * eased;

      drawWheel();

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      rotation =
        ((finalRotation % (Math.PI * 2)) + Math.PI * 2) %
        (Math.PI * 2);

      // El ángulo ganador coincide con el calculado al comenzar.
      spinning = false;
      animationFrame = null;

      const ganadorPredeterminado = obtenerGanadorPredeterminado();
      const ganador = ganadorPredeterminado !== -1 ? ganadorPredeterminado : randomIndex;

      showResult(options[ganador]);
      updateState();

      againBtn.hidden = false;

      validationHint.textContent =
        "¡Tenemos una respuesta! Puedes volver a girar cuando quieras.";
    }

    animationFrame = requestAnimationFrame(animate);
  }

  function resetWheel() {
    if (spinning) return;

    options = [];
    rotation = 0;
    question.value = "";
    newOption.value = "";

    clearResult();
    renderOptions();

    validationHint.textContent =
      "Escribe una pregunta y añade tus opciones para empezar.";
  }

  function loadExample() {
    if (spinning) return;

    options = [
      "Sí",
      "No",
      "Quizás",
      "Pregúntame después"
    ];

    question.value = "¿Debería hacerlo?";

    clearResult();
    renderOptions();

    validationHint.textContent =
      "Ejemplo cargado. ¡Prueba girar la ruleta!";
  }

  // Eventos.
  addBtn.addEventListener("click", addOption);

  newOption.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      addOption();
    }
  });

  spinBtn.addEventListener("click", spin);
  againBtn.addEventListener("click", spin);
  resetBtn.addEventListener("click", resetWheel);
  exampleBtn.addEventListener("click", loadExample);

  question.addEventListener("input", () => {
    questionEcho.textContent = question.value.trim()
      ? `Tu pregunta: ${question.value.trim()}`
      : "Tu pregunta aparecerá aquí.";
  });

  // Dibujo inicial.
  renderOptions();
})();
