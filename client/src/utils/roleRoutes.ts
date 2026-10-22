export const getRoleRoute = (role: string): string => {
  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    const scheme = (window.location.protocol === "https:" || hostname.includes("joyit.io")) ? "https" : window.location.protocol.replace(":", "");
    
    if (hostname.includes("joyit.io")) {
      if (role === "PROJECT_MANAGER") return `${scheme}://astc-project.joyit.io/pm`;
      if (role === "ADMIN") return `${scheme}://astc-backoffice.joyit.io`;
      if (role === "TEAM_MEMBER") return `${scheme}://attendance.joyit.io`;
      return `${scheme}://attendance.joyit.io`;
    }
  }

  // Default fallback for K8s Ingress
  if (role === "PROJECT_MANAGER") return `https://astc-project.joyit.io/pm`;
  if (role === "ADMIN") return `https://astc-backoffice.joyit.io`;
  return `https://attendance.joyit.io`;
};

export const ROLE_ROUTES: Record<string, string> = new Proxy({}, {
  get: (_, prop: string) => getRoleRoute(prop)
});

