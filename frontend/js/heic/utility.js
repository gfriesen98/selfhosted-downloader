// get select radio value
function getFiletypeRadioButton() {
    let radios = document.getElementsByName('filetype');
    for (let radio of radios) {
        if (radio.checked) return radio.value;
    }
}

// get range slider value %
function getRangeValueDecimal() {
    return document.getElementById("range").value / 10;
}