const routes = [];

export function registerRoute(path, handler) {
  routes.push({ path, handler });
}

function pathOnly(hash) {
  const raw = hash.replace(/^#/, "") || "/";
  const q = raw.indexOf("?");
  return q === -1 ? raw : raw.slice(0, q);
}

function matchRoute(hash) {
  const path = pathOnly(hash);
  for (const route of routes) {
    const paramNames = [];
    const pattern = route.path.replace(/:([A-Za-z0-9_]+)/g, (_, name) => {
      paramNames.push(name);
      return "([^/]+)";
    });
    const re = new RegExp(`^${pattern}$`);
    const m = path.match(re);
    if (m) {
      const params = {};
      paramNames.forEach((name, i) => {
        params[name] = decodeURIComponent(m[i + 1]);
      });
      return { handler: route.handler, params, path };
    }
  }
  return null;
}

export function navigate(hash) {
  if (!hash.startsWith("#")) hash = `#${hash}`;
  window.location.hash = hash;
}

export function startRouter(onRoute) {
  const run = () => {
    const matched = matchRoute(window.location.hash);
    if (matched) onRoute(matched);
    else onRoute({ handler: routes[0]?.handler, params: {}, path: "/" });
  };
  window.addEventListener("hashchange", run);
  run();
}

export function getQuery() {
  const raw = window.location.hash.replace(/^#/, "") || "/";
  const q = raw.indexOf("?");
  if (q === -1) return new URLSearchParams();
  return new URLSearchParams(raw.slice(q + 1));
}
