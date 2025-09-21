// ======= API Setup =======
const apiKey = 'c536febb83394f52d192ec73af5c9776'; // Your API key
const weatherApiUrl = 'https://api.openweathermap.org/data/2.5/weather?units=metric&q=';
const forecastApiUrl = 'https://api.openweathermap.org/data/2.5/forecast?units=metric&q=';

// ======= DOM Elements =======
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const errorMessage = document.getElementById('error-message');

const weatherInfo = document.getElementById('weather-info');
const cityNameEl = document.getElementById('city-name');
const weatherIconEl = document.getElementById('weather-icon');
const descriptionEl = document.getElementById('description');
const temperatureEl = document.getElementById('temperature');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');

const forecastContainer = document.getElementById('forecast-container');
const forecastCards = document.getElementById('forecast-cards');

const weatherAnimation = document.getElementById('weather-animation');

const unitBtn = document.getElementById('unit-btn');

let isCelsius = true;
let currentWeatherData = null;
let currentForecastData = [];

// ======= Fetch Weather =======
async function fetchWeather(city) {
    try {
        const res = await fetch(`${weatherApiUrl}${city}&appid=${apiKey}`);
        const data = await res.json();
        if (data.cod === "404") {
            showError('City not found.');
            return;
        }
        updateWeather(data);
    } catch {
        showError('Error fetching weather data.');
    }
}

// ======= Fetch Forecast =======
async function fetchForecast(city) {
    try {
        const res = await fetch(`${forecastApiUrl}${city}&appid=${apiKey}`);
        const data = await res.json();
        if (data.cod !== "200") return;
        updateForecast(data);
    } catch { console.log('Forecast fetch error'); }
}

// ======= Update Current Weather =======
function updateWeather(data) {
    errorMessage.textContent = '';
    weatherInfo.style.display = 'block';
    currentWeatherData = data;

    const weatherMain = data.weather[0].main;

    cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
    weatherIconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    weatherIconEl.alt = data.weather[0].description;
    descriptionEl.textContent = data.weather[0].description.toUpperCase();
    updateTemperatureDisplay();
    humidityEl.textContent = data.main.humidity;
    windSpeedEl.textContent = data.wind.speed;

    updateBackground(weatherMain, data);
    updateWeatherEffects(weatherMain);
}

