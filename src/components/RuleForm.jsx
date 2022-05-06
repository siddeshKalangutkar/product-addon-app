import React, { useState, useCallback } from "react";
import { FormLayout, TextField, ChoiceList, Button, Stack, Tag } from "@shopify/polaris";
import { ResourcePicker } from "@shopify/app-bridge-react";

export function RuleForm() {
    const [value, setValue] = useState('');
    const handleChange = useCallback((newValue) => setValue(newValue), []);

    const [value2, setValue2] = useState('');
    const handleChange2 = useCallback((newValue) => setValue2(newValue), []);

    const [selectedChoice, setSelectedChoice] = useState(['none']);
    const handleChoiceListChange = useCallback((value) => setSelectedChoice(value), []);

    const [openResourcepicker, setOpenResourcepicker] = useState(false);
    const handleResourcePickerSelection = useCallback((value) => {
        setOpenResourcepicker(false)
        setSelectedTags(value.selection.map(product => product.title))
    }, []);

    const renderChildren = useCallback((isSelected) =>
        isSelected && (
            <Button onClick={setOpenResourcepicker} >Select {selectedChoice}</Button>
        ), [selectedChoice]
    );

    const [selectedTags, setSelectedTags] = useState([]);

    const removeTag = useCallback(
        (tag) => () => {
            setSelectedTags((previousTags) =>
                previousTags.filter((previousTag) => previousTag !== tag),
            );
        },
        [],
    );

    const tagMarkup = selectedTags.map((option) => (
        <Tag key={option} onRemove={removeTag(option)}>
            {option}
        </Tag>
    ));

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
        console.log("Productpicker",value)
        setSelectProducts(value.selection.map(product => product.title))
    }, []);

    return (
        <FormLayout>
            <FormLayout>
                <TextField label="Rule Title" value={value} onChange={handleChange} />
                {selectProducts.length > 0 ? (<Stack spacing="tight">{selectProductsTag}</Stack>) : (<Button onClick={setOpenProductPicker} >Select Products</Button>)}

                <ChoiceList
                    title="Add rule for:"
                    choices={[
                        { label: 'product', value: 'product', renderChildren },
                        { label: 'collection', value: 'collection', renderChildren },
                    ]}
                    selected={selectedChoice}
                    onChange={handleChoiceListChange}
                />
                <Stack spacing="tight">{tagMarkup}</Stack>
                {
                    selectProducts.length > 0 ?
                        (<ResourcePicker
                            resourceType="Product"
                            showVariants={false}
                            open={openResourcepicker}
                            onSelection={(resources) => handleResourcePickerSelection(resources)}
                            onCancel={() => setOpenResourcepicker(false)}
                            key="addonProductPicker"
                        />) :
                        (<ResourcePicker
                            resourceType="Product"
                            showVariants={true}
                            open={openProductPicker}
                            onSelection={(resources) => handleProductPicker(resources)}
                            onCancel={() => setOpenProductPicker(false)}
                            key="productPicker"
                        />)
                }
            </FormLayout>
        </FormLayout>
    );
}
