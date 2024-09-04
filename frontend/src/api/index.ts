import { ChildCreateInput, UserCreateInput, ChildCareCreateInput, ChildCareDeleteInput } from '../@types';
const apiUri = process.env.VUE_APP_API_URI;

export const getUser = (username: string) => {
  return fetch(apiUri + `/user/${username}`)
    .then(response => response.json())
    .catch(error => console.log('error', error));
};

export const createUser = (options: UserCreateInput) => {
  return fetch(apiUri + '/user', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  })
    .then(response => response.json())
    .catch(error => console.log('error', error));
};

export const getChildCares = () => {
  return fetch(apiUri + '/child-cares')
    .then(response => response.json())
    .catch(error => console.log('error', error));
};

export const getChildrenFromChildCare = (childCareId: number) => {
  return fetch(apiUri + `/child-care/${childCareId}/children`)
    .then(response => response.json())
    .catch(error => console.log('error', error));
};

export const createChildCare = (username: string, options: ChildCareCreateInput) => {
  return fetch(apiUri + '/child-care', {
    method: 'POST',
    headers: {
      'X-Auth': username,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  })
    .then(response => response.json())
    .catch(error => console.log('error', error));
};

export const deleteChildCare = (username: string, id: number) => {
  return fetch(apiUri + `/child-care/${id}`, {
    method: 'DELETE',
    headers: {
      'X-Auth': username,
    },
  })
    .then(response => {
      if (response.status === 204) return;
      else return response.json();
    })

    .catch(error => console.log('error', error));
};

export const upsertChild = (username: string, options: ChildCreateInput) => {
  return fetch(apiUri + '/child', {
    method: 'POST',
    headers: {
      'X-Auth': username,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  })
    .then(response => response.json())
    .catch(error => console.log('error', error));
};

export const deleteChildFromChildCare = (username: string, options: ChildCareDeleteInput) => {
  return fetch(apiUri + `/child-care/${options.childCareId}/child/${options.childId}`, {
    method: 'DELETE',
    headers: {
      'X-Auth': username,
    },
  })
    .then(response => {
      if (response.status === 204) return;
      else return response.json();
    })
    .catch(error => console.log('error', error));
};

export const exportChildren = (childCareId?: number) => {
  const url = apiUri + `/children/export.csv${childCareId ? `/${childCareId}` : ''}`;
  window.location.href = url;
};
