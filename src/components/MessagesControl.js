import sendIcon from '../assets/send.png';
import attachment from '../assets/paper-clip.png';
import cancel from '../assets/cancel.png';
import image from '../assets/image.png';

export default function MessagesControl(props) {
  const {
    sendMessage,
    value,
    onChange,
    groupMessage,
    sortNames,
    username,
    receiver,
    setMedia,
    onChatClose,
    media,
  } = props;
  const messages = groupMessage
    ? groupMessage[sortNames(username, receiver)]
    : [];
  return (
    <div>
      <div className="online-users-header">
        <div style={{ margin: '0 10px' }}>{receiver}</div>
        <div style={{ margin: '0 10px', cursor: 'pointer' }}>
          <img
            onClick={onChatClose}
            width={10}
            src={cancel}
            alt="close-chat-window"
          />
        </div>
      </div>
      <div className="message-area">
        <ul>
          {messages && messages.length > 0
            ? messages.map((msg, index) => (
                <li
                  style={{
                    flexDirection:
                      username === msg.receiver ? 'row' : 'row-reverse',
                  }}
                  key={index}
                >
                  <div className="user-pic">
                    <img
                      src={require(`../users/${msg.avatar}`).default}
                      alt="default-user-pic"
                    />
                  </div>
                  {/* show media and message if any */}
                  <div>
                    {msg.media && msg.media.image ? (
                      <div className="image-container">
                        <img src={msg.media.content} alt="media" width={200} />
                      </div>
                    ) : null}
                    {msg.message !== '' ? (
                      <div className="message-text">{msg.message}</div>
                    ) : null}
                  </div>
                </li>
              ))
            : null}
        </ul>
      </div>
      <div>
        {/*  show selected image name */}
        {media !== null ? (
          <div className="attachment-display">
            <img src={image} alt="media-icon" />
            <span>{media.name}</span>
            <span className="remove-attachment">x</span>
          </div>
        ) : null}

        {/* text box after message area */}
        <form onSubmit={sendMessage} className="message-control">
          <textarea
            value={value}
            onChange={onChange}
            placeholder="Type something...!"
          ></textarea>
          <div className="file-input-container">
            <input
              id="images"
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function () {
                  console.log(reader.result);
                  setMedia({
                    image: true,
                    content: reader.result,
                    name: file.name,
                  });
                };
                reader.onerror = function (error) {
                  console.log(error);
                };
              }}
            />
            <label htmlFor="images">
              <img width="20" src={attachment} alt={''} />
            </label>
          </div>
          <button>
            <img src={sendIcon} alt="send-icon" />
            <span style={{ display: 'inline-block' }}>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
