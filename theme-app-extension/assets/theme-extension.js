// adding products to cart with selected addons
let addon_atc = document.querySelector(".addon-atc")
addon_atc ? addon_atc.addEventListener("click", add_products) : "";
function add_products(button, product_input_data = {}) {
    add_spinner(button)
    let product_id = product_input_data.id ? product_input_data.id : document.querySelector('input[name=id]').value;  //selected product variant id
    let product_quantity = product_input_data.quantity ? product_input_data.quantity : document.querySelector('input[name=quantity]').value;  //selected quantity

    let addition_line_properties = product_input_data.properties ? product_input_data.properties : [...document.querySelectorAll("input[type=text][name*='properties'], input[type=hidden][name*='properties'], input[type=number][name*='properties'], input[type=radio][name*='properties']:checked, input[type=checkbox][name*='properties']:checked, select[ name*='properties']")].map(item => { return { [item.getAttribute("name").replace(/properties\[|\]/gi, "")]: item.value } });  //additional properties

    let addon_checkboxes = document.querySelectorAll('.addon-input:checked');
    let addon_checkboxes_array = [...addon_checkboxes];
    let addon_ids = addon_checkboxes_array.map(checkbox => checkbox.value);  //selected addons id
    let key_add = addition_line_properties.length > 0 ? addition_line_properties.map(property => Object.values(property)[0]).join("") : "";
    let unique_key = product_id + "" + addon_ids.join("") + key_add;  //unique key for line item relation
    let product_data = addon_ids.map(addon_id => { return { id: addon_id, quantity: product_quantity, properties: { _u_key: unique_key } } })  //data for cart w/o main product

    // let unique_key = product_id;
    // let product_data = [];

    let addon_info_array = addon_checkboxes_array.map(checkbox => { return { price: checkbox.getAttribute('data-addon-price'), title: checkbox.getAttribute('data-addon-title') } });  //addon price and title
    let product_data_obj = { id: product_id, quantity: product_quantity, properties: { _u_key: unique_key } }
    let addon_total_price = 0;
    let addon_titles = [];
    addon_info_array.reverse().forEach(addon_info => {
        product_data_obj.properties[addon_info.title] = window.pdtAddOnCurrency + " " + addon_info.price
        addon_total_price += parseInt(addon_info.price)
        addon_titles.push(addon_info.title)
    })
    product_data_obj.properties["_addon_price"] = addon_total_price  //addon total price in line-item property
    product_data_obj.properties["_addon_titles"] = addon_titles.toString();  //addon titles in line-item properties

    //additional properties
    addition_line_properties.length > 0 ? addition_line_properties.forEach(property => product_data_obj.properties[Object.keys(property)[0]] = Object.values(property)[0]) : "";

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
        if (json.status) {
            console.log("Cart error", json)
            document.querySelector('.cart-error').innerHTML = json.description;
        }
        else {
            document.getElementById('product_addon_app').classList.remove("active");
            window.location.href = "/cart";
        }
    }).catch((err) => {
        //error in adding products to cart
        console.error('error in adding products to cart', err)
    }).finally(() => remove_spinner(button));
}

/* close modal */
const modalOverlay = document.querySelector('.addon-modal-overlay');
const closeBtn = document.querySelector('.close-btn');
modalOverlay ? modalOverlay.addEventListener('click', toggleModal) : "";
closeBtn ? closeBtn.addEventListener('click', toggleModal) : "";
function toggleModal() {
    document.querySelector('#product_addon_app').classList.remove("active");
}

