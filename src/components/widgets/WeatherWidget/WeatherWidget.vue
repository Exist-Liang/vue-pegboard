<template>
  <div class="weather-widget" :class="weatherTheme">
    <div v-if="loading" class="weather-loading">Loading...</div>
    <div v-else-if="error" class="weather-error">{{ error }}</div>
    <div class="weather-content" :style="textColorStyle">
      <div class="weather-updated">Updated: {{ lastUpdated }}</div>
      <div class="weather-emoji">{{ weatherEmoji }}</div>
      <div class="weather-temp">{{ temperature }}°C</div>
      <div class="weather-desc">{{ description }}</div>
      <div class="weather-city">{{ city }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  city: {
    type: String,
    required: true
  }
})

const city = computed(() => props.city)
const API_KEY = '46c641c991500a16bf25a469631b4a5a'

const temperature = ref('')
const description = ref('')
const weatherEmoji = ref('⛅')
const weatherTheme = ref('default')
const loading = ref(true)
const error = ref('')
const lastUpdated = ref('')

const fetchWeather = async () => {
  if (!city.value) return
  loading.value = true
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.value)}&appid=${API_KEY}&units=metric`
    )
    if (!res.ok) throw new Error('Failed to fetch weather data')
    const data = await res.json()

    const main = data.weather[0].main
    temperature.value = Math.round(data.main.temp)
    description.value = main
    weatherEmoji.value = mapWeatherToEmoji(main)
    weatherTheme.value = mapWeatherToTheme(main)

    const now = new Date()
    lastUpdated.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch (err) {
    error.value = '❌ Error fetching weather'
  } finally {
    loading.value = false
  }
}

// ⏱ 监听城市变化并自动刷新
watch(city, () => {
  fetchWeather()
}, { immediate: true })

setInterval(fetchWeather, 30 * 60 * 1000)

const mapWeatherToEmoji = (main) => {
  switch (main) {
    case 'Clear': return '☀️'
    case 'Clouds': return '☁️'
    case 'Rain': return '🌧️'
    case 'Drizzle': return '🌦️'
    case 'Thunderstorm': return '⛈️'
    case 'Snow': return '❄️'
    case 'Mist': return '🌫️'
    default: return '⛅'
  }
}

const mapWeatherToTheme = (main) => {
  switch (main) {
    case 'Clear': return 'sunny'
    case 'Clouds': return 'cloudy'
    case 'Rain':
    case 'Drizzle': return 'rainy'
    case 'Thunderstorm': return 'stormy'
    case 'Snow': return 'snowy'
    default: return 'default'
  }
}

const textColorStyle = computed(() => {
  const theme = weatherTheme.value
  switch (theme) {
    case 'sunny': return { color: '#3e2723' }      // 深棕
    case 'cloudy': return { color: '#263238' }     // 石墨蓝
    case 'rainy': return { color: '#ffffff' }      // 白色
    case 'snowy': return { color: '#37474f' }      // 深灰蓝
    case 'stormy': return { color: '#f5f5f5' }      // 极浅灰
    case 'default': return { color: '#eeeeee' }    // 柔和浅灰
    default: return { color: '#ffffff' }
  }
})
</script>

<style scoped>
.weather-widget {
  min-width: 120px;
  max-width: 120px;
  max-height: 240px;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  color: white;
  text-align: center;
  font-family: sans-serif;
  background: inherit;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
}

.weather-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.weather-widget.sunny {
  background: linear-gradient(to top right, #fbc02d, #ff9800);
}
.weather-widget.cloudy {
  background: linear-gradient(to top right, #90a4ae, #cfd8dc);
}
.weather-widget.rainy {
  background: linear-gradient(to top right, #4fc3f7, #0288d1);
}
.weather-widget.snowy {
  background: linear-gradient(to top right, #e0f7fa, #b2ebf2);
}
.weather-widget.stormy {
  background: linear-gradient(to top right, #616161, #212121);
}
.weather-widget.default {
  background: linear-gradient(to top right, #bdbdbd, #757575);
}

.weather-emoji {
  font-size: 2.4rem;
  margin-bottom: 0.5rem;
}
.weather-temp {
  font-size: 1.5rem;
  font-weight: bold;
}
.weather-desc {
  font-size: 1rem;
  margin-top: 0.2rem;
}
.weather-city {
  font-size: 0.85rem;
  opacity: 0.85;
  margin-top: 0.25rem;
}
.weather-updated {
  font-size: 0.7rem;
  opacity: 0.7;
  margin-top: 0.3rem;
}

.weather-loading,
.weather-error {
  font-size: 1rem;
  color: #fff;
}
</style>