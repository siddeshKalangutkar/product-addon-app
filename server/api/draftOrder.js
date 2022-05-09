import fetch from "node-fetch";

//checkout function
export default async function draft_checkout( query_variable, access_token) {
    const query = `
        mutation draftOrderCreate($input: DraftOrderInput!) {
        draftOrderCreate(input: $input) {
          draftOrder {
            id
            invoiceUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `
    // const variables = {"input": {"lineItems":[{"variantId":"gid://shopify/ProductVariant/42727560249603","quantity":2,"customAttributes":[{"key":"u_key","value":"42727560249603"},{"key":"ice cream","value":"20.00"},{"key":"panner","value":"20.00"},{"key":"_addon_price","value":"40"},{"key":"_addon_titles","value":"ice cream,panner"}]},{"title":"ice cream","quantity":2,"originalUnitPrice":"20.00"},{"title":"panner","quantity":2,"originalUnitPrice":"20.00"}]}}
    const variables = { input: JSON.parse(query_variable) }
    console.log("variables", variables)


    let checkout_response = await fetch('https://simplecheckoutstore.myshopify.com/admin/api/2022-04/graphql.json', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': access_token
        },
        body: JSON.stringify({ query: query, variables: variables})
    })

    let checkout_result = await checkout_response.json()
    let {invoiceUrl} = checkout_result.data.draftOrderCreate.draftOrder
    console.log("draft response", invoiceUrl)

    return invoiceUrl;
}