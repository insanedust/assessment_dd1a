window.onload = () => {

    addOrderButton();
    var cardBodies = document.getElementsByClassName("card-body");
    var keys = Object.keys(cardBodies);
    keys.forEach(function(key,index){
        updateItemState((index + 1));
    });
};

var SessionStorage = [];
var count = 0;
var totalValue = 0;

function addOrderButton(){
    var placeOrderButton = document.getElementById("orderButton");
    placeOrderButton.addEventListener('click', function(){
        placeOrder(SessionStorage);
    });
}

function createElementNode(elementType, classNames, elementId){
    var node = document.createElement(elementType);
    node.setAttribute("class", classNames);
    if(elementId)
        node.setAttribute("id", elementId);
    return node;
}

function updateItemState(categoryId){

    function setCardBodyState(items){
        items.forEach(function(item,index){
            var card = document.getElementById("card"+categoryId);
            var itemContainer = createElementNode('div',"data",('item'+ item.menuitem_id));
            var button = createElementNode('button', 'btn btn-block');
            button.addEventListener('click',function(){
                updateOrdersList(item.menuitem_id);
            });
            button.innerText = item.name + " " + "R" + item.price;
            var description = createElementNode('p',"","des"+ item.menuitem_id)
            description.innerText = item.description;
            itemContainer.appendChild(button);
            itemContainer.appendChild(description);
    
            card.appendChild(itemContainer);  
        });
    }
        ajax('GET','api/v1/menuitems/category/'+ categoryId,setCardBodyState);  
}

function ajax(requestType, urlEndPoint, cb) {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            cb(data);
        }
    };

    xmlhttp.open(requestType, urlEndPoint, true);
    xmlhttp.send();
}

function updateOrdersList(itemId){

    var table = document.getElementsByTagName("table");
    var tableBody = document.getElementById("customBody");

    ajax('GET',('api/v1/menuitems/'+ itemId), insertOrdersState)
    
    function insertOrdersState(data){

        if(document.getElementById("row-menu-" + data[0].menuitem_id)) {
            SessionStorage.push(data[0]);
            var row = document.getElementById("row-menu-" + data[0].menuitem_id);
            var qty = document.getElementById("qty-"+data[0].menuitem_id);
            var price = document.getElementById("price-"+data[0].menuitem_id);
            qty.innerText = (Number(qty.innerText) + 1);
            price.innerText = Number(qty.innerText) * data[0].price;
            var totalValue = document.getElementById("totalValue");
            totalValue.innerText = "Total: R" + calTotalorder();
        }
        else {
            count += 1;
            SessionStorage.push(data[0]);
            var tr = document.createElement("tr");
            var tdNo = document.createElement("td");
            tr.setAttribute("id","row-menu-" + data[0].menuitem_id);

            var tdQuanity = document.createElement("td");
            tdQuanity.setAttribute("id","qty-"+ data[0].menuitem_id);
            tdQuanity.setAttribute("data-qty","1")

            var tdName = document.createElement("td");
            var tdPrice = document.createElement("td");
            tdPrice.setAttribute("id","price-" + data[0].menuitem_id);
            tdPrice.setAttribute("data-unitPrice",data[0].price);

            var itemRemove = document.createElement("button");
            itemRemove.setAttribute("id","rb-"+ data[0].menuitem_id);
            itemRemove.addEventListener('click',function(){
                remItemOfList(data[0].menuitem_id);
            })

            itemRemove.innerText = "Remove";
            itemRemove.setAttribute("class", "btn btn-block btn-danger")
            
            tdNo.innerText = count;
            tdQuanity.innerText = "1";
            tdName.innerText = data[0].name;
            tdPrice.innerText = "R" + data[0].price;

            tr.appendChild(tdNo);
            tr.appendChild(tdQuanity);
            tr.appendChild(tdName);
            tr.appendChild(tdPrice);
            tr.appendChild(itemRemove);
            tableBody.appendChild(tr);
            
            var totalValue = document.getElementById("totalValue");
            totalValue.innerText = "Total: R" + calTotalorder();
        }

        function calTotalorder(){
            var total = 0;
            SessionStorage.forEach(function(purchase){
                total += purchase.price; 
            });

            return total;
        }

        function removeItemFromStorage(sessionStorage, id){
            for(var i = 0; i < sessionStorage.length; i ++) {
                if(sessionStorage[i].menuitem_id == id) {
                    sessionStorage.splice(i,1);
                }
            }

            var totalValue = document.getElementById("totalValue");
            totalValue.innerText = "Total: R" + calTotalorder();

        }

        
        function remItemOfList(id){

            var changeQuantity = document.getElementById("qty-" + id);
            var price = document.getElementById("price-"+id);
            if(Number(changeQuantity.innerText) > 1 ){

                var amount = Number(price.innerText);
                var amountToRemove = price.getAttribute("data-unitPrice");
                
                price.innerText = (amount - Number(amountToRemove));
                var qty = changeQuantity.innerText;
                var newQty = (Number(qty) - 1)
                changeQuantity.innerText = newQty.toString();
                removeItemFromStorage(SessionStorage,id);   
                
            }
            else {
                var item = document.getElementById("row-menu-"+ id)
                removeItemFromStorage(SessionStorage,id);
                item.remove();
                var totalValue = document.getElementById("totalValue");
                totalValue.innerText = "Total: R" + calTotalorder();
                
            }           
        }
    }
}

function placeOrder(sessionStorage){
    var emailAddress = document.getElementById("emailInput").value;
    var orderNo = document.getElementById("orderNo").innerText;

    var data = [];
    sessionStorage.forEach(function(item){

        data.push({
            menuitem_id: item.menuitem_id,
            order_no: orderNo,
            price: item.price,
            email: emailAddress
        });

    });

        var jsonData = JSON.stringify(data);
        sendData(jsonData);

        function sendData(data){
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                }
            };
            xhttp.open("POST", "api/v1/orders", true);
            xhttp.setRequestHeader("Content-Type", "application/json","charset=UTF-8");
            xhttp.send(data);
            window.location = "http://localhost:3000/summary/" + orderNo;
        }
    
}
