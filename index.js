const text = document.querySelector(".text");
text.innerHTML = text.textContent.replace(/\S/g, "<span>$&</span>")

let order = 1;

const span = document.querySelectorAll(".text span");

for (let i= 0; i < span.length; i++) {
    span[i].setAttribute("style",`--i:${order++ * 0.5};"`);
}

const bigHeart = document.querySelector('.big-heart');
console.log(order);
setTimeout(()=>{
    bigHeart.classList.remove("hidden");
},order*300);