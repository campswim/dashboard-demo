import axios from 'axios';

export default async function apiCall(operation, query, variables, token) {
  const url = process.env.REACT_APP_ENV === 'production' ? 
      process.env.REACT_APP_API
    : process.env.REACT_APP_ENV === 'development' ? 
      process.env.REACT_APP_API_DEV
    : process.env.REACT_APP_API_DEV;
  const graphQlQuery = {
    operation,
    query,
    variables
  };

  console.log(process.env.REACT_APP_ENV);
  console.log({url});
  
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
