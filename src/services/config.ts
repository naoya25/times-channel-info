function fetchConfigs(): Record<string, string> {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("configs");

  if (!sheet) {
    throw new Error("configs シートが存在しません");
  }

  const values = sheet.getDataRange().getValues() as string[][];
  const config: Record<string, string> = {};

  for (let i = 1; i < values.length; i++) {
    const key = values[i][0];
    const value = values[i][1];
    config[key] = value;
  }

  return config;
}
