// Function to Export all localStorage data to a JSON file
function exportFinancialData() {
    const backupData = {};
    const keysToBackup = ['investmentData', 'expenseData', 'incomeData', 'accountsData']; 
    
    keysToBackup.forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
            backupData[key] = JSON.parse(item);
        }
    });

    if (Object.keys(backupData).length === 0) {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            backupData[key] = JSON.parse(localStorage.getItem(key));
        }
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `bgtf_financial_backup_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

// Function to Import data from an uploaded JSON backup file
function importFinancialData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (confirm("This will overwrite your current tracker data with the backup file. Proceed?")) {
                for (const key in importedData) {
                    localStorage.setItem(key, JSON.stringify(importedData[key]));
                }
                alert("Data successfully restored! The page will now reload.");
                location.reload();
            }
        } catch (error) {
            alert("Error reading backup file. Please ensure it is a valid JSON backup generated from bgtf.net.");
            console.error(error);
        }
    };
    reader.readAsText(file);
}