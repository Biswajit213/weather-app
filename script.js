// Weather App JavaScript

class WeatherApp {
    constructor() {
        // Tomorrow.io API configuration
        this.API_KEY = 'jxUerOJ7mTsxTCXdDpmjQdfo62y3NtEN'; // Your Tomorrow.io API key
        this.BASE_URL = 'https://api.tomorrow.io/v4';
        
        // Temperature unit (celsius by default)
        this.currentUnit = 'celsius';
        this.currentWeatherData = null;

        // Map related properties
        this.map = null;
        this.mapVisible = false;
        this.currentMarker = null;
        this.currentCoordinates = null;
        
        // Initialize the app
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateDateTime();
        
        // Check if API key is set
        if (this.API_KEY === 'YOUR_API_KEY_HERE') {
            this.showError('Please set your Tomorrow.io API key in script.js');
        }
    }

    bindEvents() {
        // Search button click
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.handleSearch();
        });

        // Enter key press in input field
        document.getElementById('locationInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        // Current location button
        document.getElementById('currentLocationBtn').addEventListener('click', () => {
            this.getCurrentLocation();
        });

        // Temperature unit toggle
        document.getElementById('celsiusBtn').addEventListener('click', () => {
            this.switchTemperatureUnit('celsius');
        });

        document.getElementById('fahrenheitBtn').addEventListener('click', () => {
            this.switchTemperatureUnit('fahrenheit');
        });

        // Retry button
        document.getElementById('retryBtn').addEventListener('click', () => {
            this.hideError();
            document.getElementById('locationInput').focus();
        });

        // Map toggle button
        document.getElementById('toggleMapBtn').addEventListener('click', () => {
            this.toggleMap();
        });

        // Map control buttons
        document.getElementById('satelliteBtn').addEventListener('click', () => {
            this.switchMapLayer('satellite');
        });

        document.getElementById('terrainBtn').addEventListener('click', () => {
            this.switchMapLayer('terrain');
        });
    }

    async handleSearch() {
        const location = document.getElementById('locationInput').value.trim();
        
        if (!location) {
            this.showError('Please enter a city name');
            return;
        }

        if (this.API_KEY === 'YOUR_API_KEY_HERE') {
            this.showError('Please set your Tomorrow.io API key in script.js');
            return;
        }

        try {
            this.showLoading();
            const weatherData = await this.fetchWeatherByCity(location);
            this.displayWeather(weatherData);
        } catch (error) {
            this.showError(error.message);
        }
    }

    async getCurrentLocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by this browser');
            return;
        }

        if (this.API_KEY === 'YOUR_API_KEY_HERE') {
            this.showError('Please set your Tomorrow.io API key in script.js');
            return;
        }

        this.showLoading();

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;

                    // Get weather data
                    const weatherData = await this.fetchWeatherByCoords(latitude, longitude);

                    // Get actual city name using reverse geocoding
                    try {
                        const reverseGeocodeUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
                        const locationResponse = await fetch(reverseGeocodeUrl);

                        if (locationResponse.ok) {
                            const locationData = await locationResponse.json();
                            weatherData.location = {
                                name: locationData.city || locationData.locality || locationData.principalSubdivision || 'Current Location',
                                country: locationData.countryName || locationData.countryCode || ''
                            };
                        } else {
                            weatherData.location = { name: 'Current Location', country: '' };
                        }
                    } catch (geocodeError) {
                        // If reverse geocoding fails, use fallback
                        weatherData.location = { name: 'Current Location', country: '' };
                    }

                    // Add coordinates to weather data
                    weatherData.coordinates = {
                        lat: latitude,
                        lng: longitude
                    };

                    this.displayWeather(weatherData);
                } catch (error) {
                    this.showError(error.message);
                }
            },
            (error) => {
                let errorMessage = 'Unable to retrieve your location';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied by user';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out';
                        break;
                }
                this.showError(errorMessage);
            }
        );
    }

    async fetchWeatherByCity(city) {
        // Use free geocoding service to get coordinates, then use Tomorrow.io for weather
        try {
            // First try to get coordinates using a free geocoding service
            const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

            const geocodeResponse = await fetch(geocodeUrl);
            if (!geocodeResponse.ok) {
                throw new Error('Geocoding service unavailable');
            }

            const geocodeData = await geocodeResponse.json();
            if (!geocodeData.results || geocodeData.results.length === 0) {
                throw new Error('City not found. Please check the spelling and try again.');
            }

            const { latitude, longitude, name, country } = geocodeData.results[0];

            // Get weather data from Tomorrow.io using coordinates
            const weatherData = await this.fetchWeatherByCoords(latitude, longitude);

            // Add location info and coordinates to weather data
            weatherData.location = {
                name: name,
                country: country
            };
            weatherData.coordinates = {
                lat: latitude,
                lng: longitude
            };

            return weatherData;
        } catch (error) {
            throw error;
        }
    }

    async fetchWeatherByCoords(lat, lon) {
        const url = `${this.BASE_URL}/weather/realtime?location=${lat},${lon}&apikey=${this.API_KEY}&units=metric`;
        return await this.fetchWeatherData(url);
    }

    async fetchWeatherData(url) {
        try {
            const response = await fetch(url);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Location not found. Please check the spelling and try again.');
                } else if (response.status === 401) {
                    throw new Error('Invalid API key. Please check your Tomorrow.io API key.');
                } else if (response.status === 403) {
                    throw new Error('API access denied. Please check your Tomorrow.io subscription.');
                } else {
                    throw new Error(`Weather service error: ${response.status}`);
                }
            }

            const data = await response.json();
            return data;
        } catch (error) {
            if (error.name === 'TypeError') {
                throw new Error('Network error. Please check your internet connection.');
            }
            throw error;
        }
    }

    displayWeather(data) {
        this.currentWeatherData = data;

        // Tomorrow.io data structure: data.data.values contains the weather values
        const values = data.data.values;
        const location = data.location || {};

        // Store coordinates for map
        this.currentCoordinates = data.coordinates || null;

        // Update location information (with safety checks)
        const cityNameElement = document.getElementById('cityName');
        const countryNameElement = document.getElementById('countryName');
        if (cityNameElement) cityNameElement.textContent = location.name || 'Current Location';
        if (countryNameElement) countryNameElement.textContent = location.country || '';

        // Update weather icon based on weather code
        const weatherCode = values.weatherCode || 1000;
        const iconUrl = this.getWeatherIcon(weatherCode);
        const weatherIconElement = document.getElementById('weatherIcon');
        if (weatherIconElement) {
            weatherIconElement.src = iconUrl;
            weatherIconElement.alt = this.getWeatherDescription(weatherCode);
        }

        // Update temperature
        this.updateTemperatureDisplay(values.temperature);

        // Update weather description
        const weatherMainElement = document.getElementById('weatherMain');
        const weatherDescElement = document.getElementById('weatherDescription');
        if (weatherMainElement) weatherMainElement.textContent = this.getWeatherMain(weatherCode);
        if (weatherDescElement) weatherDescElement.textContent = this.getWeatherDescription(weatherCode);

        // Update weather details
        this.updateWeatherDetails(data);

        // Update map location name (with safety check)
        const mapLocationElement = document.getElementById('mapLocationName');
        if (mapLocationElement) {
            mapLocationElement.textContent = location.name || 'this location';
        }

        // Show weather section
        this.showWeather();
    }

    updateTemperatureDisplay(tempCelsius) {
        const tempElement = document.getElementById('temperature');
        const feelsLikeElement = document.getElementById('feelsLike');

        if (tempElement) {
            if (this.currentUnit === 'celsius') {
                tempElement.textContent = `${Math.round(tempCelsius)}°`;
                if (this.currentWeatherData && this.currentWeatherData.data && feelsLikeElement) {
                    const feelsLike = this.currentWeatherData.data.values.temperatureApparent;
                    feelsLikeElement.textContent = `${Math.round(feelsLike)}°C`;
                }
            } else {
                const tempFahrenheit = (tempCelsius * 9/5) + 32;
                tempElement.textContent = `${Math.round(tempFahrenheit)}°`;
                if (this.currentWeatherData && this.currentWeatherData.data && feelsLikeElement) {
                    const feelsLike = this.currentWeatherData.data.values.temperatureApparent;
                    const feelsLikeFahrenheit = (feelsLike * 9/5) + 32;
                    feelsLikeElement.textContent = `${Math.round(feelsLikeFahrenheit)}°F`;
                }
            }
        }
    }

    updateWeatherDetails(data) {
        const values = data.data.values;

        // Feels like temperature (already handled in updateTemperatureDisplay)
        this.updateTemperatureDisplay(values.temperature);

        // Humidity
        const humidityElement = document.getElementById('humidity');
        if (humidityElement) {
            humidityElement.textContent = `${Math.round(values.humidity)}%`;
        }

        // Wind speed
        const windSpeedElement = document.getElementById('windSpeed');
        if (windSpeedElement) {
            const windSpeedKmh = values.windSpeed ? values.windSpeed.toFixed(1) : 'N/A';
            windSpeedElement.textContent = `${windSpeedKmh} km/h`;
        }

        // Pressure
        const pressureElement = document.getElementById('pressure');
        if (pressureElement) {
            const pressure = values.pressureSeaLevel ? Math.round(values.pressureSeaLevel) : 'N/A';
            pressureElement.textContent = `${pressure} hPa`;
        }

        // Visibility
        const visibilityElement = document.getElementById('visibility');
        if (visibilityElement) {
            const visibilityKm = values.visibility ? values.visibility.toFixed(1) : 'N/A';
            visibilityElement.textContent = `${visibilityKm} km`;
        }

        // UV Index
        const uvIndexElement = document.getElementById('uvIndex');
        if (uvIndexElement) {
            const uvIndex = values.uvIndex ? Math.round(values.uvIndex) : 'N/A';
            uvIndexElement.textContent = uvIndex;
        }
    }

    switchTemperatureUnit(unit) {
        this.currentUnit = unit;

        // Update button states (with safety checks)
        const celsiusBtn = document.getElementById('celsiusBtn');
        const fahrenheitBtn = document.getElementById('fahrenheitBtn');

        if (celsiusBtn) celsiusBtn.classList.toggle('active', unit === 'celsius');
        if (fahrenheitBtn) fahrenheitBtn.classList.toggle('active', unit === 'fahrenheit');

        // Update temperature display if weather data is available
        if (this.currentWeatherData && this.currentWeatherData.data && this.currentWeatherData.data.values) {
            this.updateTemperatureDisplay(this.currentWeatherData.data.values.temperature);
        }
    }

    updateDateTime() {
        const now = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        const currentDateElement = document.getElementById('currentDate');
        if (currentDateElement) {
            currentDateElement.textContent = now.toLocaleDateString('en-US', options);
        }
    }

    showLoading() {
        this.hideAllSections();
        document.getElementById('loadingSection').style.display = 'block';
    }

    showError(message) {
        this.hideAllSections();
        document.getElementById('errorText').textContent = message;
        document.getElementById('errorSection').style.display = 'block';
    }

    hideError() {
        document.getElementById('errorSection').style.display = 'none';
    }

    showWeather() {
        this.hideAllSections();
        document.getElementById('weatherSection').style.display = 'block';
    }

    hideAllSections() {
        document.getElementById('loadingSection').style.display = 'none';
        document.getElementById('errorSection').style.display = 'none';
        document.getElementById('weatherSection').style.display = 'none';
    }

    // Helper methods for Tomorrow.io weather codes
    getWeatherIcon(weatherCode) {
        // Map Tomorrow.io weather codes to appropriate icons
        const iconMap = {
            1000: 'https://cdn-icons-png.flaticon.com/512/869/869869.png', // Clear
            1100: 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png', // Mostly Clear
            1101: 'https://cdn-icons-png.flaticon.com/512/414/414927.png', // Partly Cloudy
            1102: 'https://cdn-icons-png.flaticon.com/512/414/414927.png', // Mostly Cloudy
            1001: 'https://cdn-icons-png.flaticon.com/512/414/414825.png', // Cloudy
            2000: 'https://cdn-icons-png.flaticon.com/512/1146/1146869.png', // Fog
            4000: 'https://cdn-icons-png.flaticon.com/512/3313/3313998.png', // Drizzle
            4001: 'https://cdn-icons-png.flaticon.com/512/3313/3313998.png', // Rain
            4200: 'https://cdn-icons-png.flaticon.com/512/3313/3313998.png', // Light Rain
            4201: 'https://cdn-icons-png.flaticon.com/512/2675/2675876.png', // Heavy Rain
            5000: 'https://cdn-icons-png.flaticon.com/512/642/642102.png', // Snow
            5001: 'https://cdn-icons-png.flaticon.com/512/642/642102.png', // Flurries
            5100: 'https://cdn-icons-png.flaticon.com/512/642/642102.png', // Light Snow
            5101: 'https://cdn-icons-png.flaticon.com/512/642/642102.png', // Heavy Snow
            6000: 'https://cdn-icons-png.flaticon.com/512/1146/1146860.png', // Freezing Drizzle
            6001: 'https://cdn-icons-png.flaticon.com/512/1146/1146860.png', // Freezing Rain
            6200: 'https://cdn-icons-png.flaticon.com/512/1146/1146860.png', // Light Freezing Rain
            6201: 'https://cdn-icons-png.flaticon.com/512/1146/1146860.png', // Heavy Freezing Rain
            7000: 'https://cdn-icons-png.flaticon.com/512/1146/1146860.png', // Ice Pellets
            8000: 'https://cdn-icons-png.flaticon.com/512/1779/1779927.png', // Thunderstorm
        };

        return iconMap[weatherCode] || iconMap[1000]; // Default to clear sky
    }

    getWeatherMain(weatherCode) {
        const mainMap = {
            1000: 'Clear',
            1100: 'Mostly Clear',
            1101: 'Partly Cloudy',
            1102: 'Mostly Cloudy',
            1001: 'Cloudy',
            2000: 'Fog',
            4000: 'Drizzle',
            4001: 'Rain',
            4200: 'Light Rain',
            4201: 'Heavy Rain',
            5000: 'Snow',
            5001: 'Flurries',
            5100: 'Light Snow',
            5101: 'Heavy Snow',
            6000: 'Freezing Drizzle',
            6001: 'Freezing Rain',
            6200: 'Light Freezing Rain',
            6201: 'Heavy Freezing Rain',
            7000: 'Ice Pellets',
            8000: 'Thunderstorm',
        };

        return mainMap[weatherCode] || 'Clear';
    }

    getWeatherDescription(weatherCode) {
        const descriptionMap = {
            1000: 'Clear sky',
            1100: 'Mostly clear sky',
            1101: 'Partly cloudy',
            1102: 'Mostly cloudy',
            1001: 'Cloudy',
            2000: 'Fog',
            4000: 'Drizzle',
            4001: 'Rain',
            4200: 'Light rain',
            4201: 'Heavy rain',
            5000: 'Snow',
            5001: 'Flurries',
            5100: 'Light snow',
            5101: 'Heavy snow',
            6000: 'Freezing drizzle',
            6001: 'Freezing rain',
            6200: 'Light freezing rain',
            6201: 'Heavy freezing rain',
            7000: 'Ice pellets',
            8000: 'Thunderstorm',
        };

        return descriptionMap[weatherCode] || 'Clear sky';
    }

    // Map functionality methods
    toggleMap() {
        const mapContainer = document.getElementById('weatherMap');
        const mapInfo = document.getElementById('mapInfo');
        const toggleBtn = document.getElementById('toggleMapBtn');
        const satelliteBtn = document.getElementById('satelliteBtn');
        const terrainBtn = document.getElementById('terrainBtn');

        if (!this.mapVisible) {
            // Show map
            if (this.currentCoordinates) {
                mapContainer.style.display = 'block';
                mapInfo.style.display = 'block';
                satelliteBtn.style.display = 'inline-flex';
                terrainBtn.style.display = 'inline-flex';

                toggleBtn.innerHTML = '<i class="fas fa-times"></i><span>Hide Map</span>';
                toggleBtn.classList.add('active');

                this.initializeMap();
                this.mapVisible = true;
            } else {
                this.showError('No location data available for map display');
            }
        } else {
            // Hide map
            mapContainer.style.display = 'none';
            mapInfo.style.display = 'none';
            satelliteBtn.style.display = 'none';
            terrainBtn.style.display = 'none';

            toggleBtn.innerHTML = '<i class="fas fa-map"></i><span>Show Map</span>';
            toggleBtn.classList.remove('active');

            if (this.map) {
                this.map.remove();
                this.map = null;
            }
            this.mapVisible = false;
        }
    }

    initializeMap() {
        if (!this.currentCoordinates) return;

        const { lat, lng } = this.currentCoordinates;

        // Initialize map
        this.map = L.map('weatherMap').setView([lat, lng], 10);

        // Add default tile layer (OpenStreetMap)
        this.currentTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Add marker for weather location
        const weatherIcon = L.divIcon({
            className: 'weather-marker',
            html: '<i class="fas fa-map-marker-alt" style="color: #e74c3c; font-size: 24px;"></i>',
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        });

        this.currentMarker = L.marker([lat, lng], { icon: weatherIcon })
            .addTo(this.map)
            .bindPopup(`
                <div style="text-align: center; padding: 10px;">
                    <h4 style="margin: 0 0 10px 0; color: #2d3436;">
                        ${this.currentWeatherData.location?.name || 'Weather Location'}
                    </h4>
                    <p style="margin: 0; color: #636e72;">
                        <strong>${Math.round(this.currentWeatherData.data.values.temperature)}°C</strong><br>
                        ${this.getWeatherDescription(this.currentWeatherData.data.values.weatherCode)}
                    </p>
                </div>
            `)
            .openPopup();

        // Add click event to map
        this.map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            console.log(`Clicked at: ${lat}, ${lng}`);
        });
    }

    switchMapLayer(layerType) {
        if (!this.map) return;

        // Remove current tile layer
        if (this.currentTileLayer) {
            this.map.removeLayer(this.currentTileLayer);
        }

        // Update button states
        document.getElementById('satelliteBtn').classList.remove('active');
        document.getElementById('terrainBtn').classList.remove('active');

        // Add new tile layer based on type
        switch (layerType) {
            case 'satellite':
                this.currentTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    attribution: '© Esri'
                }).addTo(this.map);
                document.getElementById('satelliteBtn').classList.add('active');
                break;
            case 'terrain':
                this.currentTileLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenTopoMap contributors'
                }).addTo(this.map);
                document.getElementById('terrainBtn').classList.add('active');
                break;
            default:
                this.currentTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(this.map);
        }
    }
}

// Initialize the weather app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});
