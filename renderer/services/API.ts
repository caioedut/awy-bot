import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

type Binding = {
  key: string;
  remap?: string;
};

export function remap(bindings: Binding[]) {
  return API.post('/key/remap', bindings);
}

export default API;
