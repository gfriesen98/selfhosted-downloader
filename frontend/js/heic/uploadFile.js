async function uploadHeicFile() {
    // setup body for request
    const file = document.getElementById("myfile").files[0];
    const filename = file.name;
    const quality = getRangeValueDecimal();
    const filetype = getFiletypeRadioButton();

    // formdata object
    const formData = new FormData();
    formData.append('file', file);
    formData.append('quality', quality);
    formData.append('filetype', filetype);
    // make fetch request
    document.getElementById("message").innerHTML = `Converting ${filename} to JPEG...`;
    const res = await fetch('/api/convert-heic', {
        body: formData,
        method: "post"
    });

    // catch errors from backend
    if (res.status === 200) {
        // response type will be a blob, to enforce download create and append an <a> tag and "click" it
        const blob = await res.blob();
        const bloburl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = bloburl;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(bloburl);
        document.getElementById("message").innerHTML = "Success! Your image has been converted successfully.";

        // remove any reference to the link tag
        setTimeout(() => {
            link.parentNode.removeChild(link);
        }, 100);
    } else if (res.status === 500 || res.status === 415) {
        let body = await res.json();
        document.getElementById("message").innerHTML = body.message;
    } else {
        let body = await res.json();
        document.getElementById("message").innerHTML = `Error: Unable to process request. ${body.message}`
    }
}