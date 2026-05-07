const fruits = window.fruitCatalog.map((item, index) => ({
  id: index + 1,
  name: item[0],
  seasons: item[1],
  months: item[2],
  taste: item[3],
  intro: item[4],
  colors: item[5],
  pixels: item[6].map((row) => row.split("").map((cell) => Number(cell)))
}));

const monthToSeason = {
  1: "冬",
  2: "冬",
  3: "春",
  4: "春",
  5: "春",
  6: "夏",
  7: "夏",
  8: "夏",
  9: "秋",
  10: "秋",
  11: "秋",
  12: "冬"
};

const fruitGrid = document.querySelector("#fruitGrid");
const fruitCount = document.querySelector("#fruitCount");
const seasonFilter = document.querySelector("#seasonFilter");
const tasteFilter = document.querySelector("#tasteFilter");
const todayTitle = document.querySelector("#todayTitle");
const clearSelection = document.querySelector("#clearSelection");
const dateLabel = document.querySelector("#dateLabel");
const recommendTitle = document.querySelector("#recommendTitle");
const recommendReason = document.querySelector("#recommendReason");
const recommendCanvas = document.querySelector("#recommendCanvas");
const nextRecommend = document.querySelector("#nextRecommend");
const fruitSubmitForm = document.querySelector("#fruitSubmitForm");
const submitSelected = document.querySelector("#submitSelected");
const submitRecommended = document.querySelector("#submitRecommended");
const submitSeason = document.querySelector("#submitSeason");
const submitMonth = document.querySelector("#submitMonth");
const submitStatus = document.querySelector("#submitStatus");

const today = new Date();
const currentMonth = today.getMonth() + 1;
const currentSeason = monthToSeason[currentMonth];
let selected = new Set(JSON.parse(localStorage.getItem("fruitChoices") || "[]"));
let recommendedFruit = null;
let recommendOffset = 0;

dateLabel.textContent = `${currentMonth}月 · ${currentSeason}季`;
renderRecommendation();
renderFruits();
renderSelection();

seasonFilter.addEventListener("change", renderFruits);
tasteFilter.addEventListener("change", renderFruits);
clearSelection.addEventListener("click", () => {
  selected = new Set();
  saveSelection();
  renderSelection();
  renderFruits();
});
nextRecommend.addEventListener("click", () => {
  recommendOffset += 1;
  renderRecommendation();
  renderFruits();
});
fruitSubmitForm.addEventListener("submit", submitFruitChoice);

function getInSeasonFruits() {
  return fruits.filter((fruit) => fruit.months.includes(currentMonth));
}

function getFilteredFruits() {
  const season = seasonFilter.value;
  const taste = tasteFilter.value;

  return fruits.filter((fruit) => {
    const seasonMatch = season === "all" || fruit.seasons.includes(season);
    const tasteMatch = taste === "all" || fruit.taste === taste;
    return seasonMatch && tasteMatch;
  });
}

function renderRecommendation() {
  const inSeason = getInSeasonFruits();
  const pool = inSeason.length >= 5 ? inSeason : fruits.filter((fruit) => fruit.seasons.includes(currentSeason));
  const daySeed = today.getFullYear() * 10000 + currentMonth * 100 + today.getDate();
  recommendedFruit = pool[(daySeed + recommendOffset) % pool.length];

  recommendTitle.textContent = recommendedFruit.name;
  recommendReason.textContent = `${recommendedFruit.name}在${recommendedFruit.seasons.join("、")}季成熟，${currentMonth}月适合尝鲜；它的口味偏${recommendedFruit.taste}，${recommendedFruit.intro}`;
  syncSubmitFields();
  drawFruit(recommendCanvas, recommendedFruit);
}

function renderFruits() {
  const list = getFilteredFruits();
  fruitGrid.innerHTML = "";
  fruitCount.textContent = `${list.length}种`;

  if (list.length === 0) {
    fruitGrid.innerHTML = `<div class="empty">没有符合筛选条件的水果</div>`;
    return;
  }

  list.forEach((fruit) => {
    const card = document.createElement("button");
    const isSelected = selected.has(fruit.name);
    const isRecommended = recommendedFruit && recommendedFruit.name === fruit.name;
    const isSeasonal = fruit.months.includes(currentMonth);

    card.className = `fruit-card${isSelected ? " selected" : ""}${isRecommended ? " recommended" : ""}`;
    card.type = "button";
    card.setAttribute("aria-pressed", String(isSelected));
    card.innerHTML = `
      <div class="fruit-art"><canvas width="24" height="24" aria-hidden="true"></canvas></div>
      <div>
        <h3>${fruit.name}</h3>
        <div class="tags">
          ${fruit.seasons.map((season) => `<span class="tag">${season}季</span>`).join("")}
          <span class="tag">${fruit.taste}</span>
          ${isSeasonal ? `<span class="tag hot">本月应季</span>` : ""}
        </div>
        <p>${fruit.intro}</p>
      </div>
      <div class="choose-line"><span>${isSelected ? "已加入今日清单" : "点选今日想吃"}</span><span>${isRecommended ? "推荐" : ""}</span></div>
    `;
    card.addEventListener("click", () => toggleFruit(fruit.name));
    fruitGrid.append(card);
    drawFruit(card.querySelector("canvas"), fruit);
  });
}

function toggleFruit(name) {
  if (selected.has(name)) {
    selected.delete(name);
  } else {
    selected.add(name);
  }

  saveSelection();
  renderSelection();
  renderFruits();
}

function renderSelection() {
  todayTitle.textContent = selected.size === 0 ? "还没有选择水果" : [...selected].join("、");
  syncSubmitFields();
}

function saveSelection() {
  localStorage.setItem("fruitChoices", JSON.stringify([...selected]));
}

function syncSubmitFields() {
  submitSelected.value = selected.size === 0 ? "未选择" : [...selected].join("、");
  submitRecommended.value = recommendedFruit ? recommendedFruit.name : "";
  submitSeason.value = currentSeason;
  submitMonth.value = `${currentMonth}月`;
}

function submitFruitChoice(event) {
  syncSubmitFields();

  if (selected.size === 0) {
    event.preventDefault();
    submitStatus.textContent = "请先选择至少一种今日想吃的水果。";
    return;
  }

  if (window.location.protocol === "file:") {
    event.preventDefault();
    submitStatus.textContent = "本地文件模式不能发送。部署到 Netlify 后，这里会提交给你。";
    return;
  }

  event.preventDefault();
  const formData = new FormData(fruitSubmitForm);
  submitStatus.textContent = "正在提交...";

  fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(formData).toString()
  })
    .then((response) => {
      if (!response.ok) throw new Error("submit failed");
      submitStatus.textContent = "已提交，你可以在 Netlify Forms 中查看，也可以通过邮件通知接收。";
      fruitSubmitForm.reset();
      syncSubmitFields();
      window.location.href = "/success.html";
    })
    .catch(() => {
      submitStatus.textContent = "提交失败。请确认网页已部署到支持 Netlify Forms 的站点。";
    });
}

function drawFruit(canvas, fruit) {
  const context = canvas.getContext("2d");
  const size = canvas.width / 8;
  context.clearRect(0, 0, canvas.width, canvas.height);

  fruit.pixels.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === 0) return;
      context.fillStyle = fruit.colors[cell - 1];
      context.fillRect(x * size, y * size, size, size);
    });
  });
}
