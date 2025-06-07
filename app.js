document.addEventListener("DOMContentLoaded", () => {


  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  window.uploadPDF = async function () {
    const fileInput = document.getElementById("pdfFile");
    const file = fileInput.files[0];
    const btn = document.getElementById("uploadBtn");
    const loading = document.getElementById("loading");
    const success = document.getElementById("success");
    const linkWrapper = document.getElementById("linkWrapper");
    const qrDiv = document.getElementById("qr");

    if (!file) {
      alert("Please select a PDF file.");
      return;
    }


    qrDiv.innerHTML = "";
    success.classList.add("hidden");
    linkWrapper.classList.add("hidden");
    loading.classList.remove("hidden");
    btn.disabled = true;
    btn.textContent = "Uploading...";

    const fileName = `${Date.now()}_${file.name}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      alert("Upload failed: " + error.message);
      btn.disabled = false;
      btn.textContent = "Generate QR Code";
      loading.classList.add("hidden");
      return;
    }

    const { data: publicUrlObj } = supabase
      .storage
      .from(BUCKET)
      .getPublicUrl(fileName);

    const publicUrl = publicUrlObj.publicUrl;

    success.classList.remove("hidden");
    loading.classList.add("hidden");
    btn.disabled = false;
    btn.textContent = "Generate QR Code";

    // Shows public link
    document.getElementById("publicLink").value = publicUrl;
    linkWrapper.classList.remove("hidden");

    // Generate QR
    QRCode.toCanvas(publicUrl, (err, canvas) => {
      if (err) {
        alert("QR generation failed.");
        return;
      }
      qrDiv.appendChild(canvas);
      canvas.scrollIntoView({ behavior: "smooth" });
    });
  };

  window.copyLink = function () {
    const input = document.getElementById("publicLink");
    input.select();
    document.execCommand("copy");
    alert("Link copied to clipboard!");
  };

  function showFileName() {
  const input = document.getElementById("pdfFile");
  const fileNameText = document.getElementById("fileNameDisplay");
  fileNameText.textContent = input.files.length > 0 ? input.files[0].name : "No file selected";
}


document.getElementById("pdfFile").addEventListener("change", showFileName);


});