// Ajax popup
async function render_popup(product_id, button, variant_details = {}) {
    add_spinner(button)
    let html_section = "<div class='addon-scroller'>";
    let x = window.pdtJSON[product_id]
    for (let key in x) {
        let arr = x[key].split("|")
        html_section += `
        <div class="addon-rule-container">
        <p class="addon-rule-title">${key}</p>
        `
        if (arr[0].includes('collection')) {
            let collection_handle = arr[1].replace(/\[|\]|\;/gi, "")
            let addon_products_response = await fetch(`/collections/${collection_handle.trim()}/products.json`)
            let { products } = await addon_products_response.json()
            for (const product of products) {
                html_section += format_html(product)
            }
        }
        else {
            let product_handle_string = arr[1].replace(/\[|\]/gi, "")
            let product_handles = product_handle_string.split(";")
            for (const handle of product_handles) {
                let addon_response = await fetch(`/products/${handle.trim()}.js`)
                let product = await addon_response.json()
                html_section += format_product_html(product)
            }
        }
        html_section += `</div>`
    }
    html_section += `
    </div>
    <span class="cart-error"></span>
    <button class="addon-atc">Add To Cart</button>
    `
    document.querySelector('.addon-modal-body').innerHTML = html_section;
    document.querySelector(".addon-atc").addEventListener("click", function () {
        variant_details && Object.keys(variant_details).length < 0 ?
            add_products(document.querySelector(".addon-atc"))
        :
            add_products(document.querySelector(".addon-atc"), variant_details)
    , false })
    document.getElementById('product_addon_app').classList.add("active")
    remove_spinner(button)
}

function format_html(product) {
    let data_format = `
    <span class="addon-rule-item">
        <span class="addon-info">
            ${product.images.length > 0 && product.images[0].src ? '<img class="featured-img" src ="' + product.images[0].src + '" height="50px" width="50px" >' : ''}
            <span class="addon-text-info">
                <span class="name">${product.title}</span>
                <span class="description">${product.body_html}</span>
            </span>
        </span>
        <span class="price">
            (+${window.pdtAddOnCurrency + "" + parseFloat(product.variants[0].price)})
            <div class="addon-checkbox">
                <input type="checkbox" class="addon-input" value="${product.variants[0].id}" data-addon-title="${product.title}" data-addon-price="${parseFloat(product.variants[0].price)}" ${!product.variants[0].available ? "disabled" : ""}>
                <span class="addon-ctm-checkbox"></span>
            </div>
            ${!product.variants[0].available ? '<span class="addon-ofs">Out of stock</span>' : ''}
        </span>
    </span>`
    return data_format;
}

function format_product_html(product) {
    let data_format = `
    <span class="addon-rule-item">
        <span class="addon-info">
            ${product.images.length > 0 && product.media[0].src ? '<img class="featured-img" src ="' + product.media[0].src + '" height="50px" width="50px" >' : ''}
            <span class="addon-text-info">
                <span class="name">${product.title}</span>
                <span class="description">${product.description}</span>
            </span>
        </span>
        <span class="price">
            (+${window.pdtAddOnCurrency + "" + (product.variants[0].price / 100)})
            <div class="addon-checkbox">
                <input type="checkbox" class="addon-input" value="${product.variants[0].id}" data-addon-title="${product.title}" data-addon-price="${product.variants[0].price / 100}" ${!product.variants[0].available ? "disabled" : ""}>
                <span class="addon-ctm-checkbox"></span>
            </div>
            ${!product.variants[0].available ? '<span class="addon-ofs">Out of stock</span>' : ''}
        </span>
    </span>`
    return data_format;
}

function add_spinner(button) {
    const spinner_code_block = `<div class="loading-overlay"><div class="loading-overlay__spinner"><svg height="20" width="20" aria-hidden="true" focusable="false" role="presentation" class="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg"><circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle></svg></div></div>`
    button.classList.add("loading-spinner");
    button.innerHTML += spinner_code_block;
}

function remove_spinner(button) {
    button.querySelector('.loading-overlay').remove();
    button.classList.remove('loading-spinner')
}

//collection function
function show_addons(event, button, product_id, variant_details){
	event.preventDefault();
  	render_popup(product_id ,button, variant_details)  	
}