
// =====================================
// TradeGuard Admin Panel
// =====================================

// Change this if your Render URL changes
const API_URL = "https://tradeguard-5rqn.onrender.com";


// ===============================
// Dashboard
// ===============================

function showDashboard(){

    document.getElementById("contentArea").innerHTML = `

        <h2>Welcome to TradeGuard Administration</h2>

        <p>Select a menu from the left sidebar.</p>

    `;

}


// ===============================
// Load Users
// ===============================

async function loadUsers(){

    try{

        const response = await fetch(API_URL + "/users");

        const data = await response.json();

        const users = data.users || data;

        document.getElementById("totalUsers").innerHTML = users.length;

        let html = `

        <h2>Registered Users</h2>

        <br>

        <input
            type="text"
            id="search"
            placeholder="Search by Email..."
            onkeyup="searchUser()">

        <table id="userTable">

        <thead>

        <tr>

        <th>ID</th>
        <th>Username</th>
        <th>Email</th>
        <th>Plan</th>
        <th>Status</th>
        <th>Trial Ends</th>

        </tr>

        </thead>

        <tbody>

        `;

        users.forEach(user=>{

            html += `

            <tr>

            <td>${user.id}</td>

            <td>${user.username}</td>

            <td>${user.email}</td>

            <td>${user.plan}</td>

            <td>${user.account_status}</td>

            <td>${
                user.trial_end
                ? new Date(user.trial_end).toLocaleDateString()
                : "-"
            }</td>

            </tr>

            `;

        });

        html += `

        </tbody>

        </table>

        `;

        document.getElementById("contentArea").innerHTML = html;

    }

    catch(err){

        console.log(err);

        alert("Unable to load users.");

    }

}


// ===============================
// Search User
// ===============================

function searchUser(){

    let input=document.getElementById("search").value.toUpperCase();

    let table=document.getElementById("userTable");

    let tr=table.getElementsByTagName("tr");

    for(let i=1;i<tr.length;i++){

        let td=tr[i].getElementsByTagName("td")[2];

        if(td){

            let txt=td.textContent || td.innerText;

            tr[i].style.display=

                txt.toUpperCase().indexOf(input)>-1

                ? ""

                : "none";

        }

    }

}


// ===============================
// Contact Messages
// ===============================

function loadMessages(){

    document.getElementById("contentArea").innerHTML = `

        <h2>Contact Messages</h2>

        <p>Coming in Step 4...</p>

    `;

}


// ===============================
// Subscription
// ===============================

function loadSubscriptions(){

    document.getElementById("contentArea").innerHTML = `

        <h2>Subscriptions</h2>

        <p>Coming in Step 5...</p>

    `;

}


// ===============================
// Licenses
// ===============================

function loadLicenses(){

    document.getElementById("contentArea").innerHTML = `

        <h2>EA Licenses</h2>

        <p>Coming in Step 6...</p>

    `;

}


// ===============================
// Downloads
// ===============================

function loadDownloads(){

    document.getElementById("contentArea").innerHTML = `

        <h2>Downloads</h2>

        <p>Coming soon...</p>

    `;

}


// ===============================
// Settings
// ===============================

function loadSettings(){

    document.getElementById("contentArea").innerHTML = `

        <h2>Settings</h2>

        <p>Coming soon...</p>

    `;

}


// ===============================
// Default Page
// ===============================

showDashboard();

