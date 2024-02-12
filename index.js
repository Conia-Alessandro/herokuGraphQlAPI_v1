const express = require('express');
const { ApolloServer} = require('apollo-server-express');
const mongoose = require("mongoose");
const resolvers = require('./data/resolvers.js');
const typeDefs = require("./data/schema.js");
require('dotenv').config();
const PORT = process.env.PORT || 8080;

const server = new ApolloServer({ typeDefs, resolvers });

//MONGODB Required Strings
const MONGODB_USERNAME = process.env.MONGODB_USERNAME || 'campaignsCH1EF';
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD || 'CH13Fdevelopment';

console.log(`A bunch of enviromental variables: ${process.env.MONGODB_URI} and ${process.env.INSTITUTIONNAME}`);
// Construct the connection string with authentication options
//mongodb://campaignsCH1EF:CH13Fdevelopment@localhost:27017/?authMechanism=SCRAM-SHA-256&authSource=campaigns
const connectionString = `mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@127.0.0.1:27017/campaigns?authMechanism=SCRAM-SHA-256&authSource=campaigns`;

//const connectionString = "mongodb://127.0.0.1:27017/campaigns";
//debug
mongoose.set('debug', true);

// Establish MongoDB connection
// to: mongodb://campaignsCH1EF:CH13Fdevelopment@localhost:27017/
mongoose.connect(connectionString)
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });

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
