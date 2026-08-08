import 'dotenv/config';

const bool = (value, fallback = false) => {
  if (value == null) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

const mqttProvider = String(process.env.MQTT_PROVIDER || 'adafruit').toLowerCase();
const aioUsername = process.env.AIO_USERNAME || '';
const aioKey = process.env.AIO_KEY || '';

export const config = {
  port: Number(process.env.PORT || 3000),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'green_argric_dev_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  dataMode: process.env.DATA_MODE || 'memory',
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-5.6-sol',
  },
  ai: {
    provider: String(process.env.AI_PROVIDER || 'ollama').toLowerCase(),
    ollamaUrl: String(process.env.OLLAMA_URL || 'http://127.0.0.1:11434').replace(/\/$/, ''),
    ollamaModel: process.env.OLLAMA_MODEL || 'gemma3:4b',
    tavilyApiKey: process.env.TAVILY_API_KEY || '',
    tavilySearchUrl: process.env.TAVILY_SEARCH_URL || 'https://api.tavily.com/search',
  },
  db: {
    server: process.env.DB_SERVER || '127.0.0.1',
    port: Number(process.env.DB_PORT || 1433),
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'GreenArgric',
    options: {
      encrypt: bool(process.env.DB_ENCRYPT, false),
      trustServerCertificate: bool(process.env.DB_TRUST_CERT, true),
    },
  },
  mqtt: {
    enabled: bool(process.env.MQTT_ENABLED, false),
    provider: mqttProvider,
    local: {
      broker: process.env.MQTT_BROKER || 'mqtt://127.0.0.1:1883',
      username: process.env.MQTT_USERNAME || undefined,
      password: process.env.MQTT_PASSWORD || undefined,
      baseTopic: process.env.MQTT_BASE_TOPIC || 'greenargric',
    },
    adafruit: {
      broker: process.env.AIO_BROKER || 'mqtts://io.adafruit.com:8883',
      username: aioUsername,
      key: aioKey,
      deviceCommandFeeds: {
        pump: process.env.AIO_PUMP_COMMAND_FEED || 'ga-pump-control',
        grow_light: process.env.AIO_LIGHT_COMMAND_FEED || 'ga-light-control',
        fan: process.env.AIO_FAN_COMMAND_FEED || 'ga-fan-control',
        dosing_pump: process.env.AIO_DOSING_PUMP_COMMAND_FEED || 'ga-dosing-pump-control',
      },
      deviceStatusFeeds: {
        pump: process.env.AIO_PUMP_STATUS_FEED || 'ga-pump-status',
        grow_light: process.env.AIO_LIGHT_STATUS_FEED || 'ga-light-status',
        fan: process.env.AIO_FAN_STATUS_FEED || 'ga-fan-status',
        dosing_pump: process.env.AIO_DOSING_PUMP_STATUS_FEED || 'ga-dosing-pump-status',
      },
      gatewayStatusFeed: process.env.AIO_GATEWAY_STATUS_FEED || 'ga-gateway-status',
    },
  },
};
