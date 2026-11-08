import api from './client';
import { normalizeLink, normalizeLinks, normalizeStats } from '../utils/normalize';

export const authApi = {
  async register({ username, email, password }) {
  const { data } = await api.post('/auth/register', {
    name: username,
    email,
    password
  });
  return data;
},

  /**
   * Sends JSON first. If the backend uses FastAPI's OAuth2PasswordRequestForm
   * (form-encoded `username` / `password`) it answers 422 and we retry in that format.
   */
  async login({ email, password }) {
    let data;
    try {
      ({ data } = await api.post('/auth/login', { email, username: email, password }));
    } catch (err) {
      if (err.response?.status !== 422) throw err;
      const body = new URLSearchParams({ username: email, password });
      ({ data } = await api.post('/auth/login', body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }));
    }
    const token = data?.access_token ?? data?.token;
    if (!token) throw new Error('Login succeeded but no token was returned.');
    return token;
  },

  async me() {
    const { data } = await api.get('/auth/me');
    return data;
  },
};

export const linksApi = {
  async shorten(url) {
    // The URL is sent under the common field names; unknown extras are ignored by FastAPI.
    const { data } = await api.post('/shorten', { original_url: url, url, long_url: url });
    return normalizeLink(data);
  },

  async list() {
    const { data } = await api.get('/my-links');
    return normalizeLinks(data);
  },

  async stats(shortCode) {
    const { data } = await api.get(`/stats/${encodeURIComponent(shortCode)}`);
    return normalizeStats(data, shortCode);
  },
};
