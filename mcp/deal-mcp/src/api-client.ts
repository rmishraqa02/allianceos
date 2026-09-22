import { config } from './config.js';

export class AllianceOSApiClient {
  constructor(private readonly token: string) {}

  async get<T>(path: string): Promise<T> {
    const response = await fetch(
      `${config.apiBaseUrl}${path}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const body = await response.text();

    if (!response.ok) {
      throw new Error(
        `AllianceOS API error ${response.status}: ${body}`,
      );
    }

    return JSON.parse(body) as T;
  }
}
