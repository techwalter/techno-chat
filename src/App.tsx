import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: 'AIzaSyA7xh6VssDUaonvlNGREd64c8-IDttCRtY',
    authDomain: 'techno-chat-94200.firebaseapp.com',
    databaseURL: 'https://techno-chat-94200-default-rtdb.firebaseio.com',
    projectId: 'techno-chat-94200',
    storageBucket: 'techno-chat-94200.appspot.com',
    messagingSenderId: '1010816202698',
    appId: '1:1010816202698:web:2864657c285c5310d30133',
    measurementId: 'G-492W2HLXSQ',
  });
} else {
  firebase.app(); // if already initialized, use that one
}

const auth = firebase.auth();
const firestore = firebase.firestore();
// const analytics = firebase.analytics();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Techno Chat</h1>
        <SignOut />
      </header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy: any = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const { uid, photoURL, displayName } = auth.currentUser as any;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
      displayName,
    });

    setFormValue('');
    dummy?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg: any) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="say something nice"
        />

        <button type="submit" disabled={!formValue}>
          🕊️
        </button>
      </form>
    </>
  );
}

function ChatMessage(props: {
  message: { text: any; uid: any; photoURL: any; displayName: any };
}) {
  const { text, uid, photoURL, displayName } = props.message;

  const messageClass = uid === auth?.currentUser?.uid ? 'sent' : 'received';

  return (
    <>
      <div className={`message ${messageClass}`} title={displayName}>
        <img
          src={
            photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'
          } alt="user_img"
        />
        <p>{text}</p>
      </div>
    </>
  );
}

export default App;
