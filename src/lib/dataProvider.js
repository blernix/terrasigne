import { fetchUtils } from 'react-admin';

const httpClient = fetchUtils.fetchJson;
const apiUrl = '/api'; // Votre base d'URL, ex: /api

// Fonction utilitaire : mappe "_id" -> "id"
function convertId(record) {
  if (!record) return record;
  return { ...record, id: record._id };
}

export const myDataProvider = {
  getList: async (resource, params) => {
    const url = `${apiUrl}/${resource}`;
    try {
      const { json } = await httpClient(url);
      const dataWithId = json.data.map(convertId);
      return {
        data: dataWithId,
        total: dataWithId.length,
      };
    } catch (error) {
      console.error(`Error in getList for resource ${resource}:`, error);
      throw new Error('Error fetching list');
    }
  },

  getOne: async (resource, params) => {
    const url = `${apiUrl}/${resource}/${params.id}`;
    try {
      const { json } = await httpClient(url);
      return { data: convertId(json.data) };
    } catch (error) {
      console.error(`Error in getOne for resource ${resource}:`, error);
      throw new Error('Error fetching resource');
    }
  },

  getMany: async (resource, params) => {
    const ids = params.ids.map(id => (typeof id === 'object' ? id._id : id));
    const query = `ids=${ids.join(',')}`;
    const url = `${apiUrl}/${resource}?${query}`;
    try {
      const { json } = await httpClient(url);
      const dataWithId = json.data.map(convertId);
      return {
        data: dataWithId,
      };
    } catch (error) {
      console.error(`Error in getMany for resource ${resource}:`, error);
      throw new Error('Error fetching multiple resources');
    }
  },

  getManyReference: async (resource, params) => {
    const query = `target=${params.target}&id=${params.id}`;
    const url = `${apiUrl}/${resource}?${query}`;
    try {
      const { json } = await httpClient(url);
      const dataWithId = json.data.map(convertId);
      return {
        data: dataWithId,
        total: dataWithId.length,
      };
    } catch (error) {
      console.error(`Error in getManyReference for resource ${resource}:`, error);
      throw new Error('Error fetching reference resources');
    }
  },

  create: async (resource, params) => {
    const url = `${apiUrl}/${resource}`;
    try {
      const { json } = await httpClient(url, {
        method: 'POST',
        body: JSON.stringify(params.data),
      });
      return { data: convertId(json.data) };
    } catch (error) {
      console.error(`Error in create for resource ${resource}:`, error);
      throw new Error('Error creating resource');
    }
  },

  update: async (resource, params) => {
    const url = `${apiUrl}/${resource}/${params.id}`;
    try {
      const { json } = await httpClient(url, {
        method: 'PUT',
        body: JSON.stringify(params.data),
      });
      return { data: convertId(json.data) };
    } catch (error) {
      console.error(`Error in update for resource ${resource}:`, error);
      throw new Error('Error updating resource');
    }
  },

  delete: async (resource, params) => {
    const url = `${apiUrl}/${resource}/${params.id}`;
    try {
      await httpClient(url, { method: 'DELETE' });
      return { data: { id: params.id } };
    } catch (error) {
      console.error(`Error in delete for resource ${resource}:`, error);
      throw new Error('Error deleting resource');
    }
  },
};