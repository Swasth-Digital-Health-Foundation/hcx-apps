import axios from 'axios';

async function postRequest(url: any, payload: any) {
  const response = await axios.post(
    `${process.env.registry_url}${url}`,
    payload
  );
  return response;
}

async function putRequest(osid: any, payload: any) {
  const response = await axios.put(
    `${process.env.registry_url}/${osid}`,
    payload
  );
  return response;
}


export { postRequest, putRequest };
