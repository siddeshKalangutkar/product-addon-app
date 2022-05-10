import React, { useState, useCallback } from "react";
import { FormLayout, TextField, ChoiceList, Button, Stack, Tag } from "@shopify/polaris";
import { ResourcePicker } from "@shopify/app-bridge-react";

import { AddonList } from "./AddonList";
import { AddonInput } from "./AddonInput";

export function RuleForm() {
    const [value, setValue] = useState('');
    const handleChange = useCallback((newValue) => setValue(newValue), []);

    const [selectedTags, setSelectedTags] = useState([]);
    const removeTag = useCallback(
        (tag) => () => {
            setSelectedTags((previousTags) =>
                previousTags.filter((previousTag) => previousTag !== tag),
            );
        },
        [],
    );

    const [selectProducts, setSelectProducts] = useState([]);
    const removeSelectedProducts = useCallback(
        (tag) => () => {
            setSelectProducts((previousTags) =>
                previousTags.filter((previousTag) => previousTag !== tag),
            );
        },
        [],
    );
    const selectProductsTag = selectProducts.map((option, index) => (
        <Tag key={index} onRemove={removeSelectedProducts(option)}>
            {option}
        </Tag>
    ));

    const [openProductPicker, setOpenProductPicker] = useState(false);
    const handleProductPicker = useCallback((value) => {
        setOpenProductPicker(false)
        console.log("Productpicker", value)
        setSelectProducts(value.selection.map(product => product.title))
    }, []);

    return (
        <FormLayout>
            <FormLayout>
                <TextField label="Rule Title" value={value} onChange={handleChange} />
                <p>Add rule for:</p>
                <Button onClick={setOpenProductPicker} >Select Products</Button>
                <Stack spacing="tight">{selectProductsTag}</Stack>
                <ResourcePicker
                    resourceType="Product"
                    showVariants={true}
                    open={openProductPicker}
                    onSelection={(resources) => handleProductPicker(resources)}
                    onCancel={() => setOpenProductPicker(false)}
                    key="productPicker"
                />
                <AddonInput />
                <AddonList />
            </FormLayout>
        </FormLayout>
    );
}
