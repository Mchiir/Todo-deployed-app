const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

// Define schema
const schema = buildSchema(`
  type Todo {
    id: ID!
    userEmail: String!
    title: String!
    completed: Boolean!
  }

  type Query {
    todos(userEmail: String!): [Todo]
  }

  type Mutation {
    createTodo(userEmail: String!, title: String!): Todo
    updateTodo(id: ID!, title: String, completed: Boolean): Todo
    deleteTodo(id: ID!): String
  }
`);

// Dummy data or connect to DB
const todosDB = [];

const root = {
    todos: ({ userEmail }) => todosDB.filter(todo => todo.userEmail === userEmail),
    createTodo: ({ userEmail, title }) => {
        const newTodo = { id: String(Date.now()), userEmail, title, completed: false };
        todosDB.push(newTodo);
        return newTodo;
    },
    updateTodo: ({ id, title, completed }) => {
        const todo = todosDB.find(t => t.id === id);
        if (!todo) return null;
        if (title !== undefined) todo.title = title;
        if (completed !== undefined) todo.completed = completed;
        return todo;
    },
    deleteTodo: ({ id }) => {
        const index = todosDB.findIndex(t => t.id === id);
        if (index > -1) {
            todosDB.splice(index, 1);
            return "Deleted";
        }
        return "Not found";
    }
};