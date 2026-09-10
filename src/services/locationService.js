export const CAMPUS_LOCATIONS = [
  { name: 'Main Block', lat: 12.9716, lng: 77.5946 },
  { name: 'Library', lat: 12.9723, lng: 77.5951 },
  { name: 'Canteen', lat: 12.9708, lng: 77.5939 },
  { name: 'Hostel', lat: 12.9731, lng: 77.5962 },
  { name: 'Parking Area', lat: 12.9702, lng: 77.5955 },
  { name: 'Sports Ground', lat: 12.9699, lng: 77.5925 },
  { name: 'Engineering Block', lat: 12.9719, lng: 77.5932 },
  { name: 'Washrooms', lat: 12.9715, lng: 77.5945 },
  { name: 'Other', lat: 12.9716, lng: 77.5946 }
];

export const locationService = {
  /**
   * List of campus landmarks
   */
  getCampusLocations() {
    return CAMPUS_LOCATIONS;
  },

  /**
   * Retrieve device coordinates via browser Geolocation API
   */
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation is not supported by your browser. You can select the campus location manually.'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: Math.round(position.coords.accuracy)
          });
        },
        (error) => {
          let msg = 'Could not acquire your location.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              msg = 'Location permission was denied. You can select the campus location manually.';
              break;
            case error.POSITION_UNAVAILABLE:
              msg = 'Location information is unavailable. You can select the campus location manually.';
              break;
            case error.TIMEOUT:
              msg = 'Location request timed out. You can select the campus location manually.';
              break;
          }
          reject(new Error(msg));
        },
        options
      );
    });
  },

  /**
   * Find default coordinates for a campus landmark name
   */
  getDefaultCoordinates(locationName) {
    const found = CAMPUS_LOCATIONS.find(
      (loc) => loc.name.toLowerCase() === (locationName || '').toLowerCase()
    );
    return found ? { latitude: found.lat, longitude: found.lng } : { latitude: 12.9716, longitude: 77.5946 };
  }
};

export default locationService;
