let reportData = ""

/* ---------------- SEND MESSAGE ---------------- */

function sendMessage(){

let input = document.getElementById("userInput").value.trim()

if(input === "") return

let chat = document.getElementById("chatbox")

chat.innerHTML += `<div class="user">${input}</div>`
chat.innerHTML += `<div class="bot typing">AI analyzing...</div>`

fetch("/chat",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({message:input})
})

.then(res => res.json())

.then(data => {

let typing = document.querySelector(".typing")
if(typing) typing.remove()

chat.innerHTML += `<div class="bot summary">${data.summary}</div>`

reportData = data.summary + "\n"

data.explanations.forEach(exp => {

chat.innerHTML += `<div class="bot">${exp}</div>`
reportData += exp + "\n"

})

chat.scrollTop = chat.scrollHeight

})

.catch(error => {

alert("Error connecting to server")

})

document.getElementById("userInput").value=""

}

/* ---------------- FILE UPLOAD ---------------- */

function uploadFile(){

let file = document.getElementById("fileInput").files[0]

if(!file){
alert("Please select a PDF file")
return
}

let chat = document.getElementById("chatbox")

chat.innerHTML += `<div class="bot typing">Reading document...</div>`

let formData = new FormData()
formData.append("file",file)

fetch("/upload",{
method:"POST",
body:formData
})

.then(res => res.json())

.then(data => {

let typing = document.querySelector(".typing")
if(typing) typing.remove()

chat.innerHTML += `<div class="bot summary">${data.summary}</div>`

reportData = data.summary + "\n"

data.explanations.forEach(exp => {

chat.innerHTML += `<div class="bot">${exp}</div>`
reportData += exp + "\n"

})

chat.scrollTop = chat.scrollHeight

})

.catch(error => {

alert("Upload failed")

})

}

/* ---------------- DOWNLOAD REPORT ---------------- */

function downloadReport(){

if(reportData === ""){
alert("No analysis available to download")
return
}

let blob = new Blob([reportData], {type:"text/plain"})

let link = document.createElement("a")

link.href = URL.createObjectURL(blob)
link.download = "legal_report.txt"

document.body.appendChild(link)
link.click()

}

/* ---------------- NEW CHAT ---------------- */

function newChat(){

document.getElementById("chatbox").innerHTML = ""
reportData = ""

}

/* ---------------- DARK MODE ---------------- */

function toggleTheme(){

document.body.classList.toggle("dark")

}

/* ---------------- VOICE INPUT ---------------- */

function startVoice(){

if(!('webkitSpeechRecognition' in window)){

alert("Voice recognition not supported in this browser")
return

}

let recognition = new webkitSpeechRecognition()

recognition.onresult = function(event){

document.getElementById("userInput").value =
event.results[0][0].transcript

}

recognition.start()

}
function showChat(){

document.getElementById("chatbox").style.display = "block"

}

function showReports(){

if(reportData === ""){

alert("No report available yet")
return

}

let chat = document.getElementById("chatbox")

chat.innerHTML = `
<div class="bot summary">Analysis Report</div>
<div class="bot">${reportData.replace(/\n/g,"<br>")}</div>
`

}

function newChat(){

document.getElementById("chatbox").innerHTML = ""
reportData = ""

}