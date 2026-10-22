function getProtocol(): string {
  if (typeof window !== "undefined") {
    return window.location.protocol === "https:" || window.location.hostname.includes("joyit.io")
      ? "https"
      : window.location.protocol.replace(":", "");
  }
  return "https";
}

function getBaseDomain(): string {
  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    if (hostname.includes("joyit.io")) {
      return "joyit.io";
    }
    return hostname;
  }
  return "joyit.io";
}

function getAuthApiUrl(): string {
  if (import.meta.env.VITE_AUTH_API_URL) {
    return import.meta.env.VITE_AUTH_API_URL;
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}

function getGraphqlEndpoint(): string {
  if (import.meta.env.VITE_GRAPHQL_ENDPOINT) {
    return import.meta.env.VITE_GRAPHQL_ENDPOINT;
  }
  const scheme = getProtocol();
  const baseDomain = getBaseDomain();
  return `${scheme}://astc-api.${baseDomain}/graphql`;
}

function getBackofficeUrl(): string {
  if (import.meta.env.VITE_BACKOFFICE_URL) {
    return import.meta.env.VITE_BACKOFFICE_URL;
  }
  const scheme = getProtocol();
  const baseDomain = getBaseDomain();
  return `${scheme}://astc-backoffice.${baseDomain}`;
}

export const env = {
  get AUTH_API_URL() {
    return getAuthApiUrl();
  },
  get GRAPHQL_ENDPOINT() {
    return getGraphqlEndpoint();
  },
  get BACKOFFICE_URL() {
    return getBackofficeUrl();
  },
};

