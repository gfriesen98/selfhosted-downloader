window.onload = function () {
    /* elements i want to manip */
    let slider = document.getElementById("range");
    let output = document.getElementById("output");
    let filepicker = document.getElementById("myfile");
    let submitbutton = document.getElementById("submit_button");
    let message = document.getElementById("message");

    // set submit button to disabled until a file is uploaded
    submitbutton.disabled = true;

    /* event listeners */
    // slider
    output.innerHTML = (slider.value / 10).toFixed(2);
    slider.addEventListener('input', function () {
        output.innerHTML = (slider.value / 10).toFixed(2);
    });

    // filepicker/submit button enable
    filepicker.addEventListener('change', function () {
        const files = Array.from(filepicker.files);
        const allFilesAreHeic = files.every(file => {
            return file.name.endsWith('.heic');
        });
        console.log('all files are heic? ' + allFilesAreHeic);

        if (allFilesAreHeic) {
            submitbutton.disabled = false;
        } else {
            submitbutton.disabled = true;
            message.innerHTML = `Selected files are not .heic images.`;
        }
    });
}