$(function () {
    
    // variables  
    let indexContainer = $("#inedx-container"); 
    let mainContent = $("#main-content");
    let register = $("#register");
    let login = $("#login");
    let gallery = $("#gallery");
    let shoppingCard = $("#shopping-card");

    let isUser = false;

    let picGallery;
    let indexGallery = 0; // will track our current image;

    // Flash message
    let flashMessage = document.createElement("p");
    flashMessage.textContent = "";
    flashMessage.classList.add("centered");
    indexContainer.append(flashMessage);

    // register
    register.on("click", function() {
        loadContent("register");
        return false;
    })

    // login
    login.on("click", function() {
        loadContent("login");
        return false;
    })

    // gallery
    gallery.on("click", function() {
        loadContent("gallery");
        return false;
    })

    // shopping card
    shoppingCard.on("click", function() {
        loadContent("shoppingCard")
        return false;
    })
  
    //load page content
    let loadContent = function(linkName) {
        mainContent.load(
            linkName + ".html",
            function() {
                switch (linkName) {
                    case "login":
                        if (!isUser) {
                            // get gallery json data with AJAX
                            let xhrLogin = new XMLHttpRequest();
                            xhrLogin.onload = function() {
                                if (xhrLogin.status != 200) return;
                                let xhrDoc = xhrLogin.response;
                                let userList = xhrDoc.users;
                                loginUser(userList);
                            };
                            xhrLogin.open("GET", "./users.json");
                            xhrLogin.responseType = "json" ;
                            xhrLogin.send();
                        } else {
                            let loginForm = document.querySelector(".loginForm");
                            loginForm.remove();
                            flashMessage.textContent = "You are in logged in";
                        }
              
                        break;
                    case "gallery":
                        // get gallery json data with AJAX
                        let xhr = new XMLHttpRequest();
                        xhr.onload = function() {
                            if (xhr.status != 200) return;
                            let xhrDoc = xhr.response;
                            let picData = xhrDoc.painting;
                            addToStorage(picData);
                            readFromStorage();
                            showGallery();
                        };
                        xhr.open("GET", "./gallery.json");
                        xhr.responseType = "json" ;
                        xhr.send();
                        break;
                
                    default:
                        break;
                }
            }
        )
    }

    // login user
    function loginUser(userList) {
        let username = document.querySelector("#username");
        let password = document.querySelector("#password");
        let input = document.querySelector("#username");
        let loginForm = document.querySelector(".loginForm");
        let submit = document.querySelector("#submit");

        submit.addEventListener("click", function() {
            for (let i=0; i < userList.length; i++) {
                if (input.value == userList[i].username) {
                    flashMessage.textContent = "You are logged in";
                    isUser = true;
                    loginForm.remove();
                    break;
                } else {
                    flashMessage.textContent = "Der username: " + input.value + " ist falsch!";
                }
            }
        })
    }

    // add Gallery data to LocalStorage
    function addToStorage (picData)
    {
        if (Storage) localStorage.setItem("picGallery", JSON.stringify(picData));
    }

    // read data from LocalStorage
    function readFromStorage() {
        picGallery = JSON.parse(localStorage.getItem("picGallery"));
    }

    let cardObj;
    // show painting gallery
    function showGallery() {
        for (let i=0; i < picGallery.length; i++) {
            cardObj = picGallery[i];
            createCard(cardObj,i); 
        }
    }

    // create card based on objects in json
    function createCard(cardObj,i) {   
        let imageContainer, card, text, img, popup;
     
        // card
        card = document.createElement("div");
        card.setAttribute("class", "col-md-6");

        // img
        img = document.createElement("img");
        img.src = "./img/" + cardObj.src;
        img.setAttribute("class", "images");
        
        // set effect to image
        imgEffect(img,i);

        // price
        price = document.createElement("p");
        price.textContent = cardObj.price + "$ ";
        $(price).css("display", "inline");
        price.setAttribute("class", "siteText")

        // add to card text
        addToCard = document.createElement("button");
        addToCard.innerText = "Add To Card"; 
        addToCard.setAttribute("class", "cardButton")
        $(addToCard).css("display", "inline");

        // add to card event
        $(addToCard).click(function() {
            addToCardClicked(cardObj,i);
        })

        // info row
        infoRow = document.createElement("div");

        // append text and addToCard to info row 
        infoRow.append(price, addToCard);

        // append img and infoRow to card
        card.append(img, infoRow);

        // append card to image container
        imageContainer = document.querySelector("#image-container");
        imageContainer.append(card);
    }

     // set effect to pics in Gallery
    function imgEffect(img,i) {
        img.addEventListener("mouseover", function() {
            img.style = "transform: scale(1.05)";
        });

        img.addEventListener("mouseout", function() {
            img.style = "transform: scale(1)";
        });

        // create popup
        img.addEventListener("click", function() {
            indexGallery = i;
            createPopup(img);
            // popup activate
            popup.classList.toggle('active');
        });
        
        // close popup
        const closeBtn = document.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.onclick = function() {
            popup.classList.toggle('active');
            };
        }
    
        // prev
        const leftArrow = document.querySelector('.left-arrow');
        if (leftArrow) {
            leftArrow.onclick = function() {
                indexGallery--;
                if (indexGallery < 0) indexGallery = picGallery.length - 1;
                createPopup();                
            }
        }
        
        // next
        const rightArrow = document.querySelector('.right-arrow');
        if (rightArrow) {
            rightArrow.onclick = function() {
                indexGallery++;
                if (indexGallery == picGallery.length || indexGallery > picGallery.length) indexGallery = 0;
                createPopup();                
            }
        }
    }

    let itemList
    //create popup after click on image
    function createPopup(img="") {
        const imageName = document.querySelector('.image-name');
        const largeImage = document.querySelector('.large-image');
        const imageIndex = document.querySelector('.index');
        popup = document.querySelector('.popup');

        let path = `img/pic${indexGallery+1}.jpg`;
        largeImage.src = path;
        imageName.innerHTML = path;
        imageIndex.innerHTML = `0${indexGallery+1}`;
    }

    // Define a card object to store items
    let card = [];
    let addToCard;
    let totalPrice = 0;  
    let storeCardObj = [];
    let storedCardObj = [];

    // Function to handle "Add to Card" click event
    function addToCardClicked(cardObj) {
        // define elements
        addToCard = document.querySelector(".addToCard");
        itemList = document.querySelector("#cartItem");
        let oneItem;

        // Add the item to the cart array        
        card.push(cardObj.src);

        // popup activate
        addToCard.classList.add("active");  
        
        // add to localStorage
        storeCardObj.push(cardObj);    
        if (localStorage) {
            // Stringify itemsArr before storing it in localStorage
            localStorage.setItem("storedCardObj", JSON.stringify(storeCardObj));
        }

        // set counter
        document.getElementById("count").innerHTML=card.length;

        if (card.length == 0 ) {
            document.getElementById("cartItem").innerHTML = "Your cart is empty";
            document.getElementById("total").innerHTML = "$ "+0+".00";
        } else {

        // fetch data from storage    
        storedCardObj = JSON.parse(localStorage.getItem("storedCardObj"));  
        
        console.log(storedCardObj);
        // todo: call storedCardObj from storage, iterate the object and show all
        
        // show card elements
        document.getElementById("cartItem").innerHTML +=
        `<div class='cart-item'>
        <div class='row-img'>
            <img class='rowimg' src=img/${cardObj.src}>
        </div>
        <p style='font-size: 15px;'>${cardObj.src}</p>
        <p style='font-size: 15px;'>$ ${cardObj.price}.00</p>`+
        "<i class='fa-solid fa-trash' onclick=''></i></div>"; 

        // set total price
        totalPrice += cardObj.price;          
        document.getElementById("total").innerHTML = "$ "+totalPrice+".00";
        } 
        
    // close shoppingCard
    const closeCardBtn = document.querySelector('#closeCardBtn');
    if (closeCardBtn) {
        closeCardBtn.onclick = function() {
            addToCard.classList.toggle('active');
        };
    }
 
    }
 

});
