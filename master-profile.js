// =====================================
// TradeGuard Master Profile
// =====================================

// Demo Master Data
const masters = [

{
    masterID:"TG-M001",
    status:"ONLINE",
    days:286,
    growth:186,
    drawdown:8.2,
    followers:182,
    since:"01-Jan-2026",
    telegram:"@TradeMaster01",
    whatsapp:"+971501234567",
    email:"master01@tradeguard.ai",
    about:"Professional Gold and Index trader focused on low drawdown and long-term capital growth."
},

{
    masterID:"TG-M002",
    status:"ONLINE",
    days:410,
    growth:142,
    drawdown:5.6,
    followers:275,
    since:"15-Aug-2025",
    telegram:"@TradeMaster02",
    whatsapp:"+971502222222",
    email:"master02@tradeguard.ai",
    about:"Swing trader specializing in Gold and Forex with consistent monthly returns."
},

{
    masterID:"TG-M003",
    status:"OFFLINE",
    days:180,
    growth:96,
    drawdown:4.8,
    followers:81,
    since:"01-Feb-2026",
    telegram:"Hidden",
    whatsapp:"Hidden",
    email:"Hidden",
    about:"Private trader. Contact information hidden."
}

];

// =====================================
// Get Master ID from URL
// =====================================

const params = new URLSearchParams(window.location.search);

const masterID = params.get("id");

// =====================================
// Find Master
// =====================================

const master = masters.find(m => m.masterID === masterID);

// =====================================
// Load Profile
// =====================================

if(master){

    document.getElementById("masterID").innerText =
    master.masterID;

    document.getElementById("statusBadge").innerHTML =
    master.status==="ONLINE"
    ? "🟢 ONLINE"
    : "🔴 OFFLINE";

    document.getElementById("days").innerText =
    master.days;

    document.getElementById("growth").innerText =
    "+" + master.growth + "%";

    document.getElementById("drawdown").innerText =
    master.drawdown + "%";

    document.getElementById("followers").innerText =
    master.followers;

    document.getElementById("since").innerText =
    master.since;

    document.getElementById("telegram").innerText =
    master.telegram;

    document.getElementById("whatsapp").innerText =
    master.whatsapp;

    document.getElementById("email").innerText =
    master.email;

    document.getElementById("about").innerText =
    master.about;

}
else{

    alert("Master Not Found");

    window.location.href="masters.html";

}

// =====================================
// Follow Request
// =====================================

document.getElementById("followBtn").addEventListener("click",function(){

    alert(

        "Follow request sent to " + master.masterID

    );

});

// =====================================
// Contact Master
// =====================================

document.getElementById("messageBtn").addEventListener("click",function(){

    if(master.telegram!=="Hidden"){

        alert(

            "Telegram : " + master.telegram

        );

    }
    else{

        alert(

            "This master has hidden contact details."

        );

    }

});
