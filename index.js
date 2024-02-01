const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const resolvers = require('./data/resolvers.js');
const typeDefs = require("./data/schema.js");

const PORT = process.env.PORT || 8080;

const server = new ApolloServer({ typeDefs, resolvers });

async function startApolloServer() {
    await server.start();

    const app = express();
    server.applyMiddleware({ app });

    await new Promise(resolve => app.listen({ port: PORT }, resolve));
    console.log(`Server running at http://localhost:${PORT}${server.graphqlPath}`);
}

startApolloServer().catch(error => {
    console.error('Error starting server:', error);
});
