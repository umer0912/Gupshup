import React, { useRef, useState } from 'react';
import './App.css';


import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';
import 'firebase/database';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyAUgGnJFUvxB_L3cbZXoiRHAgx2UVy7nxE",
  authDomain: "chatroom-76365.firebaseapp.com",
  projectId: "chatroom-76365",
  storageBucket: "chatroom-76365.appspot.com",
  messagingSenderId: "142974278068",
  appId: "1:142974278068:web:85e777447a6103437b3ae1",
  measurementId: "G-NJFZV4WYBR"
})

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();
const database = firebase.database();

// Example of reading data from the database
database.ref('users').once('value')
  .then((snapshot) => {
    const data = snapshot.val();
    console.log(data);
  })
  .catch((error) => {
    console.error('Error fetching data:', error);
  });

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header >
        <h1>GupShup</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <p>Do not violate the community guidelines or you will be banned for life!</p>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>
 
<form onSubmit={sendMessage}>

<input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Say something" />

<button type="submit" disabled={!formValue}> <i class="fa fa-paper-plane" aria-hidden="true"></i></button>

</form>
 
   
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  </>)
}


export default App;
