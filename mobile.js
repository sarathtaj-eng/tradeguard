/* ==========================================
   TradeGuard Mobile Functions
   ========================================== */

/* Toggle Sidebar */

function toggleMenu(){

    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".sidebar-overlay");

    if(sidebar) sidebar.classList.toggle("show");
    if(overlay) overlay.classList.toggle("show");

}

/* Close Sidebar */

function closeMenu(){

    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".sidebar-overlay");

    if(sidebar) sidebar.classList.remove("show");
    if(overlay) overlay.classList.remove("show");

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

/* Close menu when resizing to desktop */

window.addEventListener("resize", function(){

    if(window.innerWidth > 768){
        closeMenu();
    }

});
