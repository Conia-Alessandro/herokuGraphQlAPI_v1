const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require("mongoose");
const { SecretClient } = require("@azure/keyvault-secrets");
const { ManagedIdentityCredential, EnvironmentCredential, DefaultAzureCredential, ClientSecretCredential } = require("@azure/identity"); //DefaultAzureCredential could be added if required
// Allow Cross origin (access from everywhere. Can be specified to only allow access to allowed endpoints)
const cors = require('cors');
// Require Dotenv keys
require('dotenv').config();

const PORT = process.env.PORT || 8080;
/**
 * a function that retrieves the secrets from the Azure Vault specified by the path process.env.AZ_VAULT_URL
 */
async function retrieveSecretsAndStartServer() {
    try {
        const server = new ApolloServer({
            typeDefs: require("./data/schema.js"),
            resolvers: require('./data/resolvers.js')
        });

        const VAULT_URL = `${process.env.AZ_VAULT_URL}`;
        const credential = new DefaultAzureCredential(); //this method utilizes one of the various Azure methods to connect.

        const secretClient = new SecretClient(VAULT_URL, credential);

        //Known Credentials and path retrieval
        const MONGODB_USERNAME_SECRET_NAME = process.env.MONGODB_USERNAME_SECRET_NAME;
        const MONGODB_PASSWORD_SECRET_NAME = process.env.MONGODB_PASSWORD_SECRET_NAME;
        const MONGODB_DB_URL = process.env.MONGODB_DB_URL;
        const MONGODB_DEFAULT_DB = process.env.MONGODB_DEFAULT_DB;
        const MONGODB_DEFAULT_GROUP = process.env.MONGODB_DEFAULT_GROUP;
        const MONGODB_AUTH_MECHANISM = process.env.MONGODB_AUTH_MECHANISM;

        const [usernameSecret, passwordSecret] = await Promise.all([
            secretClient.getSecret(MONGODB_USERNAME_SECRET_NAME),
            secretClient.getSecret(MONGODB_PASSWORD_SECRET_NAME)
        ]);
        // Store retrieved secret values
        const MONGODB_USERNAME = usernameSecret.value;
        const MONGODB_PASSWORD = passwordSecret.value;

        const connectionString = `mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_DB_URL}/${MONGODB_DEFAULT_DB}?authMechanism=${MONGODB_AUTH_MECHANISM}&authSource=${MONGODB_DEFAULT_GROUP}`;

        mongoose.set('debug', true);
        /*
          useNewUrlParser: true,
                    useUnifiedTopology: true, // Ensure using the latest options
                    tls: true, // Enable TLS
                    tlsAllowInvalidCertificates: false // Ensure to validate certificates
        */
        await mongoose.connect(connectionString);

        console.log('MongoDB connected successfully');

        await startApolloServer(server);
    } catch (error) {
        console.error('Error:', error);
    }
}
/**
 * Starts the Apollo server as an Express app, which listens to a specific port and resolvers to the graphqlPath specified in ApolloGraph
 * @param {ApolloServer} server the Apollo server created from it's specific function
 */
async function startApolloServer(server) {
    await server.start();

    const app = express();

    //Enable CORS

    app.use(cors());

    server.applyMiddleware({ app });

    //start the server
    await new Promise(resolve => app.listen({ port: PORT }, resolve));
    console.log(`Server running at http://localhost:${PORT}${server.graphqlPath}`);
}

retrieveSecretsAndStartServer().catch(error => {
    console.error('Error starting server:', error);
});