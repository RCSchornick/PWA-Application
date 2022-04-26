let db;
const request = indexedDB.open("budget_tracker", 1);

request.onupgradeneeded = (event) => {
    event.target.result.createObjectStore("pending", 
    { autoIncrement: true});
};

request.onsuccess = (event) => {
    db = event.target.result;

    if (navigator.onLine) {
        uploadDatabase();
    }
};

request.onerror = (event) => {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction([pending], "rewrite");
    const storeData = transaction.createObjectStore("pending");
    storeData.add(record);
}

function uploadDatabase() {
    const transaction = db.transaction([pending], 'rewrite');
    const storeData = transaction.createObjectStore("pending");
    const getAll = storeData.getAll();

    getAll.onsuccess =  (event) => {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                  }
            }).then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction([pending], 'rewrite');
                const storeData = transaction.createObjectStore("pending");
                storeData.clear();
                })
        .catch(err => {
            console.log(err);
        });
    }
};
};
window.addEventListener('online', uploadDatabase);