
const API_BASE_URL = 'http://localhost:5000/api';

export const getSensorStatuses = async () => {
    const response = await fetch(`${API_BASE_URL}/sensors/statuses`);

    if (!response.ok) {
        throw new Error('Failed to fetch sensor statuses');
    }

    const result = await response.json();

    if (!result.success) {
        throw new Error(result.message || 'Failed to fetch sensor statuses');
    }

    return result.data;
};