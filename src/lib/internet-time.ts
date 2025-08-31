export async function getCurrentTime(): Promise<Date> {
  try {
    const response = await fetch('https://worldtimeapi.org/api/ip');
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    const data = await response.json();
    const date = new Date(data.datetime);
    if (isNaN(date.getTime())) throw new Error('Invalid date');
    return date;
  } catch {
    return new Date();
  }
}

export default getCurrentTime;
