const { Events } = require("discord.js");
const fetch = require("node-fetch");
const dotenv = require("dotenv");
const { ICON_MAP } = require("./iconMap");
dotenv.config();

const { GREETING_CHANNEL_ID } = process.env;

const DAY_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  month: "long",
  day: "numeric",
});
const HOUR_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  hour: "numeric",
  minute: "numeric",
});

async function getWeatherData() {
  const url =
    "https://api.open-meteo.com/v1/forecast?latitude=44.854&longitude=-2.206&timezone=Europe/Paris&forecast_days=2&daily=apparent_temperature_min,apparent_temperature_max,sunrise,sunset,windspeed_10m_max,weathercode,precipitation_probability_mean,rain_sum,showers_sum,snowfall_sum";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Open Meteo API returned status code ${response.status}`);
  }

  const data = await response.json();
  return data;
}

async function sendWeatherReport(client) {
  const channel = client.channels.cache.get(GREETING_CHANNEL_ID);
  if (!channel) return console.error("Channel not found!");

  let weatherData = null;
  try {
    weatherData = await getWeatherData();
  } catch (e) {
    console.error(e);
  }

  const { daily } = weatherData;
  const nextDayReport = {
    icon: ICON_MAP.get(daily.weathercode[1]),
    date: DAY_FORMATTER.format(new Date(daily.time[1])),
    tempMin: daily.apparent_temperature_min[1],
    tempMax: daily.apparent_temperature_max[1],
    sunrise: HOUR_FORMATTER.format(new Date(daily.sunrise[1])),
    sunset: HOUR_FORMATTER.format(new Date(daily.sunset[1])),
    windSpeedMax: daily.windspeed_10m_max[1],
    precipProbability: daily.precipitation_probability_mean[1],
    rainSum: daily.rain_sum[1] + daily.showers_sum[1],
    snowfallSum: daily.snowfall_sum[1],
  };

  switch (nextDayReport.icon) {
    case "sun":
      nextDayReport.icon = "☀️";
      break;
    case "cloud-sun":
      nextDayReport.icon = "⛅";
      break;
    case "cloud":
      nextDayReport.icon = "☁️";
      break;
    case "cloud-showers-heavy":
      nextDayReport.icon = "🌧️";
      break;
    case "snowflake":
      nextDayReport.icon = "❄️";
      break;
    case "cloud-bolt":
      nextDayReport.icon = "🌩️";
      break;
    default:
      nextDayReport.icon = "🌡️";
      break;
  }

  let message = `📅 Demain nous serons le ${nextDayReport.date}.\n🌡️ La température minimale sera de ${nextDayReport.tempMin}°C, la maximale sera de ${nextDayReport.tempMax}°C. \n☀️ Le soleil se levera à ${nextDayReport.sunrise} et se couchera à ${nextDayReport.sunset}.\n❓ La probabilité de précipitation sera de ${nextDayReport.precipProbability}%.\n`;

  if (nextDayReport.precipProbability > 33) {
    if (nextDayReport.snowfallSum == 0) {
      message += `☂️ ${nextDayReport.rainSum} mm de pluie sont à prévoir.`;
    } else {
      message += `❄️ ${nextDayReport.snowfallSum} mm de neige sont à prévoir.`;
    }
  }

  channel.send(nextDayReport.icon);
  channel.send(message);
}

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`⛅ Weather report event registered !`);
    const hour = 16;
    const minute = 0;
    const second = 0;

    const currentTime = new Date();
    let targetTime = new Date();
    targetTime.setHours(hour, minute, second, 0);

    if (currentTime.getTime() > targetTime.getTime()) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    const timeUntilTarget = targetTime.getTime() - currentTime.getTime();
    console.log(
      `⏱️Next weather report in ${timeUntilTarget / 1000} seconds...`
    );
    setTimeout(() => {
      sendWeatherReport(client);
      setInterval(sendWeatherReport, 24 * 60 * 60 * 1000); // 24 hours interval
    }, timeUntilTarget);
  },
};
