import Papa from "papaparse";

export function parseCsv<T>(file: File): Promise<T[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<T>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: results => {
        if (results.errors.length) {
          reject(results.errors);
        } else {
          resolve(results.data as T[]);
        }
      },
      error: err => reject(err),
    });
  });
}

export function downloadCsv(data: object[], filename: string) {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

