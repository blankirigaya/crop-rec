
const API = {
  GEOCODING: 'https://geocoding-api.open-meteo.com/v1/search',
  WEATHER: 'https://api.open-meteo.com/v1/forecast',
  SOIL_DATA: './india_soil_ph_data.json'
};

const CHART_CONFIG = {
  PH_GAUGE: { width: 350, height: 250 },
  RAINFALL_BAR: { width: 450, height: 280 }
};
async function fetchCityList() {
  try {
    // This fetches './india_soil_ph_data.json'
    const response = await fetch(API.SOIL_DATA); 
    const data = await response.json();

    // This accesses the "soil_data" array inside your JSON
    const citySet = new Set(data.soil_data.map(item => item.city));
    allCityNames = [...citySet].sort();
  } catch (error) {
    console.error("Failed to load city list for suggestions:", error);
  }
}

let charts = {
  soil: null,
  rainfall: null
};



searchBtn.addEventListener("click", handleSearch);

//search handler

async function handleSearch() {
  suggestionsList.classList.remove('active'); // Hide suggestions
  suggestionsList.innerHTML = ''; // Clear suggestions
  
  const city = cityInput.value.trim();
  if (!city) {
    alert("Enter a city name");
    return;
  }

  try {
    const coords = await getCoordinates(city);
    if (!coords) {
      alert("City not found");
      return;
    }

    const [weather, soil] = await Promise.all([
      getWeather(coords.lat, coords.lon),
      getSoilPH(city)
    ]);

    const crops = recommendCrop(
      weather.temperature,
      weather.humidity,
      weather.rainfall,
      soil?.ph
    );

    updateUI(weather, soil, crops, city);
  } catch (error) {
    console.error("Search Error:", error);
    alert("An error occurred. Please try again.");
  }
}

// api calls

