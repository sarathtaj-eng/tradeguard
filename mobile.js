/* ==========================================
   TradeGuard Mobile Functions
   ========================================== */

function toggleMenu(){

    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".sidebar-overlay");

    sidebar.classList.toggle("show");
    overlay.classList.toggle("show");

}

/* Close menu */

function closeMenu(){

    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".sidebar-overlay");

    sidebar.classList.remove("show");
    overlay.classList.remove("show");

}

/* Close menu when clicking a menu item */

document.addEventListener("DOMContentLoaded", function(){

    const links = document.querySelectorAll(".menu a");

    links.forEach(function(link){

        link.addEventListener("click", function(){

            if(window.innerWidth <= 768){
                closeMenu();
            }

        });

    });

});

/* Close menu when screen becomes desktop */

window.addEventListener("resize", function(){

    if(window.innerWidth > 768){
        closeMenu();
    }

});
