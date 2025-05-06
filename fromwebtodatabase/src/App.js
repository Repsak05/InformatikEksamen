// src/App.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');

  const fetchUsers = async () => {
    const res = await axios.get('/users');
    setUsers(res.data);
  };
  
  const addUser = async () => {
    await axios.post('/users', { name });
    setName('');
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h1>Users</h1>
      <input value={name} onChange={e => setName(e.target.value)} />
      <button onClick={addUser}>Add</button>
      <ul>
        {users.map(u => <li key={u.id}>{u.name}</li>)}
      </ul>
    </div>
  );
}

export default App;
