import React, { useCallback, useState } from 'react';
import {
    Card,
    Page,
    Layout,
    TextContainer,
    Image,
    Stack,
    Link,
    Heading,
    Modal,
    Button,
    EmptyState
} from "@shopify/polaris";
import { RuleForm } from './RuleForm';

const img = 'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg';


export function Dashboard() {
    const [active, setActive] = useState(false);
    const toggleActive = useCallback(() => setActive((active) => !active), []);

    return (
        <Page fullWidth>
            <Layout>
                <Layout.Section>
                    <Card sectioned>
                        <Stack
                            wrap={false}
                            spacing="extraTight"
                            distribution="trailing"
                            alignment="right"
                        >
                            <Stack.Item fill>
                                <Button onClick={toggleActive}>Add Rule</Button>
                            </Stack.Item>
                        </Stack>
                    </Card>
                    <Card sectioned>
                        <EmptyState
                            heading="No rules created yet"
                            action={{
                                content: "Add Rule",
                                onAction: toggleActive,
                            }}
                            image={img}
                            imageContained
                        >
                        </EmptyState>
                    </Card>


                    <Modal
                        large
                        open={active}
                        onClose={toggleActive}
                        title="Rule"
                        primaryAction={{
                            content: 'Add',
                            onAction: toggleActive,
                        }}
                        secondaryActions={[
                            {
                                content: 'Cancel',
                                onAction: toggleActive,
                            },
                        ]}
                    >
                        <Modal.Section>
                            <Stack vertical>
                                <RuleForm />
                            </Stack>
                        </Modal.Section>
                    </Modal>


                </Layout.Section>
            </Layout>
        </Page>
    );
}
