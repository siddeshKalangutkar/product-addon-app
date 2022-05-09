import "dotenv/config";

// console.log(process.env.SHOPIFY_API_KEY)

import  { MongoClient, ServerApiVersion } from 'mongodb';


const uri = "mongodb+srv://rootuser:ufgjzHHZtOjm01HE@productaddons.bwxgc.mongodb.net/ProductAddons?retryWrites=true&w=majority";

const client = new MongoClient(uri);
 
    try {
        // Connect to the MongoDB cluster
        await client.connect();
 
        // Make the appropriate DB calls
        await  listDatabases(client);
 
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }