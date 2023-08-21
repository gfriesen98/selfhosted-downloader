/**
 * onClick Event - GET Request for grabbing video title
 * @param {String} id \<li\> ID value
 */
async function onChangeCheckURL(id) {
    let id_num = id.replace('url-', '');
    let input = document.getElementById(`input-${id_num}`);
    let youtube_urls = [
        'https://www.youtube.com/watch?v=',
        'https://youtu.be/'
    ];
    for await (let url of youtube_urls) {
        if (input.value.startsWith(url)) {
            let spinner = document.getElementById(`spinner-${id_num}`);
            spinner.style.display = 'inline-block';

            const res = await fetch(`/api/yt/titles?url=${input.value}`,
                { method: "GET" }
            );
            let body = await res.json();
            let spanValue = body.title;

            document.getElementById(`span-${id_num}`).innerHTML = spanValue;
            document.getElementById(`metadata-title-${id_num}`).value = spanValue;
            spinner.style.display = 'none';
            writeToLocalstorage();
            break;
        }
    }
}

/**
 * onClick Event - POST Request for downloading the list
 * @param {String} id \<li\> ID value
 */
async function downloadList() {
    let listData = listToObjectArray();

    // start downloading links
    for await (let obj of listData) {
        let spinner = document.getElementById(`spinner-${obj.li_id.replace("url-", "")}`);
        spinner.style.display = 'inline-block';
        document.getElementById('status-text').innerHTML = `Downloading ${obj.metadata.title.value} from ${obj.input.value}`;

        let uri = obj.metadata.audioOnly.checked ? '/api/yt/download/audio' : '/api/yt/download/video';
        const res = await fetch(uri, {
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                urlObject: obj
            }),
            method: "POST"
        });
        spinner.style.display = 'none';
    }

    // request to prepare zip
    document.getElementById('status-text').innerHTML = `Preparing zip file`;
    const zipRes = await fetch('/api/yt/download/prepare-zip', {
        headers: {
            "Content-Type": "application/json"
        },
        method: "GET"
    });
    let body = await zipRes.json();
    let filename = body.filename;

    document.getElementById('status-text').innerHTML = `Grabbing zip`;
    await getZip(filename);

    const deleteRes = await fetch('/api/yt/delete', { method: "delete" });
    console.log(deleteRes.status);
}

async function getZip(filename) {
    try {
        document.getElementById('status-text').innerHTML = `Downloading zip... Wait a moment`;
        const response = await fetch('/api/yt/download/serve-zip');
        const reader = response.body.getReader();
        const chunks = [];
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
        }

        const blob = new Blob(chunks);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        setTimeout(() => {
            a.parentNode.removeChild(a);
        }, 100);
        document.getElementById('status-text').innerHTML = `Finished Downloading`;
    } catch (error) {
        console.error(error);
    }
}

/**
 * onClick Event - GET Request for getting video data for videos from a playlist url
 * 
 * Populates the list with playlist videos
 */
async function getPlaylistData() {
    let playlist_url = document.getElementById('playlist-input').value;
    document.getElementById('playlist-spinner').style.display = "inline-block";
    let res = await fetch(`/api/yt/playlist/data?playlistUrl=${playlist_url}`,
        { method: "GET" }
    );
    let data = await res.json();

    const list = document.getElementById('list');
    let lastIdInList = list.children[list.children.length - 1].id;
    let currentIdNumber = lastIdInList.replace(/url\-/g, "");
    if (!Number(currentIdNumber)) {
        console.error('last id in list is not a number');
        return null;
    } else {
        currentIdNumber = Number(currentIdNumber);
    }

    if (list.children[0].children[0].value !== "") {
        currentIdNumber += 1;
    }

    for (let obj of data.playlistData) {
        let metadata = {
            audioOnly: { id: `audioOnly-${currentIdNumber}`, checked: true },
            title: { id: `metadata-title-${currentIdNumber}`, value: obj.title },
            contributingArtist: { id: `metadata-contibutingartist-${currentIdNumber}`, value: "" },
            albumArtist: { id: `metadata-albumartist-${currentIdNumber}`, value: "" },
            album: { id: `metadata-album-${currentIdNumber}`, value: "" },
            year: { id: `metadata-year-${currentIdNumber}`, value: "" },
            genre: { id: `metadata-genre-${currentIdNumber}`, value: "" }
        };
        createListItem(currentIdNumber, obj.url, obj.title, metadata);
        currentIdNumber += 1;
    }
    if (list.children[0].children[0].value === "") {
        list.removeChild(list.children[0]);
    }
    writeToLocalstorage();
    document.getElementById('playlist-spinner').style.display = "none";
}

function writeToLocalstorage() {
    let objArray = listToObjectArray();
    localStorage.setItem('listdata', JSON.stringify(objArray));
}

/**
 * Writes the known list data as an array of objects
 * @returns {Array<any>}
 */