async function getCoordinates(city) {
  const url = `${API.GEOCODING}?name=${encodeURIComponent(city)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.results?.length) return null;

    return {
      lat: data.results[0].latitude,
      lon: data.results[0].longitude
    };
  } catch (error) {
    console.error("Geocoding Error:", error);
    return null;
  }
}

//weather api call
//FRAGILE CODE DO NOT MODIFY  

async function getWeather(lat, lon) {
  const url = `${API.WEATHER}?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,precipitation&current_weather=true&timezone=auto&past_days=30`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const temperature = data.current_weather?.temperature ?? 
      data.hourly?.temperature_2m?.at(-1) ?? null;
    
    const humidity = data.current_weather?.relativehumidity ?? 
      data.hourly?.relative_humidity_2m?.at(-1) ?? null;
    
    const rainfall = calculateAverageRainfall(data.hourly?.precipitation);

    return { temperature, humidity, rainfall };
  } catch (error) {
    console.error("Weather Error:", error);
    return { temperature: null, humidity: null, rainfall: 0 };
  }
}

async function getSoilPH(city) {
  try {
    const response = await fetch(API.SOIL_DATA);
    const data = await response.json();

    const match = data.soil_data.find(
      item => item.city.toLowerCase() === city.toLowerCase()
    );

    if (!match) return null;

    return {
      ph: match.pH_estimate,
      range: match.pH_range,
      confidence: match.confidence
    };
  } catch (error) {
    console.error("Soil pH Error:", error);
    return null;
  }
}


function calculateAverageRainfall(precipitationData) {
  if (!Array.isArray(precipitationData) || !precipitationData.length) {
    return 0;
  }

  const total = precipitationData.reduce((sum, val) => sum + (Number(val) || 0), 0);
  return total / precipitationData.length;
}
//emojie for the crops
function getCropEmoji(crop) {
  const emojiMap = {
    rice: "🌾", wheat: "🌾", maize: "🌽", corn: "🌽",
    millet: "🌿", barley: "🌱", cotton: "🧶", mustard: "🌻",
    sugarcane: "🍃", potato: "🥔", tomato: "🍅", onion: "🧅",
    banana: "🍌", mango: "🥭", tea: "🍵", coffee: "☕",
    soybean: "🌱", lentil: "🥣", chickpea: "🥗"
  };
  
  return emojiMap[crop?.toLowerCase()] || "🌾";
}

function updateUI(weather, soil, crops, city) {
  updateWeatherUI(weather);
  updateSoilUI(soil);
  updateCropUI(crops, weather, soil, city);
  updateCharts(soil, weather.rainfall);
}
//weather ui update
function updateWeatherUI(weather) {
  const selectors = [
    ".details p:nth-child(1) span",
    ".details p:nth-child(2) span",
    ".details p:nth-child(3) span"
  ];
  
  const values = [
    weather.temperature,
    weather.humidity,
    weather.rainfall?.toFixed(2) || 0
  ];

  selectors.forEach((selector, index) => {
    document.querySelector(selector).textContent = values[index];
  });
}
//soil ui update
function updateSoilUI(soil) {
  const container = document.querySelector(".soil-details");
  
  if (!soil) {
    container.innerHTML = `<p>No soil data found</p>`;
    return;
  }

  container.innerHTML = `
    <p>Soil pH: <span>${soil.ph}</span></p>
    <p>Range: <span>${soil.range[0]} - ${soil.range[1]}</span></p>
    <p>Confidence: <span>${soil.confidence}</span></p>
  `;
}
//crop ui update
function updateCropUI(crops, weather, soil, city) {
  const container = document.querySelector(".crop-recommendation");

  if (!Array.isArray(crops)) {
    container.innerHTML = createSingleCropCard(crops, weather, soil, city);
    return;
  }

  container.innerHTML = createMultipleCropsCard(crops, weather, soil, city);
}

function createSingleCropCard(crop, weather, soil, city) {
  const summary = generateCropSummary(crop, weather, soil, city);
  return `
    <div class="crop-card single">
      <h3>Recommended Crop for ${city}</h3>
      <div class="crop-item">
        <div class="crop-item-header">
          <span class="emoji">${getCropEmoji(crop)}</span>
          <span class="name">${crop}</span>
        </div>
        ${summary}
      </div>
    </div>
  `;
}

function createMultipleCropsCard(crops, weather, soil, city) {
  const cropItems = crops.map(crop => {
    const summary = generateCropSummary(crop, weather, soil, city);
    return `
      <li class="crop-item">
        <div class="crop-item-header">
          <span class="emoji">${getCropEmoji(crop)}</span>
          <span class="name">${crop}</span>
        </div>
        ${summary}
      </li>
    `;
  }).join("");

  return `
    <div class="crop-card">
      <h3>Top ${crops.length} Recommended Crops for ${city}</h3>
      <ol class="crop-list">${cropItems}</ol>
    </div>
  `;
}

function generateCropSummary(crop, weather, soil, city) {
  const cropKey = crop.toLowerCase();
  const requirements = CROP_REQUIREMENTS[cropKey];
  
  if (!requirements) {
    return `<div class="summary">Suitable for ${city}'s climate conditions.</div>`;
  }

  const requirementsMet = [];
  
  // Temperature check
  const tempInRange = weather.temperature >= requirements.tempRange[0] && 
                      weather.temperature <= requirements.tempRange[1];
  const tempStatus = tempInRange ? '✓' : '⚠';
  const tempColor = tempInRange ? '#81c784' : '#ffb74d';
  requirementsMet.push({
    icon: tempStatus,
    color: tempColor,
    text: `Temperature: ${weather.temperature}°C (Optimal: ${requirements.tempRange[0]}-${requirements.tempRange[1]}°C)`,
    met: tempInRange
  });
  
  // Humidity check
  const humidityOk = weather.humidity >= requirements.humidityMin;
  const humidityStatus = humidityOk ? '✓' : '⚠';
  const humidityColor = humidityOk ? '#81c784' : '#ffb74d';
  requirementsMet.push({
    icon: humidityStatus,
    color: humidityColor,
    text: `Humidity: ${weather.humidity}% (Minimum: ${requirements.humidityMin}%)`,
    met: humidityOk
  });
  
  // Rainfall check
  const rainfallValue = (weather.rainfall * 24 * 30).toFixed(1); // Convert to monthly estimate
  const rainfallOk = weather.rainfall * 24 * 30 >= requirements.rainfallMin;
  const rainfallStatus = rainfallOk ? '✓' : '⚠';
  const rainfallColor = rainfallOk ? '#81c784' : '#ffb74d';
  requirementsMet.push({
    icon: rainfallStatus,
    color: rainfallColor,
    text: `Rainfall: ~${rainfallValue}mm/month (Minimum: ${requirements.rainfallMin}mm/month)`,
    met: rainfallOk
  });
  
