const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'customerDetails.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const hasPriorityAndStatusProperties = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

app.get('/customer/', async (request, response) => {
  const getTodoQuery = `
  SELECT * FROM customer;`

  const getTodo = await db.all(getTodoQuery)
  response.send({
    getTodo,
  })
})

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params

  const getTodoQuery = `
  SELECT * FROM todo WHERE id = ${todoId};`

  const getTodo = await db.get(getTodoQuery)
  response.send({
    id: getTodo.id,
    todo: getTodo.todo,
    priority: getTodo.priority,
    status: getTodo.status,
  })
})

app.post('/customer/', async (request, response) => {
  const {id, firstName, lastName, phoneNumber, email, address} = request.body

  const insertTodo = `
        INSERT INTO customer (id,firstName, lastName, phoneNumber, email,address)
        VALUES ('${id}','${firstName}','${lastName}',${phoneNumber},'${email}','${address}');`
  await db.run(insertTodo)
  response.send('Todo Successfully Added')
})

app.delete('/customer/:customerId/', async (request, response) => {
  const {customerId} = request.params

  const deleteTodoQuery = `
  DELETE FROM customer WHERE id = '${customerId}';`

  const deleteTodo = await db.get(deleteTodoQuery)
  response.send('Todo Deleted')
})

app.put('/customer/:customerId/', async (request, response) => {
  const {customerId} = request.params
  const {
    firstName = '',
    lastName = '',
    phoneNumber = '',
    email = '',
    address = '',
  } = request.body
  updateTodosQuery = `
      UPDATE customer SET firstName = '${firstName}',lastName = '${lastName}',
    phoneNumber = '${phoneNumber}',
    email = '${email}',
    address = '${address}' WHERE id = '${customerId}';`
  msg = 'Status Updated'

  await db.run(updateTodosQuery)
  response.send(msg)
})

module.exports = app
