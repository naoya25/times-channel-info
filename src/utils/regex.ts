function parseRegex(str: string): RegExp {
  const match = str.match(/^\/(.+)\/([a-z]*)$/i);
  if (!match) {
    throw new Error("Invalid regex: " + str);
  }
  return new RegExp(match[1], match[2]);
}
