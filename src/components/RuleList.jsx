import React from 'react';
import { Card, Button, Stack, ResourceItem, ResourceList, TextStyle } from '@shopify/polaris';

export function RuleList({ data }) {
    return (
        <Card>
            <ResourceList
                resourceName={{ singular: 'Rule', plural: 'Rules' }}
                items={data}
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
                                    <Button plain destructive>Delete</Button>
                                </Stack.Item>
                            </Stack>
                        </ResourceItem>
                    );
                }}
            />
        </Card>
    )
}
