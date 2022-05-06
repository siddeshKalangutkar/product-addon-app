import { ResourceList, TextStyle, Stack, Thumbnail } from "@shopify/polaris";

export function ProductsList({ data }) {
  return (
    <ResourceList // Defines your resource list component
      showHeader
      resourceName={{ singular: "Product", plural: "Products" }}
      items={data.nodes}
      renderItem={(item) => {
        const media = (
          <Thumbnail
            source={
              item.images.edges[0] ? item.images.edges[0].node.originalSrc : ""
            }
            alt={item.images.edges[0] ? item.images.edges[0].node.altText : ""}
          />
        );
        const price = item.variants.edges[0].node.price;
        const metafields = item.metafields.edges
        return (
          <ResourceList.Item
            id={item.id}
            media={media}
            accessibilityLabel={`View details for ${item.title}`}
            // onClick={() => {
            //   store.set("item", item);
            // }}
          >
            <Stack>
              <Stack.Item fill>
                <h3>
                  <TextStyle variation="strong">{item.title}</TextStyle>
                </h3>
              </Stack.Item>
              <Stack.Item>
                {metafields.map((metaItem,index) => (<p key={index}>{metaItem.node.key} : {metaItem.node.value}</p>))}
              </Stack.Item>
              <Stack.Item>
                <p>Rs. {price}</p>
              </Stack.Item>
            </Stack>
          </ResourceList.Item>
        );
      }}
    />
  );
}