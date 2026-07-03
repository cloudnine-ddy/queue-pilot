const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// options = {} means default value is an empty object
// so later if we write options.body kind of code, it won't throw an error if options is undefined
export async function request(path, options = {}) {

  // this mean we set the body to be body
  // things except body will be set to fetchOptions
  const { body, ...fetchOptions } = options;

  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,              // the ...fetchOptions here is like throw out all the properties in fetchOptions and put them here
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
}