function listToObjectArray() {
    const list = document.getElementById('list');
    let lastIdInList = list.children[list.children.length - 1].id;
    let lastIdNumber = lastIdInList.replace(/url\-/g, "");
    if (!Number(lastIdNumber)) {
        console.error('Last list id is NOT a number');
        return null;
    } else {
        lastIdNumber = Number(lastIdNumber);
    }

    let objArray = [];
    // list id's start at 1 always
    for (let i = 1; i < lastIdNumber + 1; i++) {
        let li = document.getElementById(`url-${i}`);
        let input = document.getElementById(`input-${i}`);
        let span = document.getElementById(`span-${i}`);
        let title = document.getElementById(`metadata-title-${i}`);
        let contributingArtist = document.getElementById(`metadata-contributingartist-${i}`);
        let albumArtist = document.getElementById(`metadata-albumartist-${i}`);
        let album = document.getElementById(`metadata-album-${i}`);
        let year = document.getElementById(`metadata-year-${i}`);
        let genre = document.getElementById(`metadata-genre-${i}`);
        let audioOnly = document.getElementById(`audioOnly-${i}`);
        let dataObj = {
            li_id: li.id,
            input: { id: input.id, value: input.value },
            span: { id: span.id, value: span.innerHTML },
            metadata: {
                audioOnly: { id: audioOnly.id, checked: audioOnly.checked },
                title: { id: title.id, value: title.value },
                contributingArtist: { id: contributingArtist.id, value: contributingArtist.value },
                albumArtist: { id: albumArtist.id, value: albumArtist.value },
                album: { id: album.id, value: album.value },
                year: { id: year.id, value: year.value },
                genre: { id: genre.id, value: genre.value }
            }
        }

        objArray.push(dataObj);
    }
    return objArray;
}

/**
 * Creates a new list item
 * @returns {null} Returns null if an expected !Number error occurs
 */
function addToList() {
    const list = document.getElementById('list');
    let lastIdInList = list.children[list.children.length - 1].id;
    let currentIdNumber = lastIdInList.replace(/url\-/g, "");
    if (!Number(currentIdNumber)) {
        console.error('last id in list is not a number');
        return null;
    }

    let newId = Number(currentIdNumber) + 1;
    createListItem(newId);
    writeToLocalstorage();
}

/**
 * Helper function to create the metadata menu for the list item
 * @param {HTMLDivElement} metadataDiv 
 * @param {Number} id id number
 * @param {Array} metadata metadata object - if loading from localstorage
 */
function createMetadataMenu(metadataDiv, id, metadata = {}) {
    let title = document.createElement('input');
    let contributingArtist = document.createElement('input');
    let albumArtist = document.createElement('input');
    let album = document.createElement('input');
    let year = document.createElement('input');
    let genre = document.createElement('input');
    let audioOnly = document.createElement('input');
    let audioOnlySpan = document.createElement('span');
    audioOnly.setAttribute('type', 'checkbox');

    title.id = `metadata-title-${id}`;
    contributingArtist.id = `metadata-contributingartist-${id}`;
    albumArtist.id = `metadata-albumartist-${id}`;
    album.id = `metadata-album-${id}`;
    year.id = `metadata-year-${id}`;
    genre.id = `metadata-genre-${id}`;
    audioOnly.id = `audioOnly-${id}`;

    title.name = 'metadata-input';
    contributingArtist.name = 'metadata-input';
    albumArtist.name = 'metadata-input';
    album.name = 'metadata-input';
    year.name = 'metadata-input';
    genre.name = 'metadata-input';

    title.placeholder = 'title';
    contributingArtist.placeholder = 'contriburing artist artist1,artist2';
    albumArtist.placeholder = 'album artist';
    album.placeholder = 'album';
    year.placeholder = 'year';
    genre.placeholder = 'genre';
    audioOnlySpan.innerHTML = 'Audio Only?';

    audioOnly.checked = true;

    if (Object.keys(metadata).length > 0) {
        title.value = metadata.title.value;
        contributingArtist.value = metadata.contributingArtist.value;
        albumArtist.value = metadata.albumArtist.value;
        album.value = metadata.album.value;
        year.value = metadata.year.value;
        genre.value = metadata.genre.value;
        audioOnly.checked = metadata.audioOnly.checked;
        if (audioOnly.checked === false) {
            title.disabled = true;
            contributingArtist.disabled = true;
            albumArtist.disabled = true;
            album.disabled = true;
            year.disabled = true;
            genre.disabled = true;
        }
    }

    let metadataarr = [title, contributingArtist, albumArtist, album, year, genre];
    for (let elem of metadataarr) {
        elem.addEventListener('change', () => {
            writeToLocalstorage();
        });
    }

    audioOnly.addEventListener('click', () => {
        for (let input of metadataarr) {
            if (audioOnly.checked) {
                input.disabled = false;
                writeToLocalstorage();
            } else {
                input.disabled = true;
                writeToLocalstorage();
            }
        }
    });

    metadataDiv.appendChild(title);
    metadataDiv.appendChild(contributingArtist);
    metadataDiv.appendChild(albumArtist);
    metadataDiv.appendChild(album);
    metadataDiv.appendChild(year);
    metadataDiv.appendChild(genre);
    metadataDiv.appendChild(audioOnly);
    metadataDiv.appendChild(audioOnlySpan);
}

