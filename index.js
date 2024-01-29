import express from 'express';
//import {graphqlHTTP} from 'express-graphql';
//import schema from "./data/schema";
//import resolvers from "./data/resolvers";

const app = express();

const PORT = 8080;
/*
const root = resolvers;

app.use("/graphql", graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
}));

*/
app.listen(PORT, () =>{ console.log(`server running on port localhost:${PORT}/graphql`)})