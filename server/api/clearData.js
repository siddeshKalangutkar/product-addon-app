import fetch from "node-fetch";
import {find_access_token,  get_rules, delete_all_rules, delete_account} from "../db-fucntion.js"

const METAFIELD_ID = `
  query ProductMetafield($namespace: String!, $ownerId: ID!, $key: String!) {
    product(id: $ownerId) {
      metafield(key: $key namespace: $namespace) {
            id
            key
            value
      }
    }
  }
`;

export async function clear_data(shop_domain) {
    let deleted_rules = await delete_all_rules({shop: shop_domain})
    let deleted_account = await delete_account({shop: shop_domain})
}
export async function clear_rules(shop_domain){
    let {accessToken} = await find_access_token(shop_domain)
    let url = `https://${shop_domain}/admin/api/2022-04/graphql.json`;
    let param = {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': accessToken
        }
    }
    let {data} = await get_rules(shop_domain)
    let metafield_ids = []
    let delete_query =`mutation {`;
    let index = 0

    for( const rule of data) {
        let products = rule.products.selection
        for (const product of products) {
            let body_data = {
                "namespace": "app_meta",
                "ownerId": product.id,
                "key": rule.name
            }
            param.body = JSON.stringify({ query: METAFIELD_ID, variables: body_data})
            let metafield_response = await fetch(url,param)
            let metafield_id = await metafield_response.json()
            console.log("metafield_response full", metafield_id)
            console.log('metafield_response', metafield_id.data.product.metafield.id)
            metafield_ids.push(metafield_id.data.product.metafield.id)
            delete_query += `
            index${index++}: metafieldDelete(input: {
                id: "${metafield_id.data.product.metafield.id}"
            }) {
                userErrors { field message } deletedId 
            }
            `
        }
    };
    console.log("final metafoeld array is ", metafield_ids)
    delete_query += '}';
    console.log("final delete query", delete_query)
    param.body = JSON.stringify({ query: delete_query })
    console.log("quey", param)
    let deleted_response = await fetch(url,param)
    let deleted_id = await deleted_response.json()
    let deleted_rules = await delete_all_rules({shop: shop_domain})
}