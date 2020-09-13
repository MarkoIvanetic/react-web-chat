/** @jsx jsx */
import React, { Component } from 'react';
import Header from '../components/Header';
import { auth } from '../services/firebase';
import { db } from '../services/firebase';
import { getRandomInt } from '../helpers/shared-service';

import { jsx, css } from '@emotion/core';

const ROOM_BG_SEED_WIDTH = 287;
const ROOM_BG_SEED_HEIGHT = 191;

export default class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: auth().currentUser,
      activeRoomId: null,
      rooms: {},
      chats: [],
      content: '',
      readError: null,
      writeError: null,
      loadingChats: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.createNewRoom = this.createNewRoom.bind(this);
    this.myRef = React.createRef();
  }

  async componentDidMount() {
    this.setState({ readError: null, loadingChats: true });
    const chatArea = this.myRef.current;

    db.ref('rooms')
      .once('value')
      .then((snapshot) => {
        // snapshot.val()
        // activeRoomId = Object.keys(snapshot.val())[0]);
        this.setState({ activeRoomId: Object.keys(snapshot.val())[0] });
      });

    try {
      db.ref('rooms').on('value', (snapshot) => {
        let rooms = {};

        snapshot.forEach((snap) => {
          rooms[snap.key] = snap.val();
        });

        this.setState({ rooms });
      });

      db.ref('chats').on('value', (snapshot) => {
        let chats = [];

        snapshot.forEach((snap) => {
          chats.push(snap.val());
        });

        chats.sort(function (a, b) {
          return a.timestamp - b.timestamp;
        });

        this.setState({ chats });

        chatArea.scrollBy(0, chatArea.scrollHeight);

        this.setState({ loadingChats: false });
      });
    } catch (error) {
      this.setState({ readError: error.message, loadingChats: false });
    }
  }

  handleChange(event) {
    this.setState({
      content: event.target.value
    });
  }

  async handleSubmit(event) {
    event.preventDefault();

    this.setState({ writeError: null });

    const chatArea = this.myRef.current;

    try {
      await db.ref('chats').push({
        room: this.state.activeRoomId,
        content: this.state.content,
        timestamp: Date.now(),
        photoURL: this.state.user.photoURL,
        senderName: this.state.user.displayName,
        uid: this.state.user.uid
      });
      this.setState({ content: '' });
      chatArea.scrollBy(0, chatArea.scrollHeight);
    } catch (error) {
      this.setState({ writeError: error.message });
    }
  }

  async createNewRoom(event) {
    event.preventDefault();

    try {
      await db.ref('rooms').push({
        name: 'asdas',
        admin: this.state.user.uid,
        bg_pos: getRandomInt(ROOM_BG_SEED_WIDTH) + 'px ' + getRandomInt(ROOM_BG_SEED_HEIGHT) + 'px',
        chat: []
      });

      // this.setState({ content: '' });
    } catch (error) {
      this.setState({ writeError: error.message });
    }
  }

  formatTime(timestamp) {
    const d = new Date(timestamp);
    // const time = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`;
    const time = `${d.getHours()}:${d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()}`;
    return time;
  }

  render() {
    let _activeRoomChat = this.state.chats.filter((chat) => chat.room === this.state.activeRoomId);

    return (
      <div>
        <Header />

        <div className="chat-interface">
          <div className="room-list">
            {Object.keys(this.state.rooms).map((roomId) => {
              return (
                <div
                  className={"room-container " + (roomId === this.state.activeRoomId ? 'active-room' : '')}
                  key={roomId}
                  onClick={() => {
                    this.setState({ activeRoomId: roomId });
                  }}
                >
                  <span
                    className="room-image"
                    css={css`
                      background-position: ${this.state.rooms[roomId].bg_pos};
                    `}
                  />
                  <span class="room-name">{this.state.rooms[roomId].name}</span>  
                </div>
              );
            })}
            <button onClick={this.createNewRoom}>Create New Room</button>
          </div>

          <div className="chat-container" ref={this.myRef}>
            {/* loading indicator */}
            {this.state.loadingChats ? (
              <div className="spinner-border text-success" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            ) : (
              ''
            )}
            {!_activeRoomChat.length ? (
              <p>
                <span>No new messages...</span>
              </p>
            ) : (
              _activeRoomChat.map((chat) => {
                return (
                  <div
                    key={chat.timestamp}
                    css={css`
                      display: flex;
                    `}
                  >
                    <p className={'chat-bubble ' + (this.state.user.uid === chat.uid ? 'current-user' : '')}>
                      <img src={chat.photoURL} />

                      <span className="chat-info">
                        <span className="chat-sender">{chat.senderName}</span>
                        <span className="chat-message">{chat.content}</span>
                        <span className="chat-time">{this.formatTime(chat.timestamp)}</span>
                      </span>
                    </p>
                  </div>
                );
              })
            )}

            <form onSubmit={this.handleSubmit}>
              <textarea className="form-control" name="content" onChange={this.handleChange} value={this.state.content}></textarea>
              {this.state.error ? <p className="text-danger">{this.state.error}</p> : null}
              <button type="submit" className="btn btn-submit px-5 mt-4">
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
