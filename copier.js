document.addEventListener("DOMContentLoaded", function () {

    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.getElementById("overlay");

    if (menuToggle && sidebar && overlay) {

        menuToggle.addEventListener("click", function () {
            sidebar.classList.toggle("active");
            overlay.classList.toggle("active");
        });

        overlay.addEventListener("click", function () {
            sidebar.classList.remove("active");
            overlay.classList.remove("active");
        });

    }

});
// ================================
// MT5 Guide Popup
// ================================

function openMT5Guide(){

document.getElementById("mt5GuideModal").style.display="block";

}

function closeMT5Guide(){

document.getElementById("mt5GuideModal").style.display="none";

}

window.addEventListener("click",function(e){

const modal=document.getElementById("mt5GuideModal");

if(e.target===modal){

modal.style.display="none";

}

});
