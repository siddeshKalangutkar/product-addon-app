import "dotenv/config";
import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.DB_URI;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function searchDbFunction() {
    try {
        await client.connect()
        const db = client.db('ProductAddons')
        const col = db.collection('Accounts')
        const myDoc = await col.findOne({ "shop": "newShow.com" });
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
            "shop": "newShow.com",
            "accessToken": "xy1234d"
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
            "shop": shop_name,
            "accessToken": token_data
        }
        const result = await col.updateOne({ shop: shop_name }, { $set: data }, { upsert: true });
        console.log("Updated Access Token Successfully ", result)
        return { success: true }
    }
    catch (err) {
        console.log(err)
        return { success: false, error: err }
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
        const result = await col.findOne({ "shop": shop_name });
        console.log({ result })
        return { success: true, accessToken: result.accessToken }
    }
    catch (err) {
        console.log(err)
        return { success: false, error: err }
    }
    finally {
        await client.close()
    }
}

export async function update_rule(data) {
    try {
        await client.connect()
        const db = client.db('ProductAddons')
        const col = db.collection('Rules')
        const result = await col.updateOne({ shop: data.shop, name: data.name }, { $set: data }, { upsert: true });
        console.log("Updated Rules Successfully ", result)
        return { success: true }
    }
    catch (err) {
        console.log(err)
        return { success: false, error: err }
    }
    finally {
        await client.close()
    }
}

export async function get_rules(data) {
    try {
        await client.connect()
        const db = client.db('ProductAddons')
        const col = db.collection('Rules')
        console.log("shop", data)
        const result = col.find({ shop: data });
        const rules = await result.toArray();
        console.log("Fetched Rules Successfully ", rules)
        return { success: true, data: rules }
    }
    catch (err) {
        console.log(err)
        return { success: false, error: err }
    }
    finally {
        await client.close()
    }
}

export async function delete_rule(data){
    try {
        await client.connect()
        const db = client.db('ProductAddons')
        const col = db.collection('Rules')
        const result = await col.deleteOne(data);
        console.log("Deleted Rule Successfully ", result)
        return { success: true, data: result }
    }
    catch (err) {
        console.log(err)
        return { success: false, error: err }
    }
    finally {
        await client.close()
    }
}

export async function delete_account(data){
    try {
        await client.connect()
        const db = client.db('ProductAddons')
        const col = db.collection('Accounts')
        const result = await col.deleteOne(data);
        console.log("Deleted Account Successfully ", result)
        return { success: true, data: result }
    }
    catch (err) {
        console.log(err)
        return { success: false, error: err }
    }
    finally {
        await client.close()
    }
}

export async function delete_all_rules(data){
    try {
        await client.connect()
        const db = client.db('ProductAddons')
        const col = db.collection('Rules')
        const result = await col.deleteMany(data);
        console.log("Deleted All Rules Successfully ", result)
        return { success: true, data: result }
    }
    catch (err) {
        console.log(err)
        return { success: false, error: err }
    }
    finally {
        await client.close()
    }
}

export async function update_subscription_plan(shop_name, subscription_plan, subscription_plan_id) {
    try {
        await client.connect()
        const db = client.db('ProductAddons')
        const col = db.collection('Accounts')
        let data = {
            "subscriptionPlan": subscription_plan,
            "subscriptionPlanId": subscription_plan_id
        }
        const result = await col.updateOne({ shop: shop_name }, { $set: data }, { upsert: true });
        console.log("Updated Subscription Plan Successfully ", result)
        return { success: true }
    }
    catch (err) {
        console.log(err)
        return { success: false, error: err }
    }
    finally {
        await client.close()
    }
}