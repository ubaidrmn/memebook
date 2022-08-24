function search() {
    const q = document.getElementById("search-bar").value
    window.location = window.location.origin + "?q=" + q
}

window.onload = () => {
    document.getElementById("search-bar").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            console.log("HEH")
            search()
        }
    });
}
