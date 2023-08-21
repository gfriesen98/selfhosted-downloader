(async () => {
    let res = await fetch('navbar.html');
    let oldElement = document.getElementById('replace_with_navbar');
    let newElement = document.createElement("div");
    newElement.innerHTML = await res.text();
    oldElement.parentNode.replaceChild(newElement, oldElement);
    document.getElementById('clear').addEventListener('click',
        async () => {
            try {
                await fetch('/api/deletecookie', { method: 'get' });
                localStorage.removeItem('listdata');
                window.location.reload();
            } catch (error) {
                console.error(error);
            }
        });
})();