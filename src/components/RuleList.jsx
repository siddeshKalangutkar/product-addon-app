import React from 'react';
import { Card, Button, Modal, EmptyState, ButtonGroup, Stack, ResourceItem, ResourceList, TextStyle } from '@shopify/polaris';

const img = 'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg';

export function RuleList({ data, openModal, openDeleteModal, setLoader, loader }) {
    const emptyStateMarkup = !data.length > 0 ?(
        <EmptyState
            heading="No rules created yet"
            action={{
                content: "Add Rule",
                onAction: () => { openModal({}, false) },
            }}
            image={img}
            imageContained
        >
        </EmptyState>
    ) : undefined;

    return (
        <Card>
            <ResourceList
                resourceName={{ singular: 'Rule', plural: 'Rules' }}
                items={data}
                loading = {loader}
                emptyState = {emptyStateMarkup}
                renderItem={(item) => {
                    const { name } = item;

                    return (
                        <ResourceItem
                            id={name}
                        >
                            <Stack>
                                <Stack.Item fill>
                                    <h3>
                                        <TextStyle variation="strong">{name}</TextStyle>
                                    </h3>
                                </Stack.Item>
                                <Stack.Item>
                                    <ButtonGroup spacing="loose">
                                        <Button plain onClick={() => { openModal(item, true) }}>Edit</Button>
                                        <Button plain destructive onClick={() => { openDeleteModal(item) }}>Delete</Button>
                                    </ButtonGroup>
                                </Stack.Item>
                            </Stack>
                        </ResourceItem>
                    );
                }}
            />
        </Card>
    )
}
