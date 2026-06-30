const form = document.querySelector("#search-form");
const input = document.querySelector("#food-search");
const title = document.querySelector("#dish-title");
const subtitle = document.querySelector("#dish-subtitle");
const thumb = document.querySelector("#dish-thumb");
const bestCard = document.querySelector("#best-card");
const platformGrid = document.querySelector("#platform-grid");
const orderButtons = document.querySelector("#order-buttons");
const recommendation = document.querySelector("#recommendation");
const nearbyNote = document.querySelector("#nearby-note");
const themeToggle = document.querySelector(".theme-toggle");
const foodOptions = document.querySelector("#food-options");
const budgetInput = document.querySelector("#budget-input");
const aiSuggestButton = document.querySelector("#ai-suggest-button");
const locationButton = document.querySelector("#location-button");
const locationStatus = document.querySelector("#location-status");
const aiScore = document.querySelector("#ai-score");
const aiScoreText = document.querySelector("#ai-score-text");
const aiReason = document.querySelector("#ai-reason");
const similarFoods = document.querySelector("#similar-foods");
const budgetMatch = document.querySelector("#budget-match");
const assistantForm = document.querySelector("#assistant-form");
const assistantInput = document.querySelector("#assistant-input");
const assistantSend = document.querySelector("#assistant-send");
const assistantChat = document.querySelector("#assistant-chat");
const assistantPrompts = document.querySelector(".assistant-prompts");
const isViteDevServer = ["5173", "5174", "5175"].includes(window.location.port);
const apiBase = isViteDevServer ? `${window.location.protocol}//${window.location.hostname}:3001` : "";

let currentFood = null;
let currentResults = [];
let currentBest = null;
let userLocation = {
  enabled: false,
  label: "your area",
  coords: null,
};

function rupees(value) {
  return `Rs. ${value}`;
}

async function getJson(url) {
  const response = await fetch(`${apiBase}${url}`);

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return response.json();
}

