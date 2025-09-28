require("dotenv").config()
const request = require("supertest")
const mongoose = require("mongoose")
const app = require("../server.js")
const { reqAddTodo } = require("../util/server.test.data.js")

// Unit Tests for Todo and User Endpoints

describe("GET /todos/:userEmail", () => {
    it("Should return not authenticated yet error", async () => {
        return request(app)
            .get("/todos/mugishachrispin590@gmail.com")
            .expect('Content-Type', "application/json; charset=utf-8")
            .expect(401)
            .then((res) => {
                expect(res.statusCode).toBe(401)
            })
    })
})

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFzZGZAZ21haWwuY29tIiwiaWF0IjoxNzU5MDQ1Mzg5LCJleHAiOjE3NTkwNDg5ODl9.xW_VhcYkP6NOBad8SUJrEdLp5KWyEAf_JK7cMUb8eOY"
describe("GET /todos/:userEmail", () => {
    it("Sould return all todos", async () => {
        return request(app)
            .get("/todos/mugishachrispin590@gmail.com")
            .set('Authorization', `Bearer ${token}`)
            .expect("Content-Type", /application\/json/)
            .expect(200)
    })
})

describe("POST /todos/")

afterAll(async () => {
    await mongoose.connection.close()
})