const scanButton = document.getElementById("scanButton");

const sensorValue = document.getElementById("sensorValue");

const historyList = document.getElementById("historyList");



/* =====================
   Chart Initialization
===================== */

const ctx = document.getElementById("sensorChart").getContext("2d");

let sensorChart = new Chart(ctx,{

type:"line",

data:{

labels:[],

datasets:[

{
label:"Glucose (mg/dL)",
data:[],
borderWidth:2,
tension:0.3
},

{
label:"Temperature (°C)",
data:[],
borderWidth:2,
tension:0.3
},

{
label:"pH",
data:[],
borderWidth:2,
tension:0.3
}

]

},

options:{
responsive:true
}

});



loadHistory();



/* =====================
   NFC Scan
===================== */

scanButton.addEventListener("click",scanNFC);



async function scanNFC(){

if(!("NDEFReader" in window)){

alert("NFC not supported");

return;

}



try{

const ndef=new NDEFReader();

await ndef.scan();

sensorValue.innerText="Scanning NFC...";



ndef.onreading=event=>{

const decoder=new TextDecoder();

const record=event.message.records[0];

const text=decoder.decode(record.data);

processSensorData(text);

};

}catch(err){

console.log(err);

}

}



/* =====================
   Process Sensor Data
===================== */

function processSensorData(payload){

try{

let parts=payload.split(";");

let glucose=parts[0].split(":")[1];

let temp=parts[1].split(":")[1];

let ph=parts[2].split(":")[1];

let time=parts[3].split(":")[1];



sensorValue.innerHTML=

`Glucose: ${glucose} mg/dL <br>
Temperature: ${temp} °C <br>
pH: ${ph}`;



saveReading(glucose,temp,ph,time);



}catch{

sensorValue.innerText=payload;

}

}



/* =====================
   Simulation Mode
===================== */

function simulateNFC(){

let glucose=Math.floor(Math.random()*40)+90;

let temp=(Math.random()*4+28).toFixed(1);

let ph=(Math.random()*0.6+6.8).toFixed(2);

let time=new Date().toLocaleTimeString();



let payload=

`GLUCOSE:${glucose};TEMP:${temp};PH:${ph};TIME:${time}`;

processSensorData(payload);

}



/* =====================
   Save Reading
===================== */

function saveReading(glucose,temp,ph,time){

let history=JSON.parse(localStorage.getItem("sensorHistory"))||[];

let entry={

glucose:glucose,
temp:temp,
ph:ph,
time:time

};



history.push(entry);

localStorage.setItem("sensorHistory",JSON.stringify(history));



updateGraph(glucose,temp,ph,time);

loadHistory();

}



/* =====================
   Load History
===================== */

function loadHistory(){

let history=JSON.parse(localStorage.getItem("sensorHistory"))||[];

historyList.innerHTML="";



sensorChart.data.labels=[];

sensorChart.data.datasets[0].data=[];

sensorChart.data.datasets[1].data=[];

sensorChart.data.datasets[2].data=[];



history.forEach(item=>{

let li=document.createElement("li");

li.textContent=

`G:${item.glucose} | T:${item.temp}°C | pH:${item.ph} | ${item.time}`;

historyList.appendChild(li);



sensorChart.data.labels.push(item.time);

sensorChart.data.datasets[0].data.push(parseFloat(item.glucose));

sensorChart.data.datasets[1].data.push(parseFloat(item.temp));

sensorChart.data.datasets[2].data.push(parseFloat(item.ph));



});



sensorChart.update();

}



/* =====================
   Update Graph
===================== */

function updateGraph(glucose,temp,ph,time){

sensorChart.data.labels.push(time);

sensorChart.data.datasets[0].data.push(parseFloat(glucose));

sensorChart.data.datasets[1].data.push(parseFloat(temp));

sensorChart.data.datasets[2].data.push(parseFloat(ph));



sensorChart.update();

}



/* =====================
   CSV Download
===================== */

function downloadCSV(){

let history=JSON.parse(localStorage.getItem("sensorHistory"))||[];

if(history.length===0){

alert("No data available");

return;

}



let csv="Glucose,Temperature,pH,Time\n";



history.forEach(item=>{

csv+=`${item.glucose},${item.temp},${item.ph},${item.time}\n`;

});



let blob=new Blob([csv],{type:"text/csv"});

let url=URL.createObjectURL(blob);



let a=document.createElement("a");

a.href=url;

a.download="biosensor_readings.csv";

a.click();



URL.revokeObjectURL(url);

}