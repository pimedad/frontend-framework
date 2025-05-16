const API_BASE_URL = 'http://localhost:8080/api/todos';

/**
 * Generic request function using fetch.
 * @param {string} url - The full URL for the request.
 * @param {object} [options={}] - Fetch options (method, headers, body, etc.).
 * @returns {Promise<any>} - Promise resolving with JSON data or null for 204.
 * @throws {Error} - Throws an error for HTTP errors (4xx, 5xx).
 */
async function request(url, options = {}) {
    try {
        const response = await fetch(url, options);

        if (response.status === 204) {
            return null;
        }

        const responseData = await response.json().catch(() => {
            if (response.ok) return { message: "Response was not valid JSON but request was successful." };
            return { message: response.statusText || "Failed to parse error response" };
        });


        if (!response.ok) {
            const errorMessage = responseData?.message || response.statusText || `HTTP error! Status: ${response.status}`;
            console.error(`HTTP Error ${response.status}: ${errorMessage}`, responseData);
            const error = new Error(errorMessage);
            error.status = response.status;
            error.data = responseData;
            throw error;
        }

        return responseData;
    } catch (error) {
        console.error("HTTP Request Failed:", error.message, error.status ? `Status: ${error.status}` : '', error.data || '');
        throw error;
    }
}

export const http = {
    /**
     * Performs a GET request.
     * @param {string} [endpoint=''] - API endpoint (e.g., '/' or '/{id}').
     * @returns {Promise<any>}
     */
    get: (endpoint = '') => request(`${API_BASE_URL}${endpoint}`),

    /**
     * Performs a POST request.
     * @param {string} [endpoint=''] - API endpoint.
     * @param {object} data - Data to send in the request body.
     * @returns {Promise<any>}
     */
    post: (endpoint = '', data) => request(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }),

    /**
     * Performs a PUT request.
     * @param {string} endpoint - API endpoint (e.g., '/{id}').
     * @param {object} data - Data to send in the request body.
     * @returns {Promise<any>}
     */
    put: (endpoint, data) => request(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }),

    /**
     * Performs a DELETE request.
     * @param {string} endpoint - API endpoint (e.g., '/{id}').
     * @returns {Promise<any>}
     */
    delete: (endpoint) => request(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
    }),
};