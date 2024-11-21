class ScanningService {
    startScanning(): void {
        console.log('Sending START_SCAN message to content script');
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'START_SCAN' }, (response) => {
                    console.log('START_SCAN response:', response);
                });
            }
        });
    }

    stopScanning(): void {
        console.log('Sending STOP_SCAN message to content script');
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'STOP_SCAN' }, (response) => {
                    console.log('STOP_SCAN response:', response);
                });
            }
        });
    }

    startQuickScan(): void {
        console.log('Sending QUICK_SCAN message to content script');
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'QUICK_SCAN' }, (response) => {
                    console.log('QUICK_SCAN response:', response);
                });
            }
        });
    }
}

export const scanningService = new ScanningService();