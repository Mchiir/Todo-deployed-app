const User = require('../models/User')
const graphql = require('./util')
const { GraphQLObjectType, GraphQLString, GraphQLNonNull, GraphQLSchema } = graphql
const bcrypt = require('bcrypt')
const { jwt } = require('jsonwebtoken')


const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLString },
        email: { type: GraphQLString },
        token: { type: GraphQLString }
    })
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
                await user.save();

                
            }
        }
    }
})