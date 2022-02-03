import { FormEvent, useEffect, useState } from 'react'
import { Col, Container, Row, Form, FormControl, ListGroup } from 'react-bootstrap'
import { io } from 'socket.io-client'
import IMessage from '../types/message'
import IUser from '../types/user'

// STEPS HAPPENING
// 1) io establishes the connection to the server
// 2) if everything goes well, the connection succeed
// 3) if the connection succeeds, the server will send to the client a "connect" event
// 4) the client catches this "connect" event with the .on() method and prints a console log
// 5) the client now is able to send its username to the server, that's done with an .emit() method
// 6) the .emit() method sends an event to the server, with a type (string) and possibly a payload (our username)
// 7) if the server receives the username correctly, will repond us back with a "loggedin" event
// 8) the client sets also a bear trap (an event listener with .on()) for that "loggedin" event and prints a message in the console
// 9) in the meanwhile we're keeping a "loggedIn" state variable up-to-date, so we can enable/disable input fields
// 10) when a user succesfully logs in, he/she will fetch the list of already connected clients with fetchOnlineUsers
// 11) the other clients, when already logged-in, will receive an event of "newConnection" when another clients connects in the meanwhile
// 12) this event of "newConnection" is going to tell them to re-fetch the list of online users, to remain in sync (also when a client disconnects)
// 13) once a user logs in with a valid username, he/she will be able to send a message, emitting a newMessage event
// 14) this event will carry over a message object

const ADDRESS = 'http://localhost:3030'
const socket = io(ADDRESS, { transports: ['websocket'] })
// socket is the instance of our connection with the SERVER

const Home = () => {
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<IUser[]>([])
  const [chatHistory, setChatHistory] = useState<IMessage[]>([])

  // socket.io (both FE&BE) is a event-driven library!
  // the first event that happens when a client connects to the server
  // is a 'connect' event: this is by default
  // so, if the client establishes successfully a connection with the server
  // using io(), will receive back from the server a 'connect' event

  // so our duty, from the FE, will be to emit events or to set up event listeners
  // (like bear traps)

  // our event listeners for anything that will come from the server,
  // the "bear traps", are going to be set just once, when the application loads

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connection is now established!')
    })

    socket.on('loggedin', () => {
      // the "loggedin" event is sent by the server if my username
      // submission went well
      console.log('username successfully registered! :)')
      setLoggedIn(true)
      fetchOnlineUsers()
      // moving the newConnection event listener here makes sure a not-yet
      // logged in user will not be able to receive the newConnection event :)
      socket.on('newConnection', () => {
        // newConnection is an event sent to all the OTHER clients
        // but the one which just connected
        console.log('a new user just connected!')
        fetchOnlineUsers()
      })
      socket.on('message', (message) => {
        console.log('new message received!')
        // how can I receive the message?
        // it's in the argument of the arrow function!
        console.log(message)
        // setChatHistory([...chatHistory, message])
        // this is buggy, because the value of chatHistory is not re-evaluated every time
        // this code is effectively put in memory just once
        setChatHistory((currentChatHistory) => [...currentChatHistory, message])
        // this is the second way of using a setter function of a useState hook,
        // it's reading the current value on-time before returning the new one
      })
    })
  }, [])

  const submitUsername = (e: FormEvent) => {
    e.preventDefault()
    // when this submission happens, I want to send to the server my username!
    // I need to SEND an event :)
    socket.emit('setUsername', { username: username })
    // how can I know if my username at this point has been sent successfully?
    // because in that case, the server is programmed to send me an event back :)
    // so in this case I should receive back an event of type "loggedin"
  }

  const fetchOnlineUsers = async () => {
    try {
      let response = await fetch(ADDRESS + '/online-users')
      if (response.ok) {
        // let { onlineUsers }: { onlineUsers: IUser[] } = await response.json()
        // data is an object with onlineUsers into it, which is the array of users
        let data = await response.json()
        console.log(data)
        let onlineUsers: IUser[] = data.onlineUsers
        setOnlineUsers(onlineUsers)
      } else {
        console.log('error retrieving online users')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleSubmitMessage = (e: FormEvent) => {
    e.preventDefault()
    // message properties:
    // text <- the content of the message, a string
    // sender <- the sender of the message, a string
    // timestamp: <- the timestamp, a number
    // id <- the id of this client-server connection, a string
    const newMessage: IMessage = {
      text: message,
      sender: username,
      id: socket.id,
      timestamp: Date.now(),
    }

    socket.emit('sendmessage', newMessage)
    // let's take care of the sender's view, appending the message
    // to the chat history
    setChatHistory([...chatHistory, newMessage])
    // this will take care of updating just my view!
    setMessage('')
  }

  return (
    <Container fluid className='px-4'>
      <Row className='my-3' style={{ height: '95vh' }}>
        <Col md={10} className='d-flex flex-column justify-content-between'>
          {/* MAIN COLUMN */}
          {/* USERNAME INPUT FIELD */}
          <Form onSubmit={submitUsername}>
            <FormControl
              placeholder='Insert here your username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loggedIn}
            />
          </Form>
          {/* MESSAGES AREA */}
          <ListGroup>
            {chatHistory.map((message, i) => (
              <ListGroup.Item key={i}>
                <strong>{message.sender}</strong>
                <span className='mx-1'> | </span>
                <span>{message.text}</span>
                <span className='ml-2' style={{ fontSize: '0.7rem' }}>
                  {new Date(message.timestamp).toLocaleTimeString('en-US')}
                </span>
              </ListGroup.Item>
            ))}
          </ListGroup>
          {/* NEW MESSAGE AREA */}
          <Form onSubmit={handleSubmitMessage}>
            <FormControl
              placeholder="What's your message?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!loggedIn}
            />
          </Form>
        </Col>
        <Col md={2}>
          {/* CONNECTED CLIENTS COLUMN */}
          <div className='mb-3'>Connected users:</div>
          <ListGroup>
            {onlineUsers.length === 0 && <ListGroup.Item>No users yet</ListGroup.Item>}
            {onlineUsers.map((user) => (
              <ListGroup.Item key={user.id}>{user.username}</ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  )
}

export default Home
