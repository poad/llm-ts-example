import express, { Request, Response } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
// import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const app = express();
app.use(express.json());

// Create server instance
const server = new McpServer({
  name: 'weather',
  version: '1.0.0',
  capabilities: {
    resources: {},
    tools: {},
  },
});

app.post('/mcp', async (req: Request, res: Response) => {
  // In stateless mode, create a new instance of transport and server for each request
  // to ensure complete isolation. A single instance would cause request ID collisions
  // when multiple clients connect concurrently.

  try {
    const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    res.on('close', () => {
      console.log('Request closed');
      transport.close();
      server.close();
    });
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error',
        },
        id: null,
      });
    }
  }
});

app.get('/mcp', async (req: Request, res: Response) => {
  console.log('Received GET MCP request');
  res.writeHead(405).end(JSON.stringify({
    jsonrpc: '2.0',
    error: {
      code: -32000,
      message: 'Method not allowed.',
    },
    id: null,
  }));
});

app.delete('/mcp', async (req: Request, res: Response) => {
  console.log('Received DELETE MCP request');
  res.writeHead(405).end(JSON.stringify({
    jsonrpc: '2.0',
    error: {
      code: -32000,
      message: 'Method not allowed.',
    },
    id: null,
  }));
});


// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`MCP Stateless Streamable HTTP Server listening on port ${PORT}`);
});

interface Geocoding {
  geometry: {
    coordinates: number[],
    type: string
  },
  type: string,
  properties: {
    addressCode: string,
    title: string,
    dataSource?: string,
  }
}

type GeocodingResponse = Geocoding[];

async function getGeocoding(location: string): Promise<{
  longitude: number,
  latitude: number,
  name?: string
} | null> {
  // Get grid point data
  const pointsUrl = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(location)}`;
  const geocodingData = await makeNWSRequest<GeocodingResponse>(pointsUrl);

  if (!geocodingData?.[0]) {
    return null;
  }

  const { geometry: { coordinates: [longitude, latitude] }, properties: { title: name } } = geocodingData[0];

  return {
    longitude,
    latitude,
    name,
  };
}

server.tool(
  'get-forecast',
  'Get weather forecast for a location',
  {
    location: z.string().describe('City name'),
  },
  async ({ location }) => {
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

interface WeatherResponse {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_gusts_10m: number;
    weather_code: number;
  };
}
