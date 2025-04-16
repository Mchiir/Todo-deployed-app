const graphql = require('./util')
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull
} = graphql

const Todo = require('../models/Todo')

const TodoType = new GraphQLObjectType({
    name: 'Todo',
    fields: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        user_email: { type: new GraphQLNonNull(GraphQLString) },
        title: { type: new GraphQLNonNull(GraphQLString) },
        progress: { type: new GraphQLNonNull(GraphQLInt) },
        date: { type: new GraphQLNonNull(GraphQLString) }
    }
})


// Root Query
const RootQuery = new GraphQLObjectType({
    name: 'Query',
    fields: {
        todos: {
            type: new GraphQLList(TodoType),
            args: {
                user_email: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve: async (_, args) => {
                return await Todo.find({ user_email: args.user_email });
            }
        }
    }
});


// Root Mutation
const RootMutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addTodo: {
            type: TodoType,
            args: {
                user_email: { type: new GraphQLNonNull(GraphQLString) },
                title: { type: new GraphQLNonNull(GraphQLString) },
                progress: { type: new GraphQLNonNull(GraphQLInt) },
                date: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve: async (_, args) => {
                const { v4: uuidv4 } = require('uuid');
                const newTodo = new Todo({ id: uuidv4(), ...args });
                return await newTodo.save();
            }
        },
        updateTodo: {
            type: TodoType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) },
                title: { type: new GraphQLNonNull(GraphQLString) },
                progress: { type: new GraphQLNonNull(GraphQLInt) },
                date: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve: async (_, args) => {
                return await Todo.findOneAndUpdate(
                    { id: args.id },
                    { title: args.title, progress: args.progress, date: args.date },
                    { new: true }
                );
            }
        },
        deleteTodo: {
            type: TodoType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve: async (_, args) => {
                return await Todo.findOneAndDelete({ id: args.id });
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation
});