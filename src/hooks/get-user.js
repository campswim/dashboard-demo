import apiCall from './api-call';

export default class User {
  id;
  email;
  password;
  name;
  role;
  roleId;
  dateRegistered;
  lastLogin;
  loggedIn;
  failedAttempts;
  error;

  constructor(id = 0, email = null, name = null, role = 'User', roleId = 0, password = null) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.roleId = roleId;
  };

  async getUserRoles() {
    const operation = 'getUserRoles';
    const query = `query ${operation} {${operation} {Id Role Error}}`;
    const result = await apiCall(operation, query).then(
      res => { return res; },
      err => console.error({err})
    );

    return result;
  };

  async getUserRestrictions(roleId) {
    const operation = 'getUserRestrictions';
    const query = `query ${operation}($roleId: Int!) {${operation}(roleId: $roleId) {Id Role RestrictedPages RestrictedActions Error}}`;
    const variables = { roleId };
    const result = await apiCall(operation, query, variables).then(
      res => { return res; },
      err => console.error(err)
    );

    return result;
  };

  async getAllUsers() {
    const operation = 'users';
    const query = `query ${operation} {${operation} {Id Name Email Role RoleId, DateRegistered LastLogin LoggedIn FailedAttempts Active Error}}`;
    const result = await apiCall(operation, query).then(
      res => { return res; },
      err => { console.error({err}) }
    );

    return result;
  };

  async getUserById() {
    const operation = 'userById';
    const query = `query ${operation}($id: ID!) {${operation}(id: $id) {Id Email Name Role DateRegistered LastLogin LoggedIn FailedAttempts Error}}`;
    const variables = { id: this.id }

    const result = await apiCall(operation, query, variables).then(
      res => {
        if (res) {
          if (res.data) {
            const r = res.data[operation];
            this.id = r.Id;
            this.name = r.Name;
            this.email = r.Email;
            this.role = r.Role;
            this.dateRegistered = r.DateRegistered;
            this.lastLogin = r.LastLogin;
            this.loggedIn = r.LoggedIn;
            this.failedAttempts = r.FAiledAttemps;
            this.error = r.Error;
            return res.data[operation];
          }
          else if (res.name) return res.message;
        }
      },
      err => { console.error(err)}
    );

    return result;
  };

  async getUserByEmail() {
    const operation = 'userByEmail';
    const query = `query ${operation}($email: String!) {${operation}(email: $email) {Id, LastLogin, Active}}`;
    const variables = { email: this.email };
    const result = await apiCall(operation, query, variables).then(
      res => { return res; },
      err => { console.error({err}); }
    );

    return result;
  };

  async getAllUsersSansToken() {
    const operation = 'usersSansToken';
    const query = `query users {users {Id Error}}`;
    const result = await apiCall(operation, query).then(
      res => { return res; },
      err => { console.error({err}); }
    );
    
    return result;
  };

  async deleteUser(query, ids) {
    const operation = query;
    query = `mutation ${operation}($ids: [ID]!) {${operation}(ids: $ids) {Id}}`;
    const variables = { ids: ids };
    const results = await apiCall(operation, query, variables).then(
      res => { return res; },
      err => { return err; }
    );

    return results;
  };

  async updateUser(operation, id, column, value) {
    const query = `mutation ${operation}($id: ID!, $column: String!, $newValue: String!) {${operation}(id: $id, column: $column, newValue: $newValue) {${column} Error}}`;
    const variables = {
      id,
      column,
      newValue: value
    };
    
    return await apiCall(operation, query, variables).then(
      res => { return res; },
      err => { return err; }
    );
  }

  async signIn() {
    const operation = 'signin';
    const query = `mutation ${operation}($id: ID!, $password: String!) {${operation}(id: $id, password: $password) {Id Name Role RoleId LastLogin Error}}`;
    const variables = { id: this.id, password: this.password };    
    const result = await apiCall(operation, query, variables).then(
      res => { return res; },
      err => { console.error({err}) }
    );
    return result;
  };

  async signUp() {
    const operation = 'signup';
    const query = `mutation ${operation}($email: String!, $usersName: String!, $password: String!, $role: Int!) {${operation}(email: $email, usersName: $usersName, password: $password, role: $role) {Id Message Error}}`;
    const variables = { email: this.email, usersName: this.name, password: this.password, role: this.role };
    const result = await apiCall(operation, query, variables).then(
      res => { return res; },
      err => { console.error({err}); }
    );

    return result;
  };

  async signOut() {
    const operation = 'signout';
    const mutation = `mutation ${operation} {${operation} {Id, Name, Error}}`;
    const result = await apiCall(operation, mutation).then(
      res => { return res },
      err => { console.error({err}); }
    );

    return result;
  };

  async changePassword(firstSignin) {
    const operation = 'changePassword';
    const mutation = `mutation ${operation}($id: ID!, $password: String!, $firstSignin: Boolean!) {${operation}(id: $id, password: $password, firstSignin: $firstSignin) {Id Name Role RoleId LastLogin Error}}`;
    const variables = { id: this.id, password: this.password, firstSignin };
    const result = await apiCall(operation, mutation, variables).then(
      res => { return res },
      err => { console.error({err}); }
    );
    
    return result;
  };
}