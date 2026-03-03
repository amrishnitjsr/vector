const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const request = async (path, options = {}) => {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body?.detail || body?.message || message;
    } catch (_) {}
    throw new Error(message);
  }

  return res.json();
};

export const api = {
  parsePipeline: ({ nodes, edges }) =>
    request('/pipelines/parse', {
      method: 'POST',
      body: JSON.stringify({
        nodes: nodes.map((n) => ({ id: n.id })),
        edges: edges.map((e) => ({ source: e.source, target: e.target })),
      }),
    }),
};
