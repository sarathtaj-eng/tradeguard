// =====================================
// TradeGuard Masters
// =====================================

const masters = [

{
    masterID:"TG-M001",
    growth:186,
    days:286,
    drawdown:8.2,
    followers:182,
    status:"ONLINE"
},

{
    masterID:"TG-M002",
    growth:142,
    days:410,
    drawdown:5.6,
    followers:275,
    status:"ONLINE"
},

{
    masterID:"TG-M003",
    growth:96,
    days:180,
    drawdown:4.8,
    followers:81,
    status:"OFFLINE"
},

{
    masterID:"TG-M004",
    growth:210,
    days:120,
    drawdown:15.2,
    followers:325,
    status:"ONLINE"
},

{
    masterID:"TG-M005",
    growth:68,
    days:520,
    drawdown:3.5,
    followers:91,
    status:"ONLINE"
},

{
    masterID:"TG-M006",
    growth:128,
    days:240,
    drawdown:7.9,
    followers:145,
    status:"ONLINE"
},

{
    masterID:"TG-M007",
    growth:82,
    days:365,
    drawdown:6.1,
    followers:54,
    status:"OFFLINE"
},

{
    masterID:"TG-M008",
    growth:310,
    days:90,
    drawdown:28.4,
    followers:470,
    status:"ONLINE"
}

];

// =====================================
// Current Data
// =====================================

let filteredMasters = [...masters];

// =====================================
// Load Cards
// =====================================

renderMasters(filteredMasters);

// =====================================
// Render Cards
// =====================================

function renderMasters(data){

const container = document.getElementById("masterContainer");

container.innerHTML = "";

if(data.length===0){

container.innerHTML=`

<div style="width:100%;text-align:center;padding:80px;color:#888;font-size:20px;">

No Masters Found

</div>

`;

return;

}

data.forEach(master=>{

const card=document.createElement("div");

card.className="masterCard";

card.innerHTML=`

<div class="masterHeader">

<div class="masterID">

${master.masterID}

</div>

<div class="status">

${master.status}

</div>

</div>

<div class="stats">

<div class="stat">

<div class="statTitle">

Trading Days

</div>

<div class="statValue">

${master.days}

</div>

</div>

<div class="stat">

<div class="statTitle">

Growth

</div>

<div class="statValue">

+${master.growth}%

</div>

</div>

<div class="stat">

<div class="statTitle">

Max Drawdown

</div>

<div class="statValue">

${master.drawdown}%

</div>

</div>

<div class="stat">

<div class="statTitle">

Followers

</div>

<div class="statValue">

${master.followers}

</div>

</div>

</div>

<button class="viewBtn"

onclick="viewMaster('${master.masterID}')">

View Profile

</button>

`;

container.appendChild(card);

});

}

// =====================================
// Search
// =====================================

document.getElementById("searchBox").addEventListener("input",function(){

const keyword=this.value.toUpperCase();

filteredMasters=masters.filter(master=>{

return master.masterID.includes(keyword);

});

renderMasters(filteredMasters);

});

// =====================================
// Sort
// =====================================

document.getElementById("sortBy").addEventListener("change",function(){

const sort=this.value;

if(sort==="growth"){

filteredMasters.sort((a,b)=>b.growth-a.growth);

}

if(sort==="days"){

filteredMasters.sort((a,b)=>b.days-a.days);

}

if(sort==="drawdown"){

filteredMasters.sort((a,b)=>a.drawdown-b.drawdown);

}

if(sort==="followers"){

filteredMasters.sort((a,b)=>b.followers-a.followers);

}

renderMasters(filteredMasters);

});

// =====================================
// Filters
// =====================================

document.getElementById("applyFilters").addEventListener("click",function(){

const minDays=parseInt(document.getElementById("minDays").value)||0;

const maxDD=parseFloat(document.getElementById("maxDD").value)||999;

const minGrowth=parseFloat(document.getElementById("minGrowth").value)||0;

filteredMasters=masters.filter(master=>{

return(

master.days>=minDays &&

master.drawdown<=maxDD &&

master.growth>=minGrowth

);

});

renderMasters(filteredMasters);

});

// =====================================
// View Profile
// =====================================

function viewMaster(masterID){

alert("Open Master Profile : "+masterID);

// Later

// window.location.href="master-profile.html?id="+masterID;

}
