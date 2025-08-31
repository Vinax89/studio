const API_URL = 'https://worldtimeapi.org/api/ip';

export async function getCurrentTime(): Promise<Date> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch time: ${response.status} ${response.statusText}`);
    }
    const data: { datetime?: string } = await response.json();
    if (data.datetime) {
      return new Date(data.datetime);
    }
  } catch (error) {
    // Ignore errors and fall back to local time below.
  }
  return new Date();
}

export default getCurrentTime;
