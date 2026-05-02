type UrlParams = Record<string, string | number | boolean | undefined | null>;

function buildUrl_(base: string, params: UrlParams): string {
  const query = Object.keys(params)
    .filter(
      (key) =>
        params[key] !== "" && params[key] !== null && params[key] !== undefined,
    )
    .map(
      (key) =>
        encodeURIComponent(key) + "=" + encodeURIComponent(String(params[key])),
    )
    .join("&");

  return query ? base + "?" + query : base;
}
