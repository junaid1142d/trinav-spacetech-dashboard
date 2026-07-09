const DEFAULT_TIMEOUT_MS = 15000;

export async function fetchWithRetry(url, options = {}) {
  const {
    retries = 2,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    parseAs = 'json',
    ...fetchOptions
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Request failed with ${response.status}`);
      }

      if (parseAs === 'text') return response.text();
      if (parseAs === 'blob') return response.blob();
      return response.json();
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
      await new Promise(resolve => window.setTimeout(resolve, 500 * (attempt + 1)));
    } finally {
      window.clearTimeout(timeout);
    }
  }

  throw lastError;
}

export function buildCapabilitiesUrl(endpoint, service, version) {
  const params = new URLSearchParams({
    service,
    version,
    request: 'GetCapabilities'
  });

  return `${endpoint}?${params.toString()}`;
}

export function buildDescribeFeatureTypeUrl(service) {
  const params = new URLSearchParams({
    service: 'WFS',
    version: service.version,
    request: 'DescribeFeatureType',
    typeName: service.typeName
  });

  return `${service.endpoint}?${params.toString()}`;
}

export function buildWfsFeatureUrl(service, extent) {
  const params = new URLSearchParams({
    service: 'WFS',
    version: service.version,
    request: 'GetFeature',
    typeName: service.typeName,
    outputFormat: service.outputFormat,
    srsName: service.crs,
    bbox: `${extent.join(',')},${service.crs}`
  });

  return `${service.endpoint}?${params.toString()}`;
}

export function extentCacheKey(extent, precision = 0) {
  return extent.map(value => Math.round(value / (10 ** precision)) * (10 ** precision)).join(',');
}
