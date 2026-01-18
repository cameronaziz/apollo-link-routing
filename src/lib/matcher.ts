export interface MatchResult {
  params: Record<string, string>;
  path: string;
}

export function matchPath(pattern: string, pathname: string): MatchResult | null {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = pathname.split('/').filter(Boolean);

  const params: Record<string, string> = {};
  let patternIndex = 0;
  let pathIndex = 0;

  while (patternIndex < patternParts.length || pathIndex < pathParts.length) {
    const patternPart = patternParts[patternIndex];
    const pathPart = pathParts[pathIndex];

    if (patternPart === '**') {
      params['*'] = pathParts.slice(pathIndex).join('/');
      return { params, path: pattern };
    }

    if (patternPart === '*') {
      if (pathPart === undefined) {
        return null;
      }
      patternIndex++;
      pathIndex++;
      continue;
    }

    if (patternPart?.startsWith(':') && patternPart.endsWith('?')) {
      const paramName = patternPart.slice(1, -1);
      if (pathPart !== undefined) {
        params[paramName] = pathPart;
        pathIndex++;
      }
      patternIndex++;
      continue;
    }

    if (patternPart?.startsWith(':')) {
      if (pathPart === undefined) {
        return null;
      }
      const paramName = patternPart.slice(1);
      params[paramName] = pathPart;
      patternIndex++;
      pathIndex++;
      continue;
    }

    if (patternPart === pathPart) {
      patternIndex++;
      pathIndex++;
      continue;
    }

    return null;
  }

  return { params, path: pattern };
}

export function parseQueryString(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}