
function search() {
    // Get the search term from the search field
    var searchTerm = document.getElementById("search-field").value;
    var startDate = document.getElementById("start-date").value;
    var endDate = document.getElementById("end-date").value;
    // Send the search term to the Python function using an AJAX request
    var xhr = new XMLHttpRequest();
    //http://192.168.9.185:5000/search
    xhr.open("POST", "/search", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function () {
      // Process the response from the Python function
      if (this.status == 200) {
        // Clear the results container
        document.getElementById("results-container").innerHTML = "";
        // Loop through the results and add them to the results container
        var results = JSON.parse(this.responseText);
        for (var i = 0; i < results.length; i++) {
          var result = results[i];
          if (searchTerm == ""){
            var button = document.createElement("button");
            button.innerHTML = result;
            button.classList.add("results-button");
            button.addEventListener("click", function () {
              // Run a function when the button is clicked

              clickResult(this.innerHTML);
            });
            document.getElementById("results-container").appendChild(button);
            }
          else{
            var div = document.createElement("div");
            div.innerHTML = result;
            div.classList.add("results-item");
            document.getElementById("results-container").appendChild(div);
          }
        }
      }
    };
    xhr.send("searchTerm=" + searchTerm + "&startDate=" + startDate + "&endDate=" + endDate);
    }
function clickResult(searchTerm){
    console.log(searchTerm);
    var startDate = document.getElementById("start-date").value;
    var endDate = document.getElementById("end-date").value;
    var xhr = new XMLHttpRequest();
    //http://192.168.9.185:5000/search
    xhr.open("POST", "/search", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function () {
      if (this.status == 200) {
        // Clear the results container
        document.getElementById("results-container").innerHTML = "";
        // Loop through the results and add them to the results container
        var results = JSON.parse(this.responseText);
        for (var i = 0; i < results.length; i++) {
          var result = results[i];
          var div = document.createElement("div");
          div.innerHTML = result;
          div.classList.add("results-item");
          document.getElementById("results-container").appendChild(div);
        }
      }
    };
    xhr.send("searchTerm=" + searchTerm + "&startDate=" + startDate + "&endDate=" + endDate);
    }

function increaseQuantity(id) {
    var quantity = document.getElementById(id);
    quantity.innerHTML = parseInt(quantity.innerHTML) + 1;
    const sbid = id.substring(id.indexOf("-") + 1);
    showSaveButton(sbid);
}
function decreaseQuantity(id) {
    var quantity = document.getElementById(id);
    quantity.innerHTML = parseInt(quantity.innerHTML) - 1;
    const sbid = id.substring(id.indexOf("-") + 1);
    showSaveButton(sbid);
}

function showSaveButton(id) {
    document.querySelectorAll('.save-quantity-button').forEach(function(button) {
      button.remove();
    });
    var button = document.createElement("button");
    var quantity = document.getElementById("quantity-" + id);
    value = parseInt(quantity.innerHTML);
    button.innerHTML = "Save";
    button.classList.add("save-quantity-button");
    button.addEventListener("click", function () {
              // Run a function when the button is clicked
              saveValue(value, id);
            });
    button.id = id
    document.getElementById(id).appendChild(button);
}

function saveValue(value, id){
    name = name.toLowerCase();
    var xhr = new XMLHttpRequest();
    //http://192.168.9.185:5000/search
    xhr.open("POST", "/save_stock", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function() {
        console.log(this.status);
        if (this.status == 200) {
            document.querySelectorAll('.save-quantity-button').forEach(function(button) {
              button.remove();
            });
        }
    }
    var data_to_send = "title=" + id + "&value=" + value;
    console.log(data_to_send);
    xhr.send(data_to_send);
}

function deleteItem(name){
    name = name.toLowerCase();
    confirm_delete = confirm(`Are you sure you want to delete ${name}?`)
    if (confirm_delete == true){
        var childDiv = document.getElementById(name);
        var parentDiv = childDiv.parentNode;
        parentDiv.remove();
        saveValue(null, name);
        var xhr = new XMLHttpRequest();
        //http://192.168.9.185:5000/search
        xhr.open("POST", "/delete-image", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onload = function(){
            console.log(this.status);
        };
        var data_to_send = "name=" + name;
        xhr.send(data_to_send);
    }

}

function createItem(name, quantity) {
    name = name.toLowerCase();
    // Get the items container
    var itemsContainer = document.querySelector(".items-container");

    // Create the item div
    var item = document.createElement("div");
    item.classList.add("item");

    // Create the item image div
    var itemImage = document.createElement("div");
    itemImage.classList.add("item-image");

    var deleteButtonOverlay = document.createElement("button")
    deleteButtonOverlay.innerText="x"
    deleteButtonOverlay.addEventListener("click", function(){
        deleteItem(name);
    });
    itemImage.appendChild(deleteButtonOverlay);

    var img = document.createElement("img");
    img.src = `/static/images/${name}.jpg`;
    img.alt = name;
    img.classList = "item-img-itself"
    itemImage.appendChild(img);

    // Create the item details div
    var itemDetails = document.createElement("div");
    itemDetails.classList.add("item-details");
    itemDetails.id = name;
    var itemTitle = document.createElement("div");
    itemTitle.classList.add("item-title");
    itemTitle.innerText = name;
    itemDetails.appendChild(itemTitle);

    var itemQuantity = document.createElement("div");
    itemQuantity.classList.add("item-quantity");

    var quantityValue = document.createElement("span");
    quantityValue.classList.add("item-quantity-value");
    quantityValue.id = `quantity-${name}`;
    quantityValue.contentEditable = true;
    quantityValue.innerText = `${quantity}`;
    quantityValue.onclick = function() {
      showSaveButton(name);
    };
    itemQuantity.appendChild(quantityValue);

    var increaseButton = document.createElement("button");
    increaseButton.innerText="+"
    increaseButton.addEventListener("click", function(){
        increaseQuantity(`quantity-${name}`);
    });
    increaseButton.classList.add("quantity-button-increase");
    itemQuantity.appendChild(increaseButton);

    var decreaseButton = document.createElement("button");
    decreaseButton.innerText="-"
    decreaseButton.addEventListener("click", function(){
        decreaseQuantity(`quantity-${name}`);
    });
    decreaseButton.classList.add("quantity-button-decrease");
    itemQuantity.appendChild(decreaseButton);

    itemDetails.appendChild(itemQuantity);
    item.appendChild(itemImage);
    item.appendChild(itemDetails);
    itemsContainer.appendChild(item);
}

function AddProduct(){
    var fileInput = document.getElementById("file-input");
    // Get the first file in the input element (assuming only one file is selected)
    var file = fileInput.files[0];
    var name = document.getElementById("product-name").value;
    // Create a new FormData object to send the file to the server
    var formData = new FormData();
    // Append the file to the form data
    formData.append("file", file, name + ".jpg");
    // Send the file to the server using the fetch API
    fetch("/save-image", {
        method: "POST",
        body: formData
    }).then(response => {
        // Handle the server response
        if (response.ok) {
          alert("Product added");
        } else {
          alert("Error saving image: " + response.statusText);
        }
      }).catch(error => {
        // Handle network errors
        alert("Error saving image");
   });
   createItem(name, "0");
}

window.onload = async function getStockData() {
  const response = await fetch('/databases/stock.csv');
  const csvData = await response.text();
  console.log(csvData);
  if (csvData != ""){
      const titles = csvData.split('\r\n')[0].split(',');
      const values = csvData.split('\r\n')[1].split(',');
      for (var i=0; i<values.length; i++){
        createItem(titles[i], values[i])
      };
  // 1. Add an event listener to the search bar
    document.querySelector(".search-field").addEventListener("keyup", function() {
      // 2. Get the value of the search bar
      var searchValue = this.value.toLowerCase();

      // 3. Select all of the products
      var products = document.querySelectorAll(".item");

      // 4. Iterate through each product
      for (var i = 0; i < products.length; i++) {
        var productName = products[i].querySelector(".item-details").id.toLowerCase();

        // 5. Check if the product's name contains the search value
        if (productName.indexOf(searchValue) === -1) {
          products[i].style.display = "none";
        } else {
          products[i].style.display = "block";
        }
      }
    });
  };

//  var quantity_inputs = document.getElementsByClassName("item-quantity-value");
//  for (var i=0; i<quantity_inputs.length; i++){
//    var name = quantity_inputs[i].id;
//    var sbid = name.substring(name.indexOf("-") + 1);
//    value_index = titles.indexOf(sbid);
//    value_used = values[value_index];
//    var quantity = document.getElementById(name);
//    quantity.innerHTML = parseInt(value_used);
//  }
  // Parse CSV data and set values for each item
}