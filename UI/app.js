let base64Image = "";

const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");

const uploadPrompt = document.getElementById("uploadPrompt");
const imagePreviewContainer = document.getElementById("imagePreviewContainer");
const imgPreview = document.getElementById("imgPreview");

const classifyBtn = document.getElementById("classifyBtn");
const removeImage = document.getElementById("removeImage");

const resultContainer = document.getElementById("resultContainer");
const resultText = document.getElementById("resultText");

const confidenceContainer = document.getElementById("confidenceContainer");
const confidenceFill = document.getElementById("confidenceFill");
const confidenceValue = document.getElementById("confidenceValue");

const IDLE_BUTTON_HTML = '<span class="btn-label">Identify player</span>';


// =========================================================
// NAVIGATION
// =========================================================

function scrollToSection(sectionId) {

    const section = document.getElementById(sectionId);

    if (section) {
        section.scrollIntoView({
            behavior: "smooth"
        });
    }
}


function toggleMenu() {

    const nav = document.querySelector(".nav-links");

    nav.classList.toggle("mobile-open");
}


// Close mobile menu after clicking a link

document.querySelectorAll(".nav-links a").forEach(link => {

    link.addEventListener("click", () => {

        document
            .querySelector(".nav-links")
            .classList.remove("mobile-open");

    });

});


// =========================================================
// FILE UPLOAD
// =========================================================

fileInput.addEventListener("change", function (event) {

    const file = event.target.files[0];

    if (file) {
        processImage(file);
    }

});


dropZone.addEventListener("click", function (event) {

    if (
        event.target === removeImage ||
        event.target.closest("#removeImage")
    ) {
        return;
    }

    fileInput.click();

});


// =========================================================
// DRAG & DROP
// =========================================================

dropZone.addEventListener("dragover", function (event) {

    event.preventDefault();

    dropZone.classList.add("dragging");

});


dropZone.addEventListener("dragleave", function () {

    dropZone.classList.remove("dragging");

});


dropZone.addEventListener("drop", function (event) {

    event.preventDefault();

    dropZone.classList.remove("dragging");

    const file = event.dataTransfer.files[0];

    if (file && file.type.startsWith("image/")) {

        processImage(file);

    }

});


// =========================================================
// PROCESS IMAGE
// =========================================================

function processImage(file) {

    if (!file.type.startsWith("image/")) {

        alert("Please select an image file.");

        return;
    }


    const reader = new FileReader();


    reader.onload = function (event) {

        base64Image = event.target.result;

        imgPreview.src = base64Image;

        uploadPrompt.style.display = "none";

        imagePreviewContainer.style.display = "block";

        classifyBtn.style.display = "flex";

        resultContainer.style.display = "none";

        confidenceFill.style.width = "0%";

        confidenceValue.innerText = "--";

    };


    reader.readAsDataURL(file);
}


// =========================================================
// REMOVE IMAGE
// =========================================================

removeImage.addEventListener("click", function (event) {

    event.stopPropagation();

    resetUploader();

});


function resetUploader() {

    base64Image = "";

    fileInput.value = "";

    imgPreview.src = "";

    uploadPrompt.style.display = "block";

    imagePreviewContainer.style.display = "none";

    classifyBtn.style.display = "none";

    resultContainer.style.display = "none";

    confidenceFill.style.width = "0%";

    confidenceValue.innerText = "--";

    dropZone.classList.remove("scanning");
}


// =========================================================
// CLASSIFY IMAGE
// =========================================================

classifyBtn.addEventListener("click", function (event) {

    event.stopPropagation();

    if (!base64Image) {
        return;
    }


    classifyBtn.disabled = true;

    classifyBtn.innerHTML =
        '<span class="spinner"></span><span class="btn-label">Analyzing face…</span>';

    dropZone.classList.add("scanning");


    const url = "http://127.0.0.1:5000/classify_image";


    const formData = new FormData();

    formData.append("image_data", base64Image);


    fetch(url, {

        method: "POST",

        body: formData

    })

    .then(response => {

        if (!response.ok) {
            throw new Error("Server returned an error.");
        }

        return response.json();

    })

    .then(data => {

        classifyBtn.disabled = false;

        classifyBtn.innerHTML = IDLE_BUTTON_HTML;

        dropZone.classList.remove("scanning");


        if (data && data.length > 0) {

            const match = data[0];


            // Player name

            let playerName =
                match.class || "Unknown Player";


            playerName =
                playerName
                    .replaceAll("_", " ")
                    .replace(/\b\w/g, char => char.toUpperCase());


            resultText.innerText = playerName;


            // Confidence

            if (match.confidence !== undefined) {

                let confidence =
                    parseFloat(match.confidence);


                if (confidence <= 1) {
                    confidence *= 100;
                }


                confidence =
                    Math.max(0, Math.min(100, confidence));


                confidenceValue.innerText =
                    confidence.toFixed(1) + "%";


                confidenceFill.style.width =
                    confidence + "%";


                confidenceContainer.style.display =
                    "block";

            } else {

                confidenceContainer.style.display =
                    "none";

            }


        } else {

            resultText.innerText =
                "Face not detected";


            confidenceContainer.style.display =
                "none";

        }


        resultContainer.style.display = "block";


        resultContainer.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

    })


    .catch(error => {

        console.error("Error:", error);


        classifyBtn.disabled = false;

        classifyBtn.innerHTML = IDLE_BUTTON_HTML;

        dropZone.classList.remove("scanning");


        alert(
            "Error connecting to server. Make sure Flask server is running."
        );

    });

});


// =========================================================
// ROSTER — CURSOR-FOLLOWING PREVIEW
// =========================================================

const rosterList = document.getElementById("rosterList");
const rosterPreview = document.getElementById("rosterPreview");
const previewNumber = document.getElementById("previewNumber");
const previewFlag = document.getElementById("previewFlag");
const previewTag = document.getElementById("previewTag");

if (rosterList && rosterPreview) {

    const rosterRows = rosterList.querySelectorAll(".roster-row");

    rosterRows.forEach(row => {

        row.addEventListener("mouseenter", function () {

            previewNumber.innerText = "#" + row.dataset.number;
            previewFlag.innerText = row.dataset.flag;
            previewTag.innerText = row.dataset.tag;

            rosterPreview.classList.add("active");

        });

        row.addEventListener("mousemove", function (event) {

            rosterPreview.style.left = event.clientX + "px";
            rosterPreview.style.top = event.clientY + "px";

        });

        row.addEventListener("mouseleave", function () {

            rosterPreview.classList.remove("active");

        });

    });

}