import './App.css';
import logo from './assets/chat.png';
import io from 'socket.io-client';
import { useEffect, useRef, useState } from 'react';
import CreateUser from './components/CreateUser';
import OnlineUsers from './components/OnlineUsers';
import MessagesControl from './components/MessagesControl';
const socket = io(`http://localhost:7000/`);

function App() {
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState({});
  const [message, setMessage] = useState('');
  const [receiver, setReceiver] = useState('');
  const [media, setMedia] = useState(null);
  const [avatar, setAvatar] = useState('');
  const [groupMessage, setGroupMessage] = useState({});
  const receiverRef = useRef(null);

  const sortNames = (username1, username2) => {
    return [username1, username2].sort().join('-');
  };

  // create user
  const onCreateUser = () => {
    socket.emit('newUser', username);
    setStep((prevStep) => prevStep + 1);
    const a = parseInt(Math.floor(Math.random() * 8) + 1) + '.png';
    setAvatar(a);
  };

  // on select user
  const onUserSelect = (username) => {
    setReceiver(username);
    receiverRef.current = username;
    setStep((prevStep) => prevStep + 1);
  };

  // sendMessage
  const sendMessage = (e) => {
    e.preventDefault();
    const data = {
      sender: username,
      receiver,
      message,
      media,
      avatar,
      view: false,
    };
    // here i am sending message
    socket.emit('send_message', data);

    // for me view is always going to be  true
    const key = sortNames(username, receiver);
    const tempGroupMessage = { ...groupMessage };
    if (key in tempGroupMessage) {
      tempGroupMessage[key] = [
        ...tempGroupMessage[key],
        { ...data, view: true },
      ];
    } else {
      tempGroupMessage[key] = [{ ...data, view: true }];
    }
    setGroupMessage({ ...tempGroupMessage });

    // once media delivered then remove it
    if (media !== null) {
      setMedia(null);
    }

    // set message  null while sending media
    setMessage('');

    /* login to group messages */
    // irfan, sana [irfan-sana] =>[m1,m2,m3]
    // irfan, saloni[irfan-saloni]=>[m1,m2,m3]
    // saloni, sana[saloni-sana] =>[m1,m2,m3]
  };

  // message count
  const checkUnseenMessages = (receiver) => {
    let unseenMessages = [];
    const key = sortNames(username, receiver);
    if (key in groupMessage) {
      unseenMessages = groupMessage[key].filter((msg) => !msg.view);
    }
    return unseenMessages.length;
  };

  // on chat close:step 1 is list of users
  const onChatClose = () => {
    setStep(1);
    receiverRef.current = null;
  };
  // store connected user and group received messages
  useEffect(() => {
    socket.on('allUsers', (users) => {
      setUsers(users);
    });

    /* receive new messages */
    socket.on('new_message', (data) => {
      console.log({ rec: receiverRef.current, data });

      setGroupMessage((prevGroupMessage) => {
        const messages = { ...prevGroupMessage };
        const key = sortNames(data.sender, data.receiver);
        // set message count when chat window is open
        if (receiverRef.current === data.sender) {
          data.view = true;
        }

        if (key in messages) {
          messages[key] = [...messages[key], data];
        } else {
          messages[key] = [data];
        }
        return { ...messages };
      });
    });
  }, []);

  // when receiver chage update the view
  useEffect(() => {
    updateMessageView();
  }, [receiver]);

  // udate view message
  const updateMessageView = () => {
    const key = sortNames(username, receiver);
    if (key in groupMessage) {
      const messages = groupMessage[key].map((msg) =>
        !msg.view
          ? {
              ...msg,
              view: true,
            }
          : msg
      );
      groupMessage[key] = [...messages];
      setGroupMessage({ ...groupMessage });
    }
  };

  // to auto scroll chat window upto the message
  const gotoBottom = () => {
    const el = document.querySelector('.message-area ul');
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  };

  // writting useEfect for gotoBottom coz when ever change then call it
  useEffect(() => {
    const key = sortNames(username, receiver);
    if (key in groupMessage) {
      if (groupMessage[key].length > 0) {
        gotoBottom();
      }
    }
  }, [groupMessage]);

  return (
    <div className="App">
      <header className="app-header">
        <img src={logo} alt="chatimage"></img>
        <div className="app-name b-500 primaryColor">My Chat</div>
      </header>
      <div className="chat-system">
        <div className="chat-box">
          {/* step 1: ask user name */}
          {step === 0 ? (
            <CreateUser
              onCreateUser={onCreateUser}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          ) : null}

          {/* step 2 : show all available user */}

          {step === 1 ? (
            <OnlineUsers
              username={username}
              users={users}
              onUserSelect={onUserSelect}
              checkUnseenMessages={checkUnseenMessages}
            />
          ) : null}

          {/* step 3 : select user and switch to chat window */}
          {step === 2 ? (
            <MessagesControl
              sendMessage={sendMessage}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              groupMessage={groupMessage}
              sortNames={sortNames}
              username={username}
              receiver={receiver}
              setMedia={setMedia}
              onChatClose={onChatClose}
              media={media}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default App;