/**
 * Helper function to create the list item
 * @param {String} id \<li\> id, url-x
 * @param {String} value \<input\> value, if loading from localstorage
 * @param {String} spanValue \<span\> innerHTML value, if loading from localstorage
 */
function createListItem(id, value = "", spanValue = "", metadata = {}) {
    // declare list items
    let list = document.getElementById('list');
    let li = document.createElement('li');
    let input = document.createElement('input');
    let span = document.createElement('span');
    let checkbox = document.createElement('input');
    let checkboxSpan = document.createElement('span');
    let metadataUl = document.createElement('ul');
    let metadataDiv = document.createElement('div');
    let br = document.createElement('br');
    let buttonUp = document.createElement('button');
    let buttonDown = document.createElement('button');
    let buttonToggleMetadata = document.createElement('button');
    let spinner = document.createElement('div');

    // declare metadata items
    // name, extens etc
    createMetadataMenu(metadataDiv, id, metadata);

    // set ids
    li.id = `url-${id}`;
    span.id = `span-${id}`;
    input.id = `input-${id}`;
    metadataUl.id = `dropareaUl-${id}`;
    metadataDiv.id = `dropareaDiv-${id}`;
    buttonUp.id = `buttonUp-${id}`;
    buttonDown.id = `buttonDown-${id}`;
    buttonToggleMetadata.id = `buttonAdd-${id}`;
    spinner.id = `spinner-${id}`;
    spinner.className = 'spinner';

    // set attribute
    checkbox.setAttribute('type', 'checkbox');
    metadataUl.style.display = 'none';
    spinner.style.display = 'none';

    // events
    input.addEventListener('change', async () => {
        await onChangeCheckURL(li.id);
        buttonToggleMetadata.click();
    });

    buttonToggleMetadata.addEventListener('click', () => {
        // show metadata editor
        if (metadataUl.style.display == 'block') {
            metadataUl.style.display = 'none';
            buttonToggleMetadata.innerHTML = 'Edit Metadata';
        } else {
            metadataUl.style.display = 'block';
            buttonToggleMetadata.innerHTML = 'Hide Metadata'

        }
    });

    // values/innerhtml
    input.value = value;
    span.innerHTML = spanValue;
    checkboxSpan.innerHTML = "Edit Metadata";
    buttonUp.innerHTML = '^';
    buttonDown.innerHTML = '⌄';
    buttonToggleMetadata.innerHTML = 'Edit Metadata';

    // appending
    // layout:
    // line 1 - input, span (yt video title)
    li.appendChild(input);
    li.appendChild(spinner);
    li.appendChild(span);
    li.appendChild(br);
    // line 2 - up/down/add buttons, checkbox
    // li.appendChild(buttonUp);
    li.appendChild(buttonToggleMetadata);
    // li.appendChild(buttonDown);
    // line 3 - ul, toggled metadata div
    metadataUl.appendChild(metadataDiv);
    li.appendChild(metadataUl);
    list.appendChild(li);
}

/**
 * On load events, load from localstorage if exists
 */
window.onload = function () {
    // load list from localstorage if exists
    if (!localStorage.getItem('listdata')) {
        createListItem(1);
        writeToLocalstorage();
    } else {
        let storage = localStorage.getItem('listdata');
        let objArray = JSON.parse(storage);

        for (let obj of objArray) {
            let id = obj.li_id.replace('url-', "");
            createListItem(id, obj.input.value, obj.span.value, obj.metadata);
        }
    }
}






    // request to fetch zip
    // const res = await fetch('/api/yt/download/serve-zip', {
    //     headers: {
    //         "Content-Type": "application/json"
    //     },
    //     method: "GET"
    // });
    // const res = await fetchWithTimeout('/api/yt/download/serve-zip', {
    //     timeout: 600000,
    //     headers: {
    //         "Content-Type": "application/json"
    //     },
    //     method: "GET"
    // });
    // const blob = await res.blob();
    // const bloburl = URL.createObjectURL(blob);
    // const link = document.createElement('a');
    // link.href = bloburl;
    // link.setAttribute('download', filename);
    // document.body.appendChild(link);
    // link.click();
    // URL.revokeObjectURL(bloburl);
    // document.getElementById('status-text').innerHTML = `Downloading zip`;
    // // remove any reference to the link tag
    // setTimeout(() => {
    //     link.parentNode.removeChild(link);
    // }, 100);