//ph checks 
  if (soil) {
    const phOk = soil.ph >= requirements.phRange[0] && soil.ph <= requirements.phRange[1];
    const phStatus = phOk ? '✓' : '⚠';
    const phColor = phOk ? '#81c784' : '#ffb74d';
    requirementsMet.push({
      icon: phStatus,
      color: phColor,
      text: `Soil pH: ${soil.ph} (Optimal: ${requirements.phRange[0]}-${requirements.phRange[1]})`,
      met: phOk
    });
  }
  
  const requirementsHTML = requirementsMet.map(req => `
    <li class="requirement-item">
      <span class="requirement-icon" style="color: ${req.color}">${req.icon}</span>
      <span class="requirement-text">${req.text}</span>
    </li>
  `).join('');
  
  const metCount = requirementsMet.filter(r => r.met).length;
  const suitabilityText = metCount === requirementsMet.length 
    ? 'Excellent match for this region!' 
    : metCount >= requirementsMet.length - 1
    ? 'Good match with minor adjustments needed'
    : 'Possible with proper management';
  
  return `
    <div class="summary">
      <p style="margin-bottom: 8px; font-weight: 600; color: #a5d6a7;">${requirements.description}</p>
      <p style="margin-bottom: 10px; color: #c8e6c9; font-size: 0.85rem;"><em>${suitabilityText}</em></p>
      <ul class="requirement-list">
        ${requirementsHTML}
      </ul>
    </div>
  `;
}

//chart stuff start here

function updateCharts(soil, rainfall) {
  destroyCharts();
  createGaugeChart(soil);
  createBarChart(rainfall);
}

function destroyCharts() {
  Object.values(charts).forEach(chart => chart?.destroy());
}

function createGaugeChart(soil) {
  const container = document.querySelector('.ph-graph');
  
  if (!soil) {
    container.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">No soil data available</p>';
    return;
  }

  const { width, height } = CHART_CONFIG.PH_GAUGE;
  container.innerHTML = `<canvas id="phChart" width="${width}" height="${height}"></canvas>`;
  
  const ctx = document.getElementById('phChart').getContext('2d');
  const phValue = soil.ph;

  charts.soil = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [phValue, 14 - phValue],
        backgroundColor: [getPhColor(phValue), '#e8f5e9'],
        borderWidth: 0,
        circumference: 180,
        rotation: 270
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: true,
      cutout: '75%',
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
        title: {
          display: true,
          text: 'Soil pH Level',
          font: { size: 18, weight: 'bold', family: 'Arial' },
          color: '#2d5f2e',
          padding: { top: 10, bottom: 15 }
        }
      }
    },
    plugins: [createGaugeTextPlugin(phValue)]
  });
}

function createGaugeTextPlugin(phValue) {
  return {
    id: 'gaugeText',
    afterDraw: (chart) => {
      const ctx = chart.ctx;
      const { left, right, top, bottom } = chart.chartArea;
      const centerX = left + (right - left) / 2;
      const centerY = top + (bottom - top) / 2 + 25;
      
      ctx.save();
      
      // Main pH value
      ctx.font = 'bold 52px Arial';
      ctx.fillStyle = '#2d5f2e';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(phValue.toFixed(1), centerX, centerY);
      
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = getPhColor(phValue);
      ctx.fillText(getPhCategory(phValue), centerX, centerY + 35);

      drawScaleMarkers(ctx, centerX, centerY, (right - left) / 2);
      
      ctx.restore();
    }
  };
}

function drawScaleMarkers(ctx, centerX, centerY, radius) {
  ctx.font = '11px Arial';
  ctx.fillStyle = '#666';
  
  const startAngle = -Math.PI;
  const endAngle = 0;
  
  for (let i = 0; i <= 14; i += 2) {
    const angle = startAngle + (i / 14) * (endAngle - startAngle);
    const x = centerX + Math.cos(angle) * (radius + 15);
    const y = centerY + Math.sin(angle) * (radius + 15);
    ctx.fillText(i.toString(), x, y);
  }
}


//chart stuff using chart.js
//change color if you see fit

