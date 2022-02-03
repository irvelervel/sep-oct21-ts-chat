import { FormEvent, useEffect, useState } from 'react'
import { Col, Container, Row, Form, FormControl, ListGroup } from 'react-bootstrap'
import { io } from 'socket.io-client'

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

const ADDRESS = 'http://localhost:3030'
const socket = io(ADDRESS, { transports: ['websocket'] })
// socket is the instance of our connection with the SERVER

const Home = () => {
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])

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
            <ListGroup.Item>Cras justo odio</ListGroup.Item>
            <ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
            <ListGroup.Item>Morbi leo risus</ListGroup.Item>
            <ListGroup.Item>Porta ac consectetur ac</ListGroup.Item>
            <ListGroup.Item>Vestibulum at eros</ListGroup.Item>
          </ListGroup>
          {/* NEW MESSAGE AREA */}
          <Form onSubmit={() => {}}>
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
            <ListGroup.Item>Cras justo odio</ListGroup.Item>
            <ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
            <ListGroup.Item>Morbi leo risus</ListGroup.Item>
            <ListGroup.Item>Porta ac consectetur ac</ListGroup.Item>
            <ListGroup.Item>Vestibulum at eros</ListGroup.Item>
          </ListGroup>
        </Col>
      </Row>
    </Container>
  )
}

export default Home
