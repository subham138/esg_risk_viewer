function downloadPrf(divData) {
    console.log(divData);
    var divToPrint = divData.documentElement.innerHTML; 
    $.ajax({ 
        method: "POST", 
        url: "/download_pdf", 
        data: { pdfDiv: `${divToPrint}` }, 
        xhrFields: { responseType: 'blob' }, 
        success: function (data) { 
            const pdfUrl = URL.createObjectURL(data); 
            const a = document.createElement('a'); 
            a.href = pdfUrl; 
            a.download = `Sustainability_Report_${new Date().getTime()}.pdf`; 
            a.style.display = 'none'; 
            document.body.appendChild(a); 
            a.click(); 
            document.body.removeChild(a); 
            URL.revokeObjectURL(pdfUrl); 
        }}) 
}