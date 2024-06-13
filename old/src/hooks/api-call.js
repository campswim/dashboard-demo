import axios from 'axios';

export default async function apiCall(operation, query, variables, token) {
  const url = process.env.REACT_APP_ENV === 'production-manual' ? 
      process.env.REACT_APP_API_MANUAL 
    : process.env.REACT_APP_ENV === 'production-auto' ? 
      process.env.REACT_APP_API_AUTO 
    : window.location.href.includes('localhost:3001') ? 
      process.env.REACT_APP_API_LOCAL 
    : process.env.REACT_APP_API_DEV;
  const graphQlQuery = {
    operation,
    query,
    variables
  };
  
  const options = {
    method: 'POST',
    url: url,
    data: JSON.stringify(graphQlQuery),
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true
  };

  if (token) options.headers.Authorization = `Bearer ${token}`;

  return await axios.request(options).then(
    res => { return res.data },
    err => { return err; }
  );
}
