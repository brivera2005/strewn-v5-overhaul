/** Real-world lat/lng anchors for US states and international regions */

export interface GeoAnchor {
  id: string;
  name: string;
  abbr: string;
  lat: number;
  lng: number;
  country: 'US' | 'INTL';
}

export const US_STATE_ANCHORS: GeoAnchor[] = [
  { id: 'AL', name: 'Alabama', abbr: 'AL', lat: 32.806671, lng: -86.79113, country: 'US' },
  { id: 'AK', name: 'Alaska', abbr: 'AK', lat: 61.370716, lng: -152.404419, country: 'US' },
  { id: 'AZ', name: 'Arizona', abbr: 'AZ', lat: 33.729759, lng: -111.431221, country: 'US' },
  { id: 'AR', name: 'Arkansas', abbr: 'AR', lat: 34.969704, lng: -92.373123, country: 'US' },
  { id: 'CA', name: 'California', abbr: 'CA', lat: 36.116203, lng: -119.681564, country: 'US' },
  { id: 'CO', name: 'Colorado', abbr: 'CO', lat: 39.059811, lng: -105.311104, country: 'US' },
  { id: 'CT', name: 'Connecticut', abbr: 'CT', lat: 41.597782, lng: -72.755371, country: 'US' },
  { id: 'DE', name: 'Delaware', abbr: 'DE', lat: 39.318523, lng: -75.507141, country: 'US' },
  { id: 'FL', name: 'Florida', abbr: 'FL', lat: 27.766279, lng: -81.686783, country: 'US' },
  { id: 'GA', name: 'Georgia', abbr: 'GA', lat: 33.040619, lng: -83.643074, country: 'US' },
  { id: 'HI', name: 'Hawaii', abbr: 'HI', lat: 21.094318, lng: -157.498337, country: 'US' },
  { id: 'ID', name: 'Idaho', abbr: 'ID', lat: 44.240459, lng: -114.478828, country: 'US' },
  { id: 'IL', name: 'Illinois', abbr: 'IL', lat: 40.349457, lng: -88.986137, country: 'US' },
  { id: 'IN', name: 'Indiana', abbr: 'IN', lat: 39.849426, lng: -86.258278, country: 'US' },
  { id: 'IA', name: 'Iowa', abbr: 'IA', lat: 42.011539, lng: -93.210526, country: 'US' },
  { id: 'KS', name: 'Kansas', abbr: 'KS', lat: 38.5266, lng: -96.726486, country: 'US' },
  { id: 'KY', name: 'Kentucky', abbr: 'KY', lat: 37.66814, lng: -84.670067, country: 'US' },
  { id: 'LA', name: 'Louisiana', abbr: 'LA', lat: 31.169546, lng: -91.867805, country: 'US' },
  { id: 'ME', name: 'Maine', abbr: 'ME', lat: 44.693947, lng: -69.381927, country: 'US' },
  { id: 'MD', name: 'Maryland', abbr: 'MD', lat: 39.063946, lng: -76.802101, country: 'US' },
  { id: 'MA', name: 'Massachusetts', abbr: 'MA', lat: 42.230171, lng: -71.530106, country: 'US' },
  { id: 'MI', name: 'Michigan', abbr: 'MI', lat: 43.326618, lng: -84.536095, country: 'US' },
  { id: 'MN', name: 'Minnesota', abbr: 'MN', lat: 45.694454, lng: -93.900192, country: 'US' },
  { id: 'MS', name: 'Mississippi', abbr: 'MS', lat: 32.741646, lng: -89.678696, country: 'US' },
  { id: 'MO', name: 'Missouri', abbr: 'MO', lat: 38.456085, lng: -92.288368, country: 'US' },
  { id: 'MT', name: 'Montana', abbr: 'MT', lat: 46.921925, lng: -110.454353, country: 'US' },
  { id: 'NE', name: 'Nebraska', abbr: 'NE', lat: 41.12537, lng: -98.268082, country: 'US' },
  { id: 'NV', name: 'Nevada', abbr: 'NV', lat: 38.313515, lng: -117.055374, country: 'US' },
  { id: 'NH', name: 'New Hampshire', abbr: 'NH', lat: 43.452492, lng: -71.563896, country: 'US' },
  { id: 'NJ', name: 'New Jersey', abbr: 'NJ', lat: 40.298904, lng: -74.521011, country: 'US' },
  { id: 'NM', name: 'New Mexico', abbr: 'NM', lat: 34.840515, lng: -106.248482, country: 'US' },
  { id: 'NY', name: 'New York', abbr: 'NY', lat: 42.165726, lng: -74.948051, country: 'US' },
  { id: 'NC', name: 'North Carolina', abbr: 'NC', lat: 35.630066, lng: -79.806419, country: 'US' },
  { id: 'ND', name: 'North Dakota', abbr: 'ND', lat: 47.528912, lng: -99.784012, country: 'US' },
  { id: 'OH', name: 'Ohio', abbr: 'OH', lat: 40.388783, lng: -82.764915, country: 'US' },
  { id: 'OK', name: 'Oklahoma', abbr: 'OK', lat: 35.565342, lng: -96.928917, country: 'US' },
  { id: 'OR', name: 'Oregon', abbr: 'OR', lat: 44.572021, lng: -122.070938, country: 'US' },
  { id: 'PA', name: 'Pennsylvania', abbr: 'PA', lat: 40.590752, lng: -77.209755, country: 'US' },
  { id: 'RI', name: 'Rhode Island', abbr: 'RI', lat: 41.680893, lng: -71.51178, country: 'US' },
  { id: 'SC', name: 'South Carolina', abbr: 'SC', lat: 33.856892, lng: -80.945007, country: 'US' },
  { id: 'SD', name: 'South Dakota', abbr: 'SD', lat: 44.299782, lng: -99.438828, country: 'US' },
  { id: 'TN', name: 'Tennessee', abbr: 'TN', lat: 35.747845, lng: -86.692345, country: 'US' },
  { id: 'TX', name: 'Texas', abbr: 'TX', lat: 31.054487, lng: -97.563461, country: 'US' },
  { id: 'UT', name: 'Utah', abbr: 'UT', lat: 40.150032, lng: -111.862434, country: 'US' },
  { id: 'VT', name: 'Vermont', abbr: 'VT', lat: 44.045876, lng: -72.710686, country: 'US' },
  { id: 'VA', name: 'Virginia', abbr: 'VA', lat: 37.769337, lng: -78.169968, country: 'US' },
  { id: 'WA', name: 'Washington', abbr: 'WA', lat: 47.400902, lng: -121.490494, country: 'US' },
  { id: 'WV', name: 'West Virginia', abbr: 'WV', lat: 38.491226, lng: -80.954453, country: 'US' },
  { id: 'WI', name: 'Wisconsin', abbr: 'WI', lat: 44.268543, lng: -89.616508, country: 'US' },
  { id: 'WY', name: 'Wyoming', abbr: 'WY', lat: 42.755966, lng: -107.30249, country: 'US' },
  { id: 'DC', name: 'District of Columbia', abbr: 'DC', lat: 38.897438, lng: -77.026817, country: 'US' },
];

