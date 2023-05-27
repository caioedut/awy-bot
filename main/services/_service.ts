export default function _service(e, serviceName, arg) {
  const body = JSON.parse(arg || '{}');

  const service = require(`./${serviceName}`).default;
  let response = service(body) ?? null;

  if (typeof response === 'string') {
    const isArray = response.startsWith('[') && response.endsWith(']');
    const isObject = response.startsWith('{') && response.endsWith('}');

    if (isArray || isObject) {
      response = JSON.parse(response);
    }
  }

  e.returnValue = { data: response };
}
