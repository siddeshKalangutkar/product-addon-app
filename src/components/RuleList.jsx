import React from 'react';
import { Card, Button, ButtonGroup, Stack, ResourceItem, ResourceList, TextStyle } from '@shopify/polaris';

export function RuleList({ data, openModal }) {
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
                                    <ButtonGroup spacing="loose">
                                        <Button plain onClick={() => { openModal(item,true)}}>Edit</Button>
                                        <Button plain destructive onClick={()=>{ console.log("Delete cliked")}}>Delete</Button>
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