export const INTL_COUNTRY_ANCHORS: GeoAnchor[] = [
  { id: 'GB', name: 'United Kingdom', abbr: 'GB', lat: 55.378051, lng: -3.435973, country: 'INTL' },
  { id: 'CAN', name: 'Canada', abbr: 'CAN', lat: 56.130366, lng: -106.346771, country: 'INTL' },
  { id: 'MX', name: 'Mexico', abbr: 'MX', lat: 23.634501, lng: -102.552784, country: 'INTL' },
  { id: 'BR', name: 'Brazil', abbr: 'BR', lat: -14.235004, lng: -51.92528, country: 'INTL' },
  { id: 'AR', name: 'Argentina', abbr: 'AR', lat: -38.416097, lng: -63.616672, country: 'INTL' },
  { id: 'DE', name: 'Germany', abbr: 'DE', lat: 51.165691, lng: 10.451526, country: 'INTL' },
  { id: 'FR', name: 'France', abbr: 'FR', lat: 46.227638, lng: 2.213749, country: 'INTL' },
  { id: 'IT', name: 'Italy', abbr: 'IT', lat: 41.87194, lng: 12.56738, country: 'INTL' },
  { id: 'ES', name: 'Spain', abbr: 'ES', lat: 40.463667, lng: -3.74922, country: 'INTL' },
  { id: 'IN', name: 'India', abbr: 'IN', lat: 20.593684, lng: 78.96288, country: 'INTL' },
  { id: 'CN', name: 'China', abbr: 'CN', lat: 35.86166, lng: 104.195397, country: 'INTL' },
  { id: 'JP', name: 'Japan', abbr: 'JP', lat: 36.204824, lng: 138.252924, country: 'INTL' },
  { id: 'AU', name: 'Australia', abbr: 'AU', lat: -25.274398, lng: 133.775136, country: 'INTL' },
  { id: 'NG', name: 'Nigeria', abbr: 'NG', lat: 9.081999, lng: 8.675277, country: 'INTL' },
  { id: 'ZA', name: 'South Africa', abbr: 'ZA', lat: -30.559482, lng: 22.937506, country: 'INTL' },
  { id: 'EG', name: 'Egypt', abbr: 'EG', lat: 26.820553, lng: 30.802498, country: 'INTL' },
  { id: 'KR', name: 'South Korea', abbr: 'KR', lat: 35.907757, lng: 127.766922, country: 'INTL' },
  { id: 'PH', name: 'Philippines', abbr: 'PH', lat: 12.879721, lng: 121.774017, country: 'INTL' },
  { id: 'ID', name: 'Indonesia', abbr: 'ID', lat: -0.789275, lng: 113.921327, country: 'INTL' },
  { id: 'PL', name: 'Poland', abbr: 'PL', lat: 51.919438, lng: 19.145136, country: 'INTL' },
];

export const ALL_GEO_ANCHORS = [...US_STATE_ANCHORS, ...INTL_COUNTRY_ANCHORS];

const anchorMap = new Map(ALL_GEO_ANCHORS.map((a) => [a.abbr, a]));

export function getGeoAnchor(abbr: string): GeoAnchor {
  return anchorMap.get(abbr) ?? US_STATE_ANCHORS[0];
}

export function jitterLatLng(lat: number, lng: number, amount = 0.8): { lat: number; lng: number } {
  return {
    lat: lat + (Math.random() - 0.5) * amount,
    lng: lng + (Math.random() - 0.5) * amount,
  };
}

export function pickRandomUSAnchor(): GeoAnchor {
  return US_STATE_ANCHORS[Math.floor(Math.random() * US_STATE_ANCHORS.length)];
}

export function pickRandomIntlAnchor(): GeoAnchor {
  return INTL_COUNTRY_ANCHORS[Math.floor(Math.random() * INTL_COUNTRY_ANCHORS.length)];
}

/** Legacy canvas coords from lat/lng for backward compat */
export function latLngToCanvas(lat: number, lng: number): { x: number; y: number } {
  const x = (lng + 180) / 360;
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = 0.5 - mercN / (2 * Math.PI);
  return { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) };
}
