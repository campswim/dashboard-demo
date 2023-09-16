import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiCall from '../hooks/api-call';

const Signup = ({ caller }) => {
  const [yourname, setYourname] = useState('');
  const [email, setEmail] = useState(''); // Use the email as the username.
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [id, setId] = useState('');
  const [error, setError] = useState(null);
  const roles = ['Admin', 'User']; // TO-DO: Replace the hardcoding with a call to the API to retrieve the roles from the Roles table.
  const operation = caller;
  const query = `mutation ${caller}($email: String!, $name: String!, $password: String!, $role: String!) {${caller}(email: $email, name: $name, password: $password, role: $role) {Id Error}}`;
  const variables = {
    email,
    name: yourname,
    password,
    role,
  };

  const handleSubmit = event => {
    event.preventDefault();
    apiCall(operation, query, variables).then(
      res => {
        if (!res.data.signup.Id) setError(res.data.signup.Error? res.data.signup.Error : null);
        else setId(res.data.signup.Id);
      },
      err => {
        console.log({err});
      }
    )
  };

  const handleSelect = event => {
    event.preventDefault();
    setRole(event.target.value);
  }

  return <div className='signup-container'>
    {!error && !id ? 
    (
      <form onSubmit={handleSubmit}>
        <input name="your-name" value={yourname} placeholder="Your Name" onChange={(e) => setYourname(e.target.value)}/>
        <input name="email" value={email} placeholder="Email" onChange={(e) => setEmail(e.target.value)}/>
        <select name="role" onChange={handleSelect} defaultValue="default">
          <option value="default" disabled>Your Role</option>
          {roles.map((role, key) => (
            <option key={key} value={role}>{role}</option>
          ))}
        </select>
        <input name="password" value={password} placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} required />
        <button name="submit" type="submit">Sign Up</button>
      </form>
    ) : error && !id ?
    (
      <div>
        Signup Error: {error}
        <Link
          to={{
            pathname: '/login',
            state: {
              user: {
                yourname,
                email,
                password
              },
            },
          }}
          className="inline-anchor"
        >
          log in
        </Link>
        .
      </div>
    ) : (
      <div>Thank you for registering for this service. Please check your email's inbox for a confirmation link.</div>
    )}
  </div>
}

export default Signup;
