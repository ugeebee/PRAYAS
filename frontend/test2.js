const selectedApp = {
    form_data: "{\"name\":\"Utkarsh (Mock)\",\"id\":\"NHPC1001\",\"designation\":\"Engineer\",\"department\":\"Software\",\"contact\":\"9876543210\",\"email\":\"utkarsh@nhpc.com\"}"
};
let formData = {};
if (selectedApp.form_data) {
    try {
        formData = typeof selectedApp.form_data === 'string' 
            ? JSON.parse(selectedApp.form_data) 
            : selectedApp.form_data;
        if (typeof formData === 'string') {
            formData = JSON.parse(formData);
        }
    } catch (e) {
        console.error("Error parsing form_data:", e);
    }
}
console.log(formData.designation);
