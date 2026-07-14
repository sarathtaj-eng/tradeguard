/* ===========================================================
   TradeGuard Universal Image Zoom
   Version 1.0
=========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    // Create overlay

    const overlay = document.createElement("div");
    overlay.className = "zoom-overlay";

    overlay.innerHTML = `
        <span class="zoom-close">&times;</span>
        <img class="zoom-image">
        <div class="zoom-help">
            Mouse Wheel = Zoom • Drag = Move • Double Click = Reset • ESC = Close
        </div>
    `;

    document.body.appendChild(overlay);

    const zoomImage = overlay.querySelector(".zoom-image");
    const closeBtn = overlay.querySelector(".zoom-close");

    let scale = 1;
    let posX = 0;
    let posY = 0;

    let dragging = false;

    let startX = 0;
    let startY = 0;

    function update(){

        zoomImage.style.transform =
            `translate(${posX}px,${posY}px) scale(${scale})`;

    }

    function open(src){

        overlay.classList.add("active");

        zoomImage.src = src;

        scale = 1;
        posX = 0;
        posY = 0;

        update();

    }

    function close(){

        overlay.classList.remove("active");

    }

    // Open

    document.querySelectorAll(".zoomable").forEach(img=>{

        img.addEventListener("click",()=>{

            open(img.src);

        });

    });

    // Close

    closeBtn.onclick = close;

    overlay.addEventListener("click",(e)=>{

        if(e.target===overlay){

            close();

        }

    });

    // ESC

    document.addEventListener("keydown",(e)=>{

        if(e.key==="Escape"){

            close();

        }

    });

    // Mouse wheel zoom

    overlay.addEventListener("wheel",(e)=>{

        e.preventDefault();

        if(e.deltaY<0){

            scale += 0.1;

        }else{

            scale -= 0.1;

        }

        if(scale<1) scale=1;

        if(scale>6) scale=6;

        update();

    });

    // Drag

    zoomImage.addEventListener("mousedown",(e)=>{

        dragging=true;

        zoomImage.classList.add("dragging");

        startX=e.clientX-posX;
        startY=e.clientY-posY;

    });

    document.addEventListener("mousemove",(e)=>{

        if(!dragging) return;

        posX=e.clientX-startX;
        posY=e.clientY-startY;

        update();

    });

    document.addEventListener("mouseup",()=>{

        dragging=false;

        zoomImage.classList.remove("dragging");

    });

    // Double click reset

    zoomImage.addEventListener("dblclick",()=>{

        scale=1;
        posX=0;
        posY=0;

        update();

    });

});
