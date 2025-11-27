import {useState} from 'react';

import './App.css'

function App() {

  const [usename, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [joined, setJoined] = useState(false);


  const joineRoom = () => {

  }


  
  return (
    <>
    <div>
    {
      !joined ? (
        <div> <h2>Join Chat Room</h2>
        <input 
        type="text"
        placeholder='Username...'
        value={username}
        onChange={(e) => setUsername(e.target.value)}
         />
         
         <input 
        type="text"
        placeholder='Room Id'
        value={room}
        onChange={(e) => setRoom(e.target.value)}
         />
        
        
        
        
        
        </div>
      ): 
      (
        <div> Joined</div>
      )
    }  
    </div>   
    </>
  )
}

export default App
