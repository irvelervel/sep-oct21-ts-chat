import { useState } from 'react'
import { Col, Container, Row, Form, FormControl, ListGroup } from 'react-bootstrap'
import { io } from 'socket.io-client'

const ADDRESS = 'http://localhost:3030'
const socket = io(ADDRESS, { transports: ['websocket'] })

const Home = () => {
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState('')
  const [onlineUsers, setOnlineUsers] = useState([])

  return (
    <Container fluid className='px-4'>
      <Row className='my-3' style={{ height: '95vh' }}>
        <Col md={10} className='d-flex flex-column justify-content-between'>
          {/* MAIN COLUMN */}
          {/* USERNAME INPUT FIELD */}
          <Form onSubmit={() => {}}>
            <FormControl
              placeholder='Insert here your username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
