require("dotenv").config()
const request = require("supertest")
const mongoose = require("mongoose")
const app = require("../server.js")
const { reqAddTodo } = require("../util/server.test.data.js")

// Unit Tests for Todo and User Endpoints

let token = ""    // Will hold JWT for authenticated requests
let todoId = ""   // Will hold created todo _id

const testUser = { // registered using postman
    email: "user@gmail.com",
    password: "User@12345"
}

beforeAll(async () => {
    // Login and get JWT
    const res = await request(app)
        .post("/login")
        .send(testUser)
        .expect(200)

    token = res.body.token
})

// ------------------- GET /todos -------------------
describe("GET /todos", () => {
    it("Should return not authenticated yet error", async () => {
        await request(app)
            .get("/todos")
            .expect("Content-Type", /application\/json/)
            .expect(401)
            .then(res => {
                expect(res.body.message).toBe("No token found")
            })
    })

    it("Should return all todos for authenticated user", async () => {
        await request(app)
            .get("/todos")
            .set("Authorization", `Bearer ${token}`)
            .expect("Content-Type", /application\/json/)
            .expect(200)
            .then(res => {
                expect(Array.isArray(res.body)).toBe(true)
            })
    })
})

// ------------------- POST /todos -------------------
describe("POST /todos", () => {
    it("Should create a todo", async () => {
        await request(app)
            .post("/todos")
            .set("Authorization", `Bearer ${token}`)
            .send(reqAddTodo)
            .expect("Content-Type", /application\/json/)
            .expect(201)
            .then(res => {
                const newTodo = res.body
                expect(newTodo).toHaveProperty("_id")
                expect(newTodo.title).toBe(reqAddTodo.title)
                todoId = newTodo._id // Save for PUT/DELETE
            })
    })

    it("Should fail if data is incomplete", async () => {
        await request(app)
            .post("/todos")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "Incomplete" }) // Missing progress & date
            .expect(409)
            .then(res => {
                expect(res.body.message).toBe("Please provide complete valid data.")
            })
    })
})


// ------------------- PUT /todos/:id -------------------
describe("PUT /todos/:id", () => {
    it("Should update an existing todo", async () => {
        const updatedData = { title: "Updated Title", progress: 50, date: new Date() }

        await request(app)
            .put(`/todos/${todoId}`)
            .set("Authorization", `Bearer ${token}`)
            .send(updatedData)
            .expect(200)
            .then(res => {
                expect(res.body.success).toBe("Todo updated successfully")
                expect(res.body.updatedTodo.title).toBe(updatedData.title)
            })
    })

    it("Should return 404 if todo not found", async () => {
        const fakeId = new mongoose.Types.ObjectId()

        await request(app)
            .put(`/todos/${fakeId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ title: "Test", progress: 20, date: new Date() })
            .expect(404)
            .then(res => {
                expect(res.body.message).toBe("Todo not found")
            })
    })
})

// ------------------- DELETE /deleteTodo/:id -------------------
describe("DELETE /deleteTodo/:id", () => {
    it("Should delete an existing todo", async () => {
        await request(app)
            .delete(`/deleteTodo/${todoId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200)
            .then(res => {
                expect(res.body.success).toBe("Todo deleted successfully")
            })
    })

    it("Should return 404 if todo not found", async () => {
        const fakeId = new mongoose.Types.ObjectId() // valid but incorrect id, using a random string triggers 500 server error from mongoose

        await request(app)
            .delete(`/deleteTodo/${fakeId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(404)
            .then(res => {
                expect(res.body.message).toBe("Todo not found")
            })
    })
})

// ------------------- Close DB -------------------
afterAll(async () => {
    await mongoose.connection.close()
})