Crop Recommendation & Weather Insights Platform (Agritech)

A smart web platform that helps farmers decide which crops to plant by analyzing weather, soil conditions, and nutrient profiles of their region.
The platform combines OpenWeatherMap data, FAO SoilGrids data, and pre-defined crop thresholds to generate accurate, regional crop suggestions.

🎯 Objective

Empower farmers with data-driven decisions by providing:

Real-time weather updates (rainfall, temperature, humidity).

Soil insights (pH, nutrients, organic carbon).

Crop recommendations aligned to climate and soil needs.

A simple visual dashboard showing all insights together.

✨ Key Features

🌦 Weather Insights (OpenWeatherMap)
Live rainfall, temperature, wind, humidity.

🌱 Soil Data (FAO SoilGrids API)
Soil pH, nutrient levels, clay/silt percentage.

🧮 Crop Recommendation Engine
Uses defined rules & thresholds like:

Rice → high rainfall + low temperature

Wheat → moderate rainfall + neutral pH

Millets → drought-friendly low rainfall regions

Sugarcane → high soil nutrients + warm climate

📊 Dashboard View
Visual cards/charts for:

Rainfall & Temperature

Soil pH

Best Recommended Crops

🗺 Location-based Inputs
Farmers can search using their district/city/pincode or coordinates.

📱 Fully Responsive UI
Works on all devices — from mobile to desktop.

🧰 Tech Stack
Core

JavaScript

HTML

CSS

JSON

APIs

OpenWeatherMap API
https://openweathermap.org/api

FAO SoilGrids API
https://data.apps.fao.org/catalog/dataset/soilgrids

Tools

Postman (API Testing)

Git + GitHub (Version Control)

📂 Project Structure

croplogic.js

index.html

india_soil_ph_data.json

script.js

style.css

/assets
    field-sense.png

README.md
package.json (optional if using npm)

⚙ Installation & Running Locally

Follow these steps to run the project on your machine:

1️⃣ Clone the Repository
git clone https://github.com/your-username/crop-recommendation-platform.git
cd crop-recommendation-platform

2️⃣ Open the Project

If it’s a pure HTML-CSS-JS project, simply open:

index.html


in your browser.

OR use VS Code Live Server.

3️⃣ Set Your Environment Variables

Create a file named config.js (or use .env if running with a local server):

export const OPENWEATHER_API_KEY = "your-api-key-here";
export const SOILGRID_API_URL = "https://rest.isric.org/soilgrids/v2.0/properties/query";

4️⃣ Testing API Endpoints (Optional)

Use Postman to test:

Weather
GET https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}

SoilGrids
GET https://rest.isric.org/soilgrids/v2.0/properties/query?lon={lon}&lat={lat}&property=phh2o

▶ Running Without a Backend

Since this project uses frontend JS:

Just open index.html

All API calls run directly from the browser

No backend/server is required

If you still want a simple server:

npx serve


or

live-server

📸 Screenshots (Add Later)

Add:

Weather Dashboard

Soil pH Visualization

Crop Recommendation Cards

🧩 Future Enhancements

ML-based real-time crop prediction

Offline mode for rural use

Support for multiple languages

Farmer login & saved history

SMS alerts for rainfall

🙋 Contributing

Fork this repository

Create your feature branch

Commit with a clear message

Open a Pull Request

🧡 Credits

OpenWeatherMap for live weather data

FAO SoilGrids for soil parameters

Icons from Flaticon (optional)

UI design inspired by agritech dashboards


CONTRIBUTERS 

PUSHKAR PRANAY KULKARNI:- API AND CHARTING 

GARVIIIT:- FRONTEND AND 