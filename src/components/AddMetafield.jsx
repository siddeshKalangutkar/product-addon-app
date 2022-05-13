import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { Layout, Button, Banner, Toast, Stack, Frame } from "@shopify/polaris";
import { Loading } from "@shopify/app-bridge-react";
// GraphQL mutation that updates the prices of products
const ADD_METAFIELD = gql`
  mutation addProductMetafields($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        metafields(first: 5) {
          edges {
            node {
              id
              namespace
              key
              value
            }
          }
        }
      }
    }
  }
`;

export function AddMetafield({ selectedItems, onUpdate }) {
    const [hasResults, setHasResults] = useState(false);
  
    const toast = hasResults && (
      <Toast
        content="Successfully updated"
        onDismiss={() => setHasResults(false)}
      />
    );
    const [mutateMetafield, { data, loading, error }] = useMutation(ADD_METAFIELD);
    if (loading) return <Loading />;
  
    if (error) {
      console.warn(error);
      return <Banner status="critical">{error.message}</Banner>;
    }
  
    return (
      <Frame>
        {toast}
  
        <Layout.Section>
          <Stack distribution={"center"}>
            <Button
              primary
              textAlign={"center"}
              onClick={() => {
                let promise = new Promise((resolve) => resolve());
                for (const variantId in selectedItems) {
                  const productVariableInput = {
                    id: selectedItems[variantId].id,
                    metafields: [
                      {
                        namespace : "app_meta",
                        key: "Addon",
                        type: "single_line_text_field",
                        value: "products | [coke]"
                      }
                    ]
                  };
  
                  promise = promise.then(() =>
                  mutateMetafield({
                      variables: { input: productVariableInput },
                    })
                  );
                }
  
                if (promise) {
                  promise.then(() => onUpdate().then(setHasResults(true)));
                }
              }}
            >
              Add Metafields
            </Button>
          </Stack>
        </Layout.Section>
      </Frame>
    );
  }