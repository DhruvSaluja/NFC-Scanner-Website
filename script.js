const scanButton = document.getElementById("scanButton");
const glucoseValue = document.getElementById("glucoseValue");
const historyList = document.getElementById("historyList");

let simulationMode = false;   // TRUE = test without NFC

loadHistory();

/* ================================
   Scan Button
================================ */

scanButton.addEventListener("click", async () => {

if(simulationMode){
    simulateNFC();
    return;
}

if ("NDEFReader" in window) {

    try {

        const ndef = new NDEFReader();
        await ndef.scan();

        glucoseValue.innerText = "Scanning NFC...";

        ndef.onreading = event => {

            const decoder = new TextDecoder();
            const record = event.message.records[0];
            const text = decoder.decode(record.data);

            processSensorData(text);

        };

    } catch(error) {

        glucoseValue.innerText = "NFC Scan Failed";

    }

} else {

    alert("Web NFC not supported on this device");

}

});


/* ================================
   Process Sensor Data
================================ */

function processSensorData(payload){

try{

    // Expected format
    // GLUCOSE:110;UNIT:mg/dL;TIME:2026-03-06

    let parts = payload.split(";");

    let glucose = parts[0].split(":")[1];
    let unit = parts[1].split(":")[1];
    let time = parts[2].split(":")[1];

    let display = `${glucose} ${unit}`;

    glucoseValue.innerText = display;

    saveReading(display,time);

}catch(err){

    glucoseValue.innerText = payload;

}

}


/* ================================
   Simulation Mode (No NFC needed)
================================ */

function simulateNFC(){

let glucose = Math.floor(Math.random()*40)+90;

let payload = `GLUCOSE:${glucose};UNIT:mg/dL;TIME:${new Date().toISOString()}`;

processSensorData(payload);

}


/* ================================
   Save Reading
================================ */

function saveReading(value,time){

let history = JSON.parse(localStorage.getItem("glucoseHistory")) || [];

let entry = {
    value:value,
    time:time
};

history.push(entry);

localStorage.setItem("glucoseHistory", JSON.stringify(history));

loadHistory();

}


/* ================================
   Load History
================================ */

function loadHistory(){

let history = JSON.parse(localStorage.getItem("glucoseHistory")) || [];

historyList.innerHTML="";

history.reverse().forEach(item=>{

    let li = document.createElement("li");

    li.textContent = `${item.value}  |  ${item.time}`;

    historyList.appendChild(li);

});

}