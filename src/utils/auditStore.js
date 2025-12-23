const auditAlerts = new Map(); // event_id -> [alerts]
const MAX_ALERTS = 5;

const addAlert = (eventId, deviceHash) => {
    if (!auditAlerts.has(eventId)) {
        auditAlerts.set(eventId, []);
    }

    const alerts = auditAlerts.get(eventId);
    const partialHash = deviceHash.slice(-4).toUpperCase();

    const newAlert = {
        scan_time: new Date(), // using scan_time to match frontend expectations if any, or just timestamp
        device_id: partialHash,
        type: 'BLOCKED_PROXY'
    };

    alerts.unshift(newAlert);

    // Keep only last 5
    if (alerts.length > MAX_ALERTS) {
        alerts.pop();
    }
};

const getAlerts = (eventId) => {
    return auditAlerts.get(eventId) || [];
};

module.exports = {
    addAlert,
    getAlerts
};
