/* ==========================================
   TradeGuard Trailing Manager Functions
   ========================================== */

function enableTrailing(btn){

    btn.className = "btn-blue";
    btn.innerHTML = "⚙ Manage";

    btn.onclick = function(){
        openSettings(btn);
    };

    let row = btn.closest("tr");
    let badge = row.querySelector(".inactive-badge");

    if(badge){
        badge.className = "active-badge";
        badge.innerHTML = "ACTIVE";
    }

}

function openSettings(btn){

    document.getElementById("settingsModal").style.display = "block";

}

function closeSettings(){

    document.getElementById("settingsModal").style.display = "none";

}

function disableTrailing(){

    document.getElementById("settingsModal").style.display = "none";

    alert("Trailing Disabled");

}
