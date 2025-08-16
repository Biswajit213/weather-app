# Weather App

A modern, responsive web-based weather application that allows users to check current weather conditions for any location worldwide.

## Features

### Core Functionality
- **Location Search**: Enter any city name to get current weather conditions
- **Current Location**: Use geolocation to get weather for your current position
- **Real-time Data**: Fetches live weather data from OpenWeatherMap API
- **Temperature Units**: Toggle between Celsius and Fahrenheit
- **Comprehensive Details**: Shows temperature, humidity, wind speed, pressure, visibility, and more

### User Interface
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern Styling**: Clean, gradient-based design with smooth animations
- **Interactive Elements**: Hover effects and smooth transitions
- **Weather Icons**: Visual weather condition indicators
- **Error Handling**: User-friendly error messages with retry functionality

### Technical Features
- **API Integration**: Uses OpenWeatherMap API for accurate weather data
- **Geolocation Support**: Browser-based location detection
- **Async/Await**: Modern JavaScript for API requests
- **Error Handling**: Comprehensive error management for various scenarios
- **Loading States**: Visual feedback during data fetching

## Setup Instructions

### 1. Get OpenWeatherMap API Key

1. Visit [OpenWeatherMap](https://openweathermap.org/)
2. Create a free account
3. Go to API Keys section in your account
4. Copy your API key

### 2. Configure the Application

1. Open `script.js` file
2. Find the line: `this.API_KEY = 'YOUR_API_KEY_HERE';`
3. Replace `'YOUR_API_KEY_HERE'` with your actual API key:
   ```javascript
   this.API_KEY = 'your_actual_api_key_here';
   ```

### 3. Run the Application

#### Option 1: Simple File Opening
1. Open `index.html` in any modern web browser
2. The app will work immediately after setting the API key

#### Option 2: Local Server (Recommended)
For better development experience, use a local server:

**Using Python:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Using Node.js:**
```bash
# Install http-server globally
npm install -g http-server

# Run server
http-server
```

**Using Live Server (VS Code Extension):**
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## File Structure

```
weather-app/
├── index.html          # Main HTML structure
├── styles.css          # CSS styling and responsive design
├── script.js           # JavaScript functionality and API integration
└── README.md           # This file
```

## Usage Guide

### Searching by City Name
1. Enter a city name in the search input field
2. Click "Get Weather" button or press Enter
3. View the current weather conditions

### Using Current Location
1. Click "Use Current Location" button
2. Allow location access when prompted by browser
3. View weather for your current position

### Temperature Units
- Click °C or °F buttons to switch between Celsius and Fahrenheit
- The conversion applies to all temperature values

## API Information

This app uses the OpenWeatherMap Current Weather Data API:
- **Endpoint**: `https://api.openweathermap.org/data/2.5/weather`
- **Rate Limit**: 1,000 calls/day (free tier)
- **Data Includes**: Temperature, humidity, pressure, wind speed, visibility, weather conditions

## Browser Compatibility

- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Features Used**: 
  - Fetch API
  - Geolocation API
  - CSS Grid and Flexbox
  - ES6+ JavaScript features

## Error Handling

The app handles various error scenarios:
- **Invalid City Names**: Clear error message with retry option
- **Network Issues**: Connection error handling
- **API Errors**: Invalid API key, rate limiting, service unavailable
- **Geolocation Errors**: Permission denied, unavailable, timeout
- **Missing API Key**: Helpful setup reminder

## Responsive Design

The app is fully responsive with breakpoints at:
- **Desktop**: 1200px and above
- **Tablet**: 768px - 1199px
- **Mobile**: Below 768px

## Customization

### Styling
- Modify `styles.css` to change colors, fonts, or layout
- CSS custom properties can be added for easier theming

### Functionality
- Add weather forecast feature using OpenWeatherMap's forecast API
- Implement weather alerts or notifications
- Add more weather details like sunrise/sunset times
- Integrate maps or radar imagery

## Troubleshooting

### Common Issues

1. **"Please set your OpenWeatherMap API key"**
   - Solution: Follow setup instructions to add your API key

2. **"City not found"**
   - Solution: Check spelling, try different city name format

3. **"Network error"**
   - Solution: Check internet connection, try again

4. **Location not working**
   - Solution: Enable location services in browser settings

### Development Tips

- Use browser developer tools to debug API responses
- Check console for detailed error messages
- Test with different city names and locations
- Verify API key is active and has remaining quota

## License

This project is open source and available under the MIT License.

## Credits

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Icons from [Font Awesome](https://fontawesome.com/)
- Fonts from [Google Fonts](https://fonts.google.com/)

## Support

For issues or questions:
1. Check the troubleshooting section
2. Verify API key setup
3. Test with a simple city name like "London"
4. Check browser console for error messages
