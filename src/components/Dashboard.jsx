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
import { RuleList } from "./RuleList";

const img = 'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg';


export function Dashboard() {
    const [active, setActive] = useState(false);
    const toggleActive = useCallback(() => setActive((active) => !active), []);

    const rule_data = [
        {
            name: "Rule Name",
            products: ["989898", "787989"],
            addon_type: "product",
            addons: ["09390", "22334"]
        }
    ]
    const saveData = () => {
        toggleActive()
        console.log('save data called', rule_data)
    }

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
                        {
                            rule_data.length > 0 ?
                                (<RuleList data={rule_data} />)
                                :
                                (
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
                                )
                        }
                    </Card>


                    <Modal
                        large
                        open={active}
                        onClose={toggleActive}
                        title="Rule"
                        primaryAction={{
                            content: 'Save',
                            onAction: saveData,
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
