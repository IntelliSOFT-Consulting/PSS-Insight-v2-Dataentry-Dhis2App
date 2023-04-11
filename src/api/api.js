import axios from 'axios';

const api = axios.create({
  baseURL: 'http://172.104.91.99:7001/api/v1',
});

export const saveResponse = async datas => {
  const { data } = await api.post('/data-entry/response/save', datas);
  return data;
};

export const getResponses = async params => {
  const { data } = await api.get('/data-entry/response', { params });
  return data;
};

export const getOrgUnits = async () => {
  const { data } = await api.get('/national-template/organisation-units');
  return data;
};

export const getSurvey = async () => {
  const { data } = await api.get(`/national-template/published-indicators`);
  return data;
};

export const getResponseDetails = async id => {
  const { data } = await api.get(`/data-entry/response/${id}`);
  return data;
};

export const attachFile = async file => {
  const { data } = await api.post(
    '/file/upload',
    file
  );
  return data;
};