// ======= Update Forecast =======
function updateForecast(data) {
    forecastCards.innerHTML = '';
    forecastContainer.style.display = 'block';

    currentForecastData = data.list.filter(item => item.dt_txt.includes('12:00:00'));

    currentForecastData.forEach(day => {
        let temp = day.main.temp;
        if (!isCelsius) temp = (temp*9/5)+32;
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <p>${new Date(day.dt_txt).toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric' })}</p>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}">
            <p>${Math.round(temp)}°${isCelsius?'C':'F'}</p>
            <p>${day.weather[0].main}</p>
        `;
        forecastCards.appendChild(card);
    });
}

// ======= Show Error =======
function showError(message) {
    errorMessage.textContent = message;
    weatherInfo.style.display = 'none';
    forecastContainer.style.display = 'none';
    clearWeatherEffects();
}

// ======= Unit Toggle =======
unitBtn.addEventListener('click', () => {
    if (!currentWeatherData) return;
    isCelsius = !isCelsius;
    updateTemperatureDisplay();
    unitBtn.textContent = isCelsius ? 'Show in °F' : 'Show in °C';
});

// ======= Update Temperature Display =======
function updateTemperatureDisplay() {
    if (!currentWeatherData) return;
    let temp = currentWeatherData.main.temp;
    if (!isCelsius) temp = (temp*9/5)+32;
    temperatureEl.textContent = Math.round(temp);

    // Update forecast cards
    const cards = document.querySelectorAll('.forecast-card p:nth-child(3)');
    currentForecastData.forEach((day,index)=>{
        let dayTemp = day.main.temp;
        if(!isCelsius) dayTemp = (dayTemp*9/5)+32;
        if(cards[index]) cards[index].textContent = `${Math.round(dayTemp)}°${isCelsius?'C':'F'}`;
    });
}

// ======= Day/Night =======
function getDayOrNight(data) {
    const current = data.dt;
    const sunrise = data.sys.sunrise;
    const sunset = data.sys.sunset;
    return current >= sunrise && current <= sunset ? 'day' : 'night';
}

// ======= Update Background =======
function updateBackground(weather, data) {
    document.body.className = '';
    const condition = weather.toLowerCase();
    const time = getDayOrNight(data);

    if (condition.includes('clear')) document.body.classList.add('clear', time);
    else if (condition.includes('cloud')) document.body.classList.add('clouds', time);
    else if (condition.includes('rain') || condition.includes('drizzle')) document.body.classList.add('rain', time);
    else if (condition.includes('snow')) document.body.classList.add('snow', time);
    else if (condition.includes('thunderstorm')) document.body.classList.add('thunderstorm');
    else if (condition.includes('mist') || condition.includes('fog') || condition.includes('haze')) document.body.classList.add('mist');
    else document.body.style.background = 'linear-gradient(to right, #74ebd5, #ACB6E5)';
}

// ======= Weather Animations =======
function clearWeatherEffects() { weatherAnimation.innerHTML = ''; }

function addClouds(count=5){
    for(let i=0;i<count;i++){
        const cloud = document.createElement('div');
        cloud.className='cloud';
        cloud.style.top=`${Math.random()*50}px`;
        cloud.style.animationDuration=`${20+Math.random()*30}s`;
        cloud.style.opacity=`${Math.random()*0.5+0.5}`;
        weatherAnimation.appendChild(cloud);
    }
}

function addRain(count=50){
    const isMobile = window.innerWidth<500; 
    const finalCount = isMobile ? count/2 : count;
    for(let i=0;i<finalCount;i++){
        const drop=document.createElement('div');
        drop.className='rain-drop';
        drop.style.left=`${Math.random()*100}%`;
        drop.style.animationDuration=`${0.5+Math.random()*0.5}s`;
        drop.style.opacity=`${Math.random()*0.5+0.5}`;
        weatherAnimation.appendChild(drop);
    }
}

function addSnow(count=50){
    const isMobile = window.innerWidth<500; 
    const finalCount = isMobile ? count/2 : count;
    for(let i=0;i<finalCount;i++){
        const snow=document.createElement('div');
        snow.className='snowflake';
        snow.style.left=`${Math.random()*100}%`;
        snow.style.animationDuration=`${3+Math.random()*2}s`;
        snow.style.opacity=`${Math.random()*0.8+0.2}`;
        weatherAnimation.appendChild(snow);
    }
}

function updateWeatherEffects(weather){
    clearWeatherEffects();
    const condition=weather.toLowerCase();
    if(condition.includes('cloud')) addClouds(6);
    if(condition.includes('rain')||condition.includes('drizzle')) { addRain(100); addClouds(3);}
    if(condition.includes('snow')) { addSnow(80); addClouds(2);}
    if(condition.includes('thunderstorm')) { addRain(120); addClouds(4);}
}

// ======= Event Listeners =======
searchBtn.addEventListener('click',()=>{
    const city = cityInput.value.trim();
    if(city) { fetchWeather(city); fetchForecast(city); } 
    else showError('Please enter a city name.');
});

cityInput.addEventListener('keypress',(e)=>{ if(e.key==='Enter') searchBtn.click(); });

// ======= Geolocation =======
window.addEventListener('load', ()=>{
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(
            pos=>{
                fetchWeatherByLocation(pos.coords.latitude,pos.coords.longitude);
                fetchForecastByLocation(pos.coords.latitude,pos.coords.longitude);
            },
            ()=>showError('Geolocation denied. Enter city manually.')
        );
    } else showError('Geolocation not supported.');
});

// ======= Fetch Weather/Forecast by Location =======
function fetchWeatherByLocation(lat,lon){
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
        .then(res=>res.json()).then(data=>updateWeather(data))
        .catch(()=>showError('Unable to fetch weather.'));
}

function fetchForecastByLocation(lat,lon){
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
        .then(res=>res.json()).then(data=>updateForecast(data))
        .catch(()=>console.log('Unable to fetch forecast.'));
}
