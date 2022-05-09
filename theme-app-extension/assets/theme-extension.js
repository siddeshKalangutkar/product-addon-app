console.log("Theme app extension js")

// adding products to cart with selected addons
let addon_atc = document.querySelector(".addon-atc")
addon_atc ? addon_atc.addEventListener("click", add_products) : "";
function add_products() {
    let product_id = document.querySelector('input[name=id]').value;  //selected product variant id
    let product_quantity = document.querySelector('input[name=quantity]').value;  //selected quantity
    let addon_checkboxes = document.querySelectorAll('.addon-input:checked');
    let addon_checkboxes_array = [...addon_checkboxes];
    // let addon_ids = addon_checkboxes_array.map(checkbox => checkbox.value);  //selected addons id
    // let unique_key = product_id + "" + addon_ids.join("") //unique key for line item relation
    // let product_data = addon_ids.map(addon_id => { return { id: addon_id, quantity: product_quantity, properties: { u_key: unique_key } } })  //data for cart w/o main product

    let unique_key = product_id;
    let product_data = [];

    let addon_info_array = addon_checkboxes_array.map(checkbox => { return { price: checkbox.getAttribute('data-addon-price'), title: checkbox.getAttribute('data-addon-title') } });  //addon price and title
    console.log('info_array', addon_info_array)
    let product_data_obj = { id: product_id, quantity: product_quantity, properties: { _u_key: unique_key } }
    let addon_total_price = 0;
    let addon_titles = [];
    addon_info_array.forEach(addon_info => {
        product_data_obj.properties[addon_info.title] = addon_info.price
        addon_total_price += parseInt(addon_info.price)
        addon_titles.push(addon_info.title)
    })
    product_data_obj.properties["_addon_price"] = addon_total_price  //addon total price in line-item property
    product_data_obj.properties["_addon_titles"] = addon_titles.toString();  //addon titles in line-item properties
    console.log('single product data', product_data_obj)

    product_data.push(product_data_obj)  //data for cart w/ main product
    let data = { items: product_data }  //data format

    fetch('/cart/add.js', {
        body: JSON.stringify(data),
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'xmlhttprequest'
        },
        method: 'POST'
    }).then((response) => {
        return response.json();
    }).then((json) => {
        //products added successfully
        console.log('products added successfully', json)//TODO
        document.getElementById('product_addon_app').classList.remove("active");
        window.location.href = "/cart";
    }).catch((err) => {
        //error in adding products to cart
        console.error('error in adding products to cart', err)
    });
}

/* close modal */
const modalOverlay = document.querySelector('.addon-modal-overlay');
const closeBtn = document.querySelector('.close-btn');
modalOverlay ? modalOverlay.addEventListener('click', toggleModal) : "";
closeBtn ? closeBtn.addEventListener('click', toggleModal) : "";
function toggleModal() {
   document.querySelector('#product_addon_app').classList.remove("active");
}