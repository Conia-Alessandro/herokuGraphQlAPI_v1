const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require("mongoose");
const { SecretClient } = require("@azure/keyvault-secrets");
const { DefaultAzureCredential } = require("@azure/identity");

require('dotenv').config();
const PORT = process.env.PORT || 8080;

async function retrieveSecretsAndStartServer() {
    try {
        const server = new ApolloServer({
            typeDefs: require("./data/schema.js"),
            resolvers: require('./data/resolvers.js')
        });

        const vaultUrl = "https://keyfortress.vault.azure.net/";
        const credential = new DefaultAzureCredential();
        const secretClient = new SecretClient(vaultUrl, credential);

        const MONGODB_USERNAME_SECRET_NAME = process.env.MONGODB_USERNAME_SECRET_NAME;
        const MONGODB_PASSWORD_SECRET_NAME = process.env.MONGODB_PASSWORD_SECRET_NAME;

        const [usernameSecret, passwordSecret] = await Promise.all([
            secretClient.getSecret(MONGODB_USERNAME_SECRET_NAME),
            secretClient.getSecret(MONGODB_PASSWORD_SECRET_NAME)
        ]);

        const MONGODB_USERNAME = usernameSecret.value;
        const MONGODB_PASSWORD = passwordSecret.value;

        const connectionString = `mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@127.0.0.1:27017/campaigns?authMechanism=SCRAM-SHA-256&authSource=campaigns`;

        mongoose.set('debug', true);

        await mongoose.connect(connectionString);

        console.log('MongoDB connected successfully');

        await startApolloServer(server);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function startApolloServer(server) {
    await server.start();

    const app = express();
    server.applyMiddleware({ app });

    await new Promise(resolve => app.listen({ port: PORT }, resolve));
    console.log(`Server running at http://localhost:${PORT}${server.graphqlPath}`);
}

retrieveSecretsAndStartServer().catch(error => {
    console.error('Error starting server:', error);
});