function createBarChart(rainfall) {
  const container = document.querySelector('.rainfall-chart');
  const { width, height } = CHART_CONFIG.RAINFALL_BAR;
  
  container.innerHTML = `<canvas id="rainfallChart" width="${width}" height="${height}"></canvas>`;
  
  const ctx = document.getElementById('rainfallChart').getContext('2d');
  const rainfallValue = rainfall || 0;

  charts.rainfall = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['No Rain\n(0mm)', 'Light\n(0-2.5mm)', 'Moderate\n(2.5-10mm)', 'Heavy\n(10-50mm)', 'Very Heavy\n(50+mm)'],
      datasets: [{
        label: 'Rainfall Category',
        data: getRainfallCategoryData(rainfallValue),
        backgroundColor: ['#b0bec5', '#81c784', '#4caf50', '#2e7d32', '#1b5e20'],
        borderColor: '#fff',
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 50
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
          title: {
            display: true,
            text: 'Rainfall (mm/hour)',
            font: { size: 14, weight: 'bold', family: 'Arial' },
            color: '#2d5f2e',
            padding: { top: 0, bottom: 10 }
          },
          ticks: { color: '#555', font: { size: 11 } }
        },
        x: {
          grid: { display: false, drawBorder: false },
          ticks: { color: '#555', font: { size: 11 } }
        }
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: `Average Hourly Rainfall: ${rainfallValue.toFixed(2)}mm`,
          font: { size: 18, weight: 'bold', family: 'Arial' },
          color: '#2d5f2e',
          padding: { top: 10, bottom: 20 }
        },
        tooltip: {
          backgroundColor: 'rgba(45, 95, 46, 0.9)',
          titleFont: { size: 13, weight: 'bold' },
          bodyFont: { size: 12 },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: () => `Current: ${rainfallValue.toFixed(2)}mm/hr`
          }
        }
      }
    }
  });
}

function getRainfallCategoryData(value) {
  return [
    value === 0 ? value + 0.5 : 0,
    value > 0 && value <= 2.5 ? value : 0,
    value > 2.5 && value <= 10 ? value : 0,
    value > 10 && value <= 50 ? value : 0,
    value > 50 ? value : 0
  ];
}

//color stuff idk

function getPhColor(ph) {
  if (ph < 4.5) return '#e74c3c';
  if (ph < 6.0) return '#e67e22';
  if (ph < 6.8) return '#f39c12';
  if (ph <= 7.2) return '#2ecc71';
  if (ph <= 8.0) return '#3498db';
  return '#9b59b6';
}

function getPhCategory(ph) {
  if (ph < 4.5) return 'Highly Acidic';
  if (ph < 6.0) return 'Acidic';
  if (ph < 6.8) return 'Slightly Acidic';
  if (ph <= 7.2) return 'Neutral';
  if (ph <= 8.0) return 'Slightly Alkaline';
  return 'Alkaline';
}

// --- Autocomplete Suggestion Logic ---

/**
 * Fetches the list of city names from the JSON data on page load
 * to populate the autocomplete suggestions.
 */
async function fetchCityList() {
  try {
    const response = await fetch(API.SOIL_DATA); // Uses your JSON file
    const data = await response.json();
    // Use a Set to get unique city names from your file's structure
    const citySet = new Set(data.soil_data.map(item => item.city));
    allCityNames = [...citySet].sort();
  } catch (error) {
    console.error("Failed to load city list for suggestions:", error);
  }
}

/**
 * Displays the filtered suggestions in the dropdown list.
 * @param {string[]} suggestions - Array of city names to display.
 * @param {string} inputValue - The text the user typed, for highlighting.
 */
function showSuggestions(suggestions, inputValue) {
  suggestionsList.innerHTML = ''; // Clear old suggestions
  
  if (suggestions.length === 0) {
    suggestionsList.classList.remove('active');
    return;
  }

  suggestions.forEach(city => {
    const li = document.createElement('li');
    
    // Create the highlighted text
    const regex = new RegExp(inputValue, 'gi'); // 'gi' = global, case-insensitive
    const highlightedText = city.replace(regex, (match) => `<span class="suggestion-highlight">${match}</span>`);
    li.innerHTML = highlightedText;
    
    // Add click event to select a suggestion
    li.addEventListener('click', () => {
      cityInput.value = city; // Set input value to clicked city
      suggestionsList.classList.remove('active'); // Hide list
      suggestionsList.innerHTML = ''; // Clear list
      handleSearch(); // Automatically trigger the search
    });
    
    suggestionsList.appendChild(li);
  });

  suggestionsList.classList.add('active'); // Show the list
}

// --- Event Listeners for Autocomplete ---

// Listen for user typing in the city input
cityInput.addEventListener('input', () => {
  const inputValue = cityInput.value.trim().toLowerCase();
  
  // Only show suggestions if 2 or more characters are typed
  if (inputValue.length < 2) {
    suggestionsList.classList.remove('active');
    suggestionsList.innerHTML = '';
    return;
  }

  // Filter city names based on user input
  const filteredSuggestions = allCityNames.filter(city => 
    city.toLowerCase().includes(inputValue)
  ).slice(0, 10); // Limit to 10 suggestions

  showSuggestions(filteredSuggestions, inputValue);
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.autocomplete-wrapper')) {
    suggestionsList.classList.remove('active');
  }
});

fetchCityList();