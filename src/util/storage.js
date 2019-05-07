export const setItem = (key, value) => {
    const object = {value, timestamp: new Date().getTime()};
    localStorage.setItem(key, JSON.stringify(object));
};

export const getItem = (key) => {
    const object = JSON.parse(localStorage.getItem(key));
    
    if (object) {
        // clear storage item if stored more than 4 hours
        const fourHoursAgo = new Date().getTime() - (4 * 60 * 60 * 1000);
        if (new Date(object.timestamp) <= fourHoursAgo) {
            clearItem(key);
            return null;
        }
    }
    return object.value;
};

export const clearItem = (key) => {
    localStorage.removeItem(key);
};