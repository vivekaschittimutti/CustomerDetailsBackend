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

app.get('/customer/', async (request, response) => {
  const getCustomersQuery = `
  SELECT * FROM customer;`

  const getCustomers = await db.all(getCustomersQuery)
  response.send({
    getCustomers,
  })
})

app.get('/customer/:customerId/', async (request, response) => {
  const {customerId} = request.params

  const getCustomerQuery = `
  SELECT * FROM customer WHERE id = ${customerId};`

  const getCustomer = await db.get(getCustomerQuery)
  response.send([
    {
      id: getCustomer.id,
      firstName: getCustomer.firstName,
      lastName: getCustomer.lastName,
      phoneNumber: getCustomer.phoneNumber,
      email: getCustomer.email,
      address: getCustomer.address,
    },
  ])
})

app.post('/customer/', async (request, response) => {
  const {id, firstName, lastName, phoneNumber, email, address} = request.body

  const insertCustomer = `
        INSERT INTO customer (id,firstName, lastName, phoneNumber, email,address)
        VALUES ('${id}','${firstName}','${lastName}',${phoneNumber},'${email}','${address}');`
  await db.run(insertCustomer)
  response.send('Customer Successfully Added')
})

app.delete('/customer/:customerId/', async (request, response) => {
  const {customerId} = request.params

  const deleteCustomerQuery = `
  DELETE FROM customer WHERE id = '${customerId}';`

  const deleteCustomer = await db.get(deleteCustomerQuery)
  response.send('Customer Deleted')
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
  updateCustomerQuery = `
      UPDATE customer SET firstName = '${firstName}',lastName = '${lastName}',
    phoneNumber = '${phoneNumber}',
    email = '${email}',
    address = '${address}' WHERE id = '${customerId}';`
  msg = 'CustomerDetails Updated'

  await db.run(updateCustomerQuery)
  response.send(msg)
})

module.exports = app
