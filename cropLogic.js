// This is the single source of truth for all crop data.
// We moved it here from script.js
const CROP_REQUIREMENTS = {
  rice: { 
    tempRange: [20, 35], 
    humidityMin: 50, 
    rainfallMin: 100, 
    phRange: [5.5, 7.0],
    description: "Rice thrives in warm, humid climates with abundant water supply"
  },
  wheat: { 
    tempRange: [15, 25], 
    humidityMin: 40, 
    rainfallMin: 50, 
    phRange: [6.0, 7.5],
    description: "Wheat grows best in cool to moderate temperatures with well-drained soil"
  },
  maize: { 
    tempRange: [20, 30], 
    humidityMin: 50, 
    rainfallMin: 60, 
    phRange: [5.5, 7.5],
    description: "Maize requires warm weather and moderate rainfall during growing season"
  },
  cotton: { 
    tempRange: [21, 35], 
    humidityMin: 50, 
    rainfallMin: 50, 
    phRange: [6.0, 8.0],
    description: "Cotton needs long sunny periods and warm temperatures throughout growth"
  },
  sugarcane: { 
    tempRange: [20, 35], 
    humidityMin: 70, 
    rainfallMin: 150, 
    phRange: [6.0, 7.5],
    description: "Sugarcane demands high temperatures, humidity and heavy rainfall"
  },
  potato: { 
    tempRange: [15, 25], 
    humidityMin: 70, 
    rainfallMin: 50, 
    phRange: [5.0, 6.5],
    description: "Potatoes prefer cool temperatures and slightly acidic, well-drained soil"
  },
  tomato: { 
    tempRange: [18, 27], 
    humidityMin: 60, 
    rainfallMin: 60, 
    phRange: [6.0, 7.0],
    description: "Tomatoes need warm days, cool nights and consistent moisture levels"
  },
  soybean: { 
    tempRange: [20, 30], 
    humidityMin: 60, 
    rainfallMin: 50, 
    phRange: [6.0, 7.0],
    description: "Soybeans grow well in warm climates with adequate summer rainfall"
  },
  barley: { 
    tempRange: [12, 20], 
    humidityMin: 40, 
    rainfallMin: 40, 
    phRange: [6.5, 7.5],
    description: "Barley adapts to cooler climates and can tolerate drought conditions"
  },
  millet: { 
    tempRange: [25, 35], 
    humidityMin: 40, 
    rainfallMin: 30, 
    phRange: [5.5, 7.0],
    description: "Millet is highly drought-resistant and thrives in hot, arid conditions"
  }
};


/**
 * Recommends crops based on current conditions.
 * This function now uses the CROP_REQUIREMENTS object.
 */
function recommendCrop(temp, humidity, rainfall, ph) {
  if (!ph) return ["No soil data available"];

  /**
   * Scores a crop based on how far the current conditions are
   * from the ideal ranges. A lower score is better.
   */
  function score(cropName) {
    const req = CROP_REQUIREMENTS[cropName];
    if (!req) return Infinity; // Should not happen

    let penalty = 0; // Lower is better

    // Temperature penalty (as a percentage of the ideal range's midpoint)
    const tempMid = (req.tempRange[0] + req.tempRange[1]) / 2;
    if (temp < req.tempRange[0]) {
      penalty += (req.tempRange[0] - temp) / tempMid;
    } else if (temp > req.tempRange[1]) {
      penalty += (temp - req.tempRange[1]) / tempMid;
    }

    // Humidity penalty (percentage deviation)
    if (humidity < req.humidityMin) {
      penalty += (req.humidityMin - humidity) / req.humidityMin;
    }

    // Rainfall penalty (percentage deviation from monthly minimum)
    // We must convert the hourly rainfall average to a monthly estimate
    const monthlyRainfall = rainfall * 24 * 30;
    if (monthlyRainfall < req.rainfallMin) {
      // Avoid division by zero if rainfallMin is 0
      if (req.rainfallMin > 0) {
        penalty += (req.rainfallMin - monthlyRainfall) / req.rainfallMin;
      } else if (monthlyRainfall > 0) {
        // Penalize for *any* rain if min is 0 (unlikely case)
        penalty += 0.1; 
      }
    }

    // pH penalty (as a percentage of the ideal range's midpoint)
    const phMid = (req.phRange[0] + req.phRange[1]) / 2;
    if (ph < req.phRange[0]) {
      penalty += (req.phRange[0] - ph) / phMid;
    } else if (ph > req.phRange[1]) {
      penalty += (ph - req.phRange[1]) / phMid;
    }

    return penalty;
  }

  // Score all crops defined in CROP_REQUIREMENTS
  const scored = Object.keys(CROP_REQUIREMENTS).map(cropName => ({
    name: cropName,
    score: score(cropName)
  }));

  // Sort by score (lowest penalty is best)
  scored.sort((a, b) => a.score - b.score);

  // Return the top 3 crop names, capitalized for the UI
  return scored.slice(0, 3).map(c => {
    // Capitalize: "rice" -> "Rice"
    return c.name.charAt(0).toUpperCase() + c.name.slice(1);
  });
}

// NOTE: The extra '}' at the end of the original file has been REMOVED.