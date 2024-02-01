const express = require('express');
const {graphqlHTTP} = require('express-graphql');
const schema = require('./data/schema.js');
const resolvers =require('./data/resolvers.js');

const app = express();

const PORT = process.env.PORT || 8080;

const root = resolvers;

app.use("/graphql", graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
}));


app.listen(PORT, () =>{ console.log(`server running on port localhost:${PORT}/graphql`)})