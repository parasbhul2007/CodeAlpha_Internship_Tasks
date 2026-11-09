const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const keypad = document.querySelector(".keypad");
let expression = "";
let justEvaluated = false;

const isOperator = char => ["+", "−", "×", "÷"].includes(char);
const pretty = value => {
  if (!Number.isFinite(value)) return "Error";
  if (Math.abs(value) < 1e-10) value = 0;
  return Number(value.toPrecision(11)).toString();
};

// Evaluates arithmetic with operator precedence, without using eval().
function calculate(input) {
  const tokens = input.match(/(?:\d+\.?\d*|\.\d+)|[+−×÷]/g);
  if (!tokens || tokens.join("") !== input.replace(/\s/g, "")) throw new Error("Invalid");
  const values = [];
  const operators = [];
  const precedence = { "+": 1, "−": 1, "×": 2, "÷": 2, "u−": 3 };
  let expectNumber = true;

  for (const token of tokens) {
    if (!isOperator(token)) {
      if (!expectNumber) throw new Error("Invalid");
      values.push(Number(token));
      expectNumber = false;
    } else {
      if (expectNumber) {
        if (token !== "−") throw new Error("Invalid");
        operators.push("u−");
        continue;
      }
      while (operators.length && precedence[operators.at(-1)] >= precedence[token]) {
        applyOperator();
      }
      operators.push(token);
      expectNumber = true;
    }
  }
  if (expectNumber) throw new Error("Incomplete");
  while (operators.length) applyOperator();
  if (values.length !== 1 || !Number.isFinite(values[0])) throw new Error("Invalid");
  return values[0];

  function applyOperator() {
    const op = operators.pop();
    const b = values.pop();
    if (b === undefined) throw new Error("Invalid");
    if (op === "u−") { values.push(-b); return; }
    const a = values.pop();
    if (a === undefined) throw new Error("Invalid");
    let answer;
    if (op === "+") answer = a + b;
    if (op === "−") answer = a - b;
    if (op === "×") answer = a * b;
    if (op === "÷") {
      if (b === 0) throw new Error("Divide by zero");
      answer = a / b;
    }
    values.push(answer);
  }
}

function updateDisplay() {
  expressionEl.textContent = expression || "0";
  if (!expression) { resultEl.textContent = "0"; return; }
  try {
    const preview = calculate(expression);
    resultEl.textContent = pretty(preview);
  } catch {
    resultEl.textContent = "—";
  }
}
function append(value) {
  if (justEvaluated && !isOperator(value)) expression = "";
  justEvaluated = false;
  if (isOperator(value)) {
    if (!expression && value !== "−") return;
    if (isOperator(expression.at(-1))) expression = expression.slice(0, -1);
    expression += value;
  } else if (value === ".") {
    const currentNumber = expression.split(/[+−×÷]/).at(-1);
    if (currentNumber.includes(".")) return;
    expression += currentNumber === "" ? "0." : ".";
  } else {
    expression += value;
  }
  updateDisplay();
}
function clearAll() { expression = ""; justEvaluated = false; updateDisplay(); }
function deleteLast() { expression = expression.slice(0, -1); justEvaluated = false; updateDisplay(); }
function toggleSign() {
  const match = expression.match(/(\d*\.?\d+)$/);
  if (!match) { append("−"); return; }
  const start = match.index;
  const before = expression.slice(0, start);
  const number = match[0];
  if (before.endsWith("−") && (before.length === 1 || isOperator(before.at(-2)))) {
    expression = before.slice(0, -1) + number;
  } else {
    expression = before + "−" + number;
  }
  updateDisplay();
}
function percent() {
  const match = expression.match(/(\d*\.?\d+)$/);
  if (!match) return;
  const replacement = pretty(Number(match[0]) / 100);
  expression = expression.slice(0, match.index) + replacement;
  updateDisplay();
}
function equals() {
  try {
    const answer = pretty(calculate(expression));
    expressionEl.textContent = expression + " =";
    expression = answer === "Error" ? "" : answer;
    resultEl.textContent = answer;
    justEvaluated = true;
  } catch {
    resultEl.textContent = "Error";
  }
}

keypad.addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.value !== undefined) append(button.dataset.value);
  if (button.dataset.action === "clear") clearAll();
  if (button.dataset.action === "delete") deleteLast();
  if (button.dataset.action === "sign") toggleSign();
  if (button.dataset.action === "percent") percent();
  if (button.dataset.action === "equals") equals();
});

document.addEventListener("keydown", event => {
  if (/^\d$/.test(event.key)) append(event.key);
  else if (event.key === ".") append(".");
  else if (event.key === "+") append("+");
  else if (event.key === "-") append("−");
  else if (event.key === "*") append("×");
  else if (event.key === "/") { event.preventDefault(); append("÷"); }
  else if (event.key === "Enter" || event.key === "=") { event.preventDefault(); equals(); }
  else if (event.key === "Backspace") deleteLast();
  else if (event.key === "Escape") clearAll();
  else if (event.key === "%") percent();
});
updateDisplay();
