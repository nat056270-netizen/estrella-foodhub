// Protect spreadsheet applications from interpreting user data as formulas.
export function csvText(rows) {
  return rows.map(row => row.map(value => {
    let text = String(value ?? '');
    if (/^[=+@\-\t\r]/.test(text)) text = "'" + text;
    return '"' + text.replaceAll('"', '""') + '"';
  }).join(',')).join('\r\n');
}
export function downloadCSV(filename, rows) {
  const url = URL.createObjectURL(new Blob(['\uFEFF', csvText(rows)], {
    type: 'text/csv;charset=utf-8'
  }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
