const dropZone = document.querySelector(".drop-zone");
const input = document.querySelector("#fileInput");
const broweBtn = document.querySelector("#browerBtn");
const bgProgressBar = document.querySelector(".bg-progress");

const ProgressContainer = document.querySelector(".progress-container");
const progressbar = document.querySelector(".progress-bar");
const precentBar = document.querySelector("#percent");

const shareLinkContainer = document.querySelector(".share-link-container");
const fileUrl  = document.querySelector("#fileURL");
const copyBtn  = document.querySelector("#copyBtn");

const hostUrl = "https://innShare.herokuapp.com/";
const uploadurl = `${hostUrl}api/files`
const emailurl = `${hostUrl}api/files/send`

const emailForm = document.querySelector("#email-form");
const maxSize = 100 * 1024 * 1024;

const toast = document.querySelector(".toast");

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();

    if (!dropZone.classList.contains("dragged")) {
        dropZone.classList.add("dragged")
    }
})

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragged")
})

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files;
    if (file.length) {
        input.files = file;
        uploadFile()
    }
    dropZone.classList.remove("dragged")
})

broweBtn.addEventListener("click", () => {
    input.click();
})


const updateProgress = (e)=>{
    ProgressContainer.classList.add("show-progress-bar")

    const percent = Math.round((e.loaded / e.total) * 100);
    precentBar.innerText = percent
    bgProgressBar.style.width = `${percent}%`;
    progressbar.style.width   = `${percent}%`;
}

const uploadFile = () => {
    
    const file = input.files[0];
    const formData = new FormData();
    formData.append("myfile",file);
    
    if (input.files.length > 1) {
        input.value = ""
        showToast("Only upload one file")
    }else if(file.size > maxSize){
        input.value = ""
        showToast("Can't upload more then 100mb")
    }
    else{

        const Xhr = new XMLHttpRequest();
        Xhr.onreadystatechange = () => {
            if (Xhr.readyState == XMLHttpRequest.DONE) {
                showLink(JSON.parse(Xhr.response))
            }
        }

        Xhr.upload.onprogress = updateProgress;
        Xhr.upload.onerror = ()=> showToast(`Error in upload : ${Xhr.statusText}`)

        Xhr.open("POST", uploadurl);
        Xhr.send(formData);
    }
}

const showLink = ({file})=>{
    if (file){
        fileUrl.value = file;
        shareLinkContainer.style.display = "inherit";
        ProgressContainer.classList.remove("show-progress-bar")
        emailForm[2].removeAttribute("disabled")
        showToast("File Uploaded")
     }
}

emailForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    
    const url = (fileUrl.value);

    const formData = {
        "uuid": url.split("files/")[1],
        "emailTo" : emailForm.elements["yourEmail"]?.value,
        "emailFrom" : emailForm.elements["reciverEmail"]?.value
    }

    emailForm[2].setAttribute("disabled",true);

    fetch(emailurl,{
        method:"POST",
        headers : {
            "Content-Type":"application/json"
        },
        body: JSON.stringify(formData)

    }).then((r)=>r.json()).then((d)=>console.log(d))
})

copyBtn.addEventListener("click",()=>{
    fileUrl.select();
    document.execCommand("copy");
    showLink("link copy")
})

input.addEventListener("change",uploadFile)


const showToast = (msg)=>{
    toast.innerText = msg;
    toast.style.left = "10%";

    setTimeout(() => {
        toast.style.left = "-50%";
    }, 3000);
}