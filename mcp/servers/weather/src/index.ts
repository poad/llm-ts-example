import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// Create server instance
const server = new McpServer({
  name: 'weather',
  version: '1.0.0',
},
{
  capabilities: {
    resources: {},
    tools: {},
  },
},
);

// interface GeocodingResponse {
//   results: {
//     latitude: number;
//     longitude: number;
//     name: string;
//   }[];
// }

interface Geometry {
  coordinates: number[],
  type: string
}

interface GeocodingProperties {
  addressCode: string,
  title: string,
  dataSource?: string,
}

interface Geocoding {
  geometry: Geometry,
  type: string,
  properties: GeocodingProperties
}

interface GetGeocodingResult {
  longitude: number,
  latitude: number,
  name?: string
}

type GeocodingResponse = Geocoding[];

async function getGeocoding(location: string): Promise<GetGeocodingResult | null> {
  // Get grid point data
  const pointsUrl = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(location)}`;
  const geocodingData = await makeNWSRequest<GeocodingResponse>(pointsUrl);

  if (!geocodingData?.[0]) {
    return null;
  }

  const { geometry: { coordinates: [longitude, latitude] }, properties: { title: name } } = geocodingData[0];

  // const pointsUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`;
  // const geocodingData = await makeNWSRequest<GeocodingResponse>(pointsUrl);

  // if (!geocodingData?.results?.[0]) {
  //   return null;
  // }

  // const { latitude, longitude, name } = geocodingData.results[0];

  return {
    longitude,
    latitude,
    name,
  };
}

server.registerTool('get-forecast', {
  description: 'Get weather forecast for a location',
  inputSchema: {
    location: z.string().describe('City name'),
  },
}, async ({ location }) => {
  // Get grid point data
  const geocoding = await getGeocoding(location);

  if (!geocoding) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to retrieve grid point data for coordinates: ${location}. This location may not be supported by the NWS API (only US locations are supported).`,
        },
      ],
    };
  }

  const { longitude, latitude, name } = geocoding;

  const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,weather_code`;
  if (!forecastUrl) {
    return {
      content: [
        {
          type: 'text',
          text: 'Failed to get forecast URL from grid point data',
        },
      ],
    };
  }

  // Get forecast data
  const data = await makeNWSRequest<WeatherResponse>(forecastUrl);
  if (!data) {
    return {
      content: [
        {
          type: 'text',
          text: 'Failed to retrieve forecast data',
        },
      ],
    };
  }

  // Format forecast periods
  const formattedForecast = [
    `${name ?? 'Unknown'}: Temperature: ${data.current.temperature_2m ?? 'Unknown'}°C`,
    `Wind: ${data.current.wind_speed_10m ?? 'Unknown'} ${data.current.wind_gusts_10m ?? ''}`,
    `${getWeatherCondition(data.current.weather_code) ?? 'No forecast available'}`,
    '---',
  ].join('\n');

  const forecastText = `Forecast for ${latitude}, ${longitude}:\n\n${formattedForecast}`;

  return {
    content: [
      {
        type: 'text',
        text: forecastText,
      },
    ],
  };
},
);

function getWeatherCondition(code: number): string {
  const conditions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  return conditions[code] || 'Unknown';
}

// Helper function for making NWS API requests
async function makeNWSRequest<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} body: ${await response.text()}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error('Error making NWS request:', error);
    return null;
  }
}

interface WeatherResponseCurrent {
  time: string;
  temperature_2m: number;
  apparent_temperature: number;
  relative_humidity_2m: number;
  wind_speed_10m: number;
  wind_gusts_10m: number;
  weather_code: number;
}

interface WeatherResponse {
  current: WeatherResponseCurrent;
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Weather MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