async function postJson(url, payload) {
  const response = await fetch(`${apiBase}${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return response.json();
}

function searchUrl(query) {
  const params = new URLSearchParams({
    food: query || "Pizza",
    budget: budgetInput.value || "200",
  });

  if (userLocation.enabled && userLocation.coords) {
    params.set("lat", userLocation.coords.latitude.toFixed(5));
    params.set("lng", userLocation.coords.longitude.toFixed(5));
  }

  return `/api/search?${params.toString()}`;
}

function locationLabel() {
  return userLocation.enabled ? userLocation.label : "your nearby area";
}

function buildNearbyText(food, best, results) {
  const fallbackPlatforms = results
    .filter((platform) => platform.id !== best.id)
    .map((platform) => platform.name)
    .join(" or ");
  const fallbackText = fallbackPlatforms ? ` If ${best.name} is not available nearby, try ${fallbackPlatforms}.` : "";
  const unavailableText = food.generated
    ? ` "${food.title}" is not in the BiteWise catalog yet, so these are closest platform search links.`
    : "";

  return `Nearby suggestion for ${locationLabel()}: start with ${best.name} for ${food.title}.${fallbackText}${unavailableText}`;
}

function renderNearbyNote(food, best, results) {
  nearbyNote.innerHTML = `
    <strong>Nearby recommendation</strong>
    <span>${buildNearbyText(food, best, results)}</span>
  `;
}

function renderRecommendation(best, food, apiRecommendation) {
  recommendation.innerHTML = `
    <strong>${apiRecommendation?.title || `${best.name} is recommended for ${food.title}.`}</strong>
    ${apiRecommendation?.text || `AI score ${best.aiScore}/100 based on price, discount, delivery speed and rating. Final price is ${rupees(best.price)}.`}
  `;
}

function renderAiInsights(food, results, best, insights) {
  const fastest = insights?.fastest || [...results].sort((a, b) => a.mins - b.mins)[0];
  const cheapest = insights?.cheapest || [...results].sort((a, b) => a.price - b.price)[0];
  const matches = insights?.budgetMatches || [];

  aiScore.textContent = best.aiScore;
  aiScoreText.textContent = `${best.name} is strongest for ${food.title} because it balances ${rupees(best.price)}, ${best.mins} min delivery and ${best.rating} rating.`;
  aiReason.textContent = `${cheapest.name} is cheapest, ${fastest.name} is fastest, and ${best.name} has the best combined AI score for this search.`;
  similarFoods.innerHTML = (insights?.similarFoods || [])
    .map((item) => `<button type="button" data-food="${item.title}">${item.title}</button>`)
    .join("");
  budgetMatch.innerHTML = matches.length
    ? matches.map(({ food: matchFood, best: matchBest }) => `${matchFood.title}: ${matchBest.name} at ${rupees(matchBest.price)}`).join("<br />")
    : `No strong matches under ${rupees(Number(budgetInput.value || 200))}. Try increasing your budget.`;
}

function renderBestCard(platform, food) {
  bestCard.innerHTML = `
    <div class="best-ribbon">BEST DEAL</div>
    <div class="best-top">
      <div class="platform-name">
        <span class="logo ${platform.id}">${platform.logo}</span>
        <div>
          <h3>${platform.name}</h3>
          <p>Recommended for ${food.title}</p>
        </div>
      </div>
      <span class="rating">${platform.rating} star</span>
    </div>
    <div class="price">${rupees(platform.price)} <del>${rupees(platform.original)}</del></div>
    <hr />
    <div class="deal-row">
      <div class="metric-row">
        <span class="metric-icon">T</span>
        <div><strong>${platform.mins} mins</strong><span>Delivery Time</span></div>
      </div>
      <div class="metric-row">
        <span class="metric-icon">%</span>
        <div><strong>${platform.offer}% OFF</strong><span>Best Offer</span></div>
      </div>
    </div>
    <p class="nearby-card-text">Recommended first near ${locationLabel()}. Check availability on ${platform.name} before ordering.</p>
    <a class="cta" href="${platform.url}" target="_blank" rel="noreferrer">Order ${food.title} on ${platform.name}</a>
  `;
}

function renderPlatformCards(results, best, food) {
  platformGrid.innerHTML = results
    .map(
      (platform) => `
        <article class="platform-card ${platform.id === best.id ? "recommended-card" : ""}" style="--platform-color: ${platform.color}">
          <div class="card-top">
            <div class="platform-name">
              <span class="logo ${platform.id}">${platform.logo}</span>
              <h3>${platform.name}</h3>
            </div>
            <span class="rating">${platform.rating} star</span>
          </div>
          <div class="price">${rupees(platform.price)} <del>${rupees(platform.original)}</del></div>
          <hr />
          <div class="deal-row">
            <div class="metric-row">
              <span class="metric-icon">T</span>
              <div><strong>${platform.mins} mins</strong><span>Delivery Time</span></div>
            </div>
            <div class="metric-row">
              <span class="metric-icon">%</span>
              <div><strong>${platform.offer}% OFF</strong><span>${platform.id === best.id ? "Recommended" : "Live Offer"}</span></div>
            </div>
          </div>
          <p class="nearby-card-text">${platform.id === best.id ? "Try this first nearby." : `Fallback option near ${locationLabel()}.`}</p>
          <a class="outline-cta" href="${platform.url}" target="_blank" rel="noreferrer">Find ${food.title} on ${platform.name}</a>
        </article>
      `
    )
    .join("");
}

function renderOrderButtons(results) {
  orderButtons.innerHTML = results
    .map(
      (platform) => `
        <a class="${platform.id}-btn" href="${platform.url}" target="_blank" rel="noreferrer">
          <span class="logo ${platform.id}">${platform.logo}</span>
          ${platform.name}
        </a>
      `
    )
    .join("");
}

function updateDish(food) {
  title.textContent = food.title;
  subtitle.textContent = `Results for ${food.title}`;
  thumb.textContent = food.short;
}

function renderError(error) {
  recommendation.innerHTML = `
    <strong>Backend connection failed.</strong>
    Start the backend with npm run backend, then search again. ${error.message}
  `;
}

function renderSearchData(data) {
  const { food, results, best, insights } = data;

  currentFood = food;
  currentResults = results;
  currentBest = best;
  input.value = food.title;
  updateDish(food);
  renderRecommendation(best, food, data.recommendation);
  renderNearbyNote(food, best, results);
  renderBestCard(best, food);
  renderPlatformCards(results, best, food);
  renderOrderButtons(results);
  renderAiInsights(food, results, best, insights);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

function scrollAssistantToLatest() {
  assistantChat.scrollTop = assistantChat.scrollHeight;
}

function addChatMessage(role, text) {
  const message = document.createElement("div");
  message.className = `chat-message ${role}`;
  message.innerHTML = `
    <div class="message-avatar" aria-hidden="true">${role === "bot" ? "BW" : "ME"}</div>
    <p>${escapeHtml(text)}</p>
  `;
  assistantChat.append(message);
  scrollAssistantToLatest();
}

function showTypingIndicator() {
  const typing = document.createElement("div");
  typing.className = "chat-message bot typing-message";
  typing.innerHTML = `
    <div class="message-avatar" aria-hidden="true">BW</div>
    <div class="typing-indicator" aria-label="Assistant is typing">
      <span></span><span></span><span></span>
    </div>
  `;
  assistantChat.append(typing);
  scrollAssistantToLatest();

  return typing;
}

async function sendAssistantMessage(prompt) {
  addChatMessage("user", prompt);
  assistantInput.value = "";
  assistantInput.disabled = true;
  assistantSend.disabled = true;
  const typing = showTypingIndicator();

  try {
    const locationPrompt = userLocation.enabled ? `${prompt} near ${userLocation.label}` : prompt;
    const data = await postJson("/api/chat", { prompt: locationPrompt });
    typing.remove();
    addChatMessage("bot", data.answer);
    if (data.search) {
      if (data.usedBudget) {
        budgetInput.value = data.usedBudget;
      }
      renderSearchData(data.search);
      addChatMessage("bot", `I updated the comparison cards for ${data.search.food.title}. ${buildNearbyText(data.search.food, data.search.best, data.search.results)}`);
    }
  } catch (error) {
    typing.remove();
    addChatMessage("bot", `I could not reach the assistant service. ${error.message}`);
  } finally {
    assistantInput.disabled = false;
    assistantSend.disabled = false;
    assistantInput.focus();
  }
}

async function render(query = "Pizza") {
  try {
    const data = await getJson(searchUrl(query));
    renderSearchData(data);
  } catch (error) {
    renderError(error);
  }
}

function requestLocation() {
  if (!("geolocation" in navigator)) {
    locationStatus.textContent = "Location is not available in this browser. Searches will still show platform options.";
    return;
  }

  locationButton.disabled = true;
  locationStatus.textContent = "Checking nearby location...";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLocation = {
        enabled: true,
        label: "your current location",
        coords: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      };
      locationStatus.textContent = "Nearby mode is on. Search and assistant answers will recommend a first platform plus fallback places.";
      locationButton.textContent = "Location on";
      render(currentFood?.title || input.value);
    },
    () => {
      userLocation = {
        enabled: false,
        label: "your area",
        coords: null,
      };
      locationStatus.textContent = "Location permission was not enabled. BiteWise will still suggest the best platform and alternatives.";
      locationButton.disabled = false;
    },
    {
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 300000,
    }
  );
}

async function renderFoodOptions() {
  try {
    const data = await getJson("/api/foods");
    foodOptions.innerHTML = data.foods.map((food) => `<option value="${food.title}"></option>`).join("");
  } catch {
    foodOptions.innerHTML = "";
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  render(input.value);
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

similarFoods.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  render(button.dataset.food);
  document.querySelector("#explore").scrollIntoView({ behavior: "smooth", block: "start" });
});

aiSuggestButton.addEventListener("click", () => {
  render(currentFood?.title || input.value);
});

locationButton.addEventListener("click", requestLocation);

budgetInput.addEventListener("change", () => {
  if (currentFood && currentResults.length && currentBest) {
    render(currentFood.title);
  }
});

assistantForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const prompt = assistantInput.value.trim();

  if (!prompt || assistantSend.disabled) {
    return;
  }

  sendAssistantMessage(prompt);
});

assistantPrompts.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button || assistantSend.disabled) {
    return;
  }

  sendAssistantMessage(button.dataset.prompt);
});

const initialFood = new URLSearchParams(window.location.search).get("food") || "Pizza";

renderFoodOptions();
render(initialFood);
