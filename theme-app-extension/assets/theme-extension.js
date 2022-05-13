console.log("Theme app extension js")//TODO

// adding products to cart with selected addons
let addon_atc = document.querySelector(".addon-atc")
addon_atc ? addon_atc.addEventListener("click", add_products) : "";
function add_products(button) {
    add_spinner(button)
    let product_id = document.querySelector('input[name=id]').value;  //selected product variant id
    let product_quantity = document.querySelector('input[name=quantity]').value;  //selected quantity
    let addon_checkboxes = document.querySelectorAll('.addon-input:checked');
    let addon_checkboxes_array = [...addon_checkboxes];
    let addon_ids = addon_checkboxes_array.map(checkbox => checkbox.value);  //selected addons id
    let unique_key = product_id + "" + addon_ids.join("") //unique key for line item relation
    let product_data = addon_ids.map(addon_id => { return { id: addon_id, quantity: product_quantity, properties: { _u_key: unique_key } } })  //data for cart w/o main product

    // let unique_key = product_id;
    // let product_data = [];

    let addon_info_array = addon_checkboxes_array.map(checkbox => { return { price: checkbox.getAttribute('data-addon-price'), title: checkbox.getAttribute('data-addon-title') } });  //addon price and title
    console.log('info_array', addon_info_array)//TODO
    let product_data_obj = { id: product_id, quantity: product_quantity, properties: { _u_key: unique_key } }
    let addon_total_price = 0;
    let addon_titles = [];
    addon_info_array.reverse().forEach(addon_info => {
        product_data_obj.properties[addon_info.title] = addon_info.price
        addon_total_price += parseInt(addon_info.price)
        addon_titles.push(addon_info.title)
    })
    product_data_obj.properties["_addon_price"] = addon_total_price  //addon total price in line-item property
    product_data_obj.properties["_addon_titles"] = addon_titles.toString();  //addon titles in line-item properties
    console.log('single product data', product_data_obj)//TODO

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
async function render_popup(product_id, button) {
    add_spinner(button)
    let html_section = "";
    let x = window.pdtJSON[product_id]
    for (let key in x) {
        let arr = x[key].split("|")
        console.log(arr)//TODO
        html_section += `
        <div class="addon-rule-container">
        <p class="addon-rule-title">${key}</p>
        `
        if (arr[0].includes('collections')) {
            let collection_handle = arr[1].replace(/\[|\]|\;/gi, "")
            let addon_products_response = await fetch(`/collections/${collection_handle.trim()}/products.json`)
            let { products } = await addon_products_response.json()
            for (const product of products) {
                console.log("collections", product)
                html_section += format_html(product)
            }
        }
        else {
            console.log("products")//TODO
            let product_handle_string = arr[1].replace(/\[|\]/gi, "")
            let product_handles = product_handle_string.split(";")
            for (const handle of product_handles) {
                let addon_response = await fetch(`/products/${handle.trim()}.js`)
                let product = await addon_response.json()
                console.log("products", product)
                html_section += format_product_html(product)
            }
        }
        html_section += `</div>`
    }
    html_section += `
    <button class="addon-atc">Add To Cart</button>
    `
    document.querySelector('.addon-modal-body').innerHTML = html_section;
    document.querySelector(".addon-atc").addEventListener("click", add_products(this))
    console.log(html_section)//TODO
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
            (+${window.pdtAddOnCurrency + "" + product.variants[0].price})
            <div class="addon-checkbox">
                <input type="checkbox" class="addon-input" value="${product.variants[0].id}" data-addon-title="${product.title}" data-addon-price="${product.variants[0].price}" ${!product.variants[0].available ? "disabled" : ""}>
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
    console.log("passed button", button)
    const spinner_code_block = `<div class="loading-overlay"><div class="loading-overlay__spinner"><svg height="20" width="20" aria-hidden="true" focusable="false" role="presentation" class="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg"><circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle></svg></div></div>`
    button.classList.add("loading-spinner");
    button.innerHTML += spinner_code_block;
}

function remove_spinner(button){
    button.querySelector('.loading-overlay').remove();
    button.classList.remove('loading-spinner')
}