import React, { useState, useCallback } from "react";
import { FormLayout, TextField, ChoiceList, Button, Stack, Tag } from "@shopify/polaris";
import { ResourcePicker } from "@shopify/app-bridge-react";

// import { AddonList } from "./AddonList";
// import { AddonInput } from "./AddonInput";

export function RuleForm({formData, updateFormData}) {
    const [value, setValue] = useState(formData.name?formData.name:"");
    const handleChange = useCallback((newValue) => {
        setValue(newValue), []
        updateFormData({name: "name", value: newValue})
    });

    const [selectedChoice, setSelectedChoice] = useState(formData.addon_type?[formData.addon_type]:['none']);
    const handleChoiceListChange = useCallback((value) => {
        console.log("value chocice change", value)
        setSelectedChoice(value)
        updateFormData({name: "addon_type", value: value})
        setSelectedTags([])
    }, []);
    const renderChildren = useCallback((isSelected) =>
        isSelected && (
            <Button onClick={setOpenResourcepicker} >Add {selectedChoice}</Button>
        ), [selectedChoice]
    );

    const [openResourcepicker, setOpenResourcepicker] = useState(false);
    const [resourcepickerValue, setResourcepickerValue] = useState(formData.addons?formData.addons:[]);
    const handleResourcePickerSelection = useCallback((value) => {
        setOpenResourcepicker(false)
        setResourcepickerValue(value)
        setSelectedTags(value.selection.map(product => product.title))
        updateFormData({name: "addons", value: value})
    }, [resourcepickerValue]);

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
    const [productpickerValue, setproductpickerValue] = useState(formData.products?formData.products:[]);
    const handleProductPicker = useCallback((value) => {
        setOpenProductPicker(false)
        setproductpickerValue(value)
        console.log("Productpicker", value)
        setSelectProducts(value.selection.map(product => product.title))
        updateFormData({name: "products", value: value})
    }, [productpickerValue]);

    return (
        <FormLayout>
            <FormLayout>
                <TextField label="Rule Title" value={value} onChange={handleChange} />
                <p>Add rule for:</p>
                <Button onClick={setOpenProductPicker} >Select Products</Button>
                <Stack spacing="tight">{selectProductsTag}</Stack>
                {/* <ResourcePicker
                    resourceType="Product"
                    showVariants={true}
                    open={openProductPicker}
                    onSelection={(resources) => handleProductPicker(resources)}
                    onCancel={() => setOpenProductPicker(false)}
                    key="productPicker"
                /> */}

                {/* <AddonInput/>
                <AddonList/> */}

                {/* {selectProducts.length > 0 ? (<Stack spacing="tight">{selectProductsTag}</Stack>) : (<Button onClick={setOpenProductPicker} >Select Products</Button>)} */}

                <ChoiceList
                    title="Select Addons for the rule:"
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
                        selectedChoice == "collection" ?
                        (<ResourcePicker
                            resourceType="Collection"
                            selectMultiple={false}
                            open={openResourcepicker}
                            onSelection={(resources) => handleResourcePickerSelection(resources)}
                            onCancel={() => setOpenResourcepicker(false)}
                            key="addonCollectionPicker"
                        />
                        ) :
                        (<ResourcePicker
                            resourceType="Product"
                            showVariants={false}
                            open={openResourcepicker}
                            onSelection={(resources) => handleResourcePickerSelection(resources)}
                            onCancel={() => setOpenResourcepicker(false)}
                            key="addonProductPicker"
                        />
                        ) :
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
