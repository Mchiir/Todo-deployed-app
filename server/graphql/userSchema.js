const User = require('../models/User')
const graphql = require('./util')
const { GraphQLObjectType, GraphQLString, GraphQLNonNull, GraphQLSchema } = graphql
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLString },
        email: { type: GraphQLString },
        token: { type: GraphQLString }
    })
})


// Dummy query
const RootQuery = new GraphQLObjectType({
    name: 'Query',
    fields: {
        hello: {
            type: GraphQLString,
            resolve: () => 'GraphQL API is working!'
        }
    }
})


const RootMutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        // Register
        register: {
            type: UserType,
            args: {
                email: { type: new GraphQLNonNull(GraphQLString) },
                password: { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(_, { email, password}) {
                const existingUser = await User.findOne({ email });
                if ( existingUser ) throw new Error('User already exists');
                
                const hashedPassword = await bcrypt.hash(password, 10);
                const user = new User({ email, hashed_password: hashedPassword });
                return await user.save();
            }
        },
        // login
        login: {
            type: UserType,
            args: {
                email: { type: new GraphQLNonNull(GraphQLString) },
                password: { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(_, { email, password }) {
                const user = await User.findOne({ email });
                if (!user) throw new Error('User not found');

                const valid = await bcrypt.compare(password, user.hashed_password);
                if (!valid) throw new Error('Invalid cridentials')

                const token = jwt.sign({ userID: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' })
                return { email: user.email, token }
            }
        }
    }
})


// testing
/**
 * POST req
 * mutation {
  login(email: "krak@gmail.com", password: "krak") {
    email
    token
  }
}
 * 
 */


/**
 * 
 * POST req
 * mutation {
  register(email: "remy@gmail.com", password: "remy123") {
    id
    email
  }
}
 */
module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation
})