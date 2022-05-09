import "dotenv/config";
import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.DB_URI;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function searchDbFunction() {
    try {
        await client.connect()
        const db = client.db('ProductAddons')
        const col = db.collection('Accounts')
        const myDoc = await col.findOne({"shop":"newShow.com"});
        console.log(myDoc)
    }
    catch (err) {
        console.log(err)
    }
    finally {
        await client.close()
    }
}

async function addDbFunction() {
    try {
        await client.connect()
        const db = client.db('ProductAddons')
        const col = db.collection('Accounts')
        let data = {
            "shop" : "newShow.com",
            "accessToken" : "xy1234d"
        }
        const added = await col.insertOne(data);
        console.log("Added successfully ", added)
    }
    catch (err) {
        console.log(err)
    }
    finally {
        await client.close()
    }
}

export async function update_access_token(shop_name, token_data) {
    try {
        await client.connect()
        const db = client.db('ProductAddons')
        const col = db.collection('Accounts')
        let data = {
            "shop" : shop_name,
            "accessToken" : token_data
        }
        const result = await col.updateOne({shop: shop_name}, { $set: data}, {upsert: true});
        console.log("Updated Access Token Successfully ", result)
        return {success: true}
    }
    catch (err) {
        console.log(err)
        return {success: false, error: err}
    }
    finally {
        await client.close()
    }
}

export async function find_access_token(shop_name) {
    try {
        await client.connect()
        const db = client.db('ProductAddons')
        const col = db.collection('Accounts')
        const result = await col.findOne({"shop":shop_name});
        console.log({result})
        return {success: true, accessToken: result.accessToken}
    }
    catch (err) {
        console.log(err)
        return {success: false, error: err}
    }
    finally {
        await client.close()
    }
}