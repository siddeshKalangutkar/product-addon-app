import { Card, Page, Layout, TextContainer, List, Image, Stack, Link, Banner, Heading, Modal, Button, EmptyState, Spinner } from "@shopify/polaris";
import guideImgUrl from "../assets/instructions.png";

export function Guide() {

    return (
        <Page fullWidth>
            <Layout>
                <Layout.Section>
                    <Card title="Installation process" sectioned>
                        <Stack wrap={true}>
                            <Stack.Item>
                                <TextContainer>
                                    <Heading>Step 1</Heading>
                                    <List >
                                        <List.Item>
                                            Open <b>Theme Customize</b>.
                                        </List.Item>
                                        <List.Item>
                                            Under <b>Theme Settings</b> click on <b>App embeds</b>.
                                        </List.Item>
                                        <List.Item>
                                            Enable the <b>Product Addons Block</b>.
                                        </List.Item>
                                    </List>
                                </TextContainer>
                                <br />
                                <TextContainer>
                                    <Heading>Step 2</Heading>
                                    <List >
                                        <List.Item>
                                            Click the block tab to open settings.
                                        </List.Item>
                                        <List.Item>
                                            Update the value for all the sectors as per your theme.
                                        </List.Item>
                                    </List>
                                </TextContainer>
                            </Stack.Item>
                                <img
                                    width="100%"
                                    style = {{objectFit: 'contain', width: 'calc(100% - 1rem)', objectPosition: '0 -1px', border: '1px solid rgba(109, 109, 81, 0.5)', padding: '0.5rem', borderRadius: '0.5rem'}}
                                    src = {guideImgUrl}
                                />
                        </Stack>
                    </Card>

                    <Card title="Creating Rules" sectioned>
                        <TextContainer>
                            <List >
                                <List.Item>
                                    Click on <b>Add Rule</b> button.
                                </List.Item>
                                <List.Item>
                                    In <b>Rule Title</b> enter the Title that you want to display on the store. Each rule must have a unique rule title.
                                </List.Item>
                                <List.Item>
                                    Under <b>Add rule for</b> select the products for which the addons should be displayed.
                                </List.Item>
                                <List.Item>
                                    Select the addons type as a product to display specific products as addons or select collection to display the all the product in the collection as addons.
                                </List.Item>
                            </List>
                        </TextContainer>
                    </Card>

                    <Card title="Uninstallation process" sectioned>
                        <TextContainer>
                            <List >
                                <List.Item>
                                    Delete all the created rules before uninstalling the app.
                                </List.Item>
                                <List.Item>
                                    Under <b>Apps</b> click delete button in the respective row.
                                </List.Item>
                            </List>
                        </TextContainer>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    )
}