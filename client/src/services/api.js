import vehicles from "../data/vehicles";

const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

export const loginCustomer = async (credentials) => {
    const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(credentials)
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Login failed");
    }

    return result;
};

export const registerCustomer = async (customerData) => {
    const response = await fetch(
        `${API_BASE_URL}/auth/register`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(customerData)
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Registration failed");
    }

    return result;
};

export const fetchVehicles = async (filters = {}) => {
    try {
        const query = new URLSearchParams();

        if (filters.location) {
            query.append("location", filters.location);
        }

        if (filters.type && filters.type !== "ALL") {
            query.append("type", filters.type);
        }

        if (filters.startDate) {
            query.append("startDate", filters.startDate);
        }

        if (filters.endDate) {
            query.append("endDate", filters.endDate);
        }

        const response = await fetch(
            `${API_BASE_URL}/vehicles?${query.toString()}`
        );

        if (!response.ok) {
            throw new Error("Backend unavailable");
        }

        const result = await response.json();

        return Array.isArray(result) ? result : (result.data || result.vehicles || []);
    } catch (error) {
        console.log(
            "Backend not connected yet. Using temporary mock vehicle data."
        );

        return vehicles;
    }
};

const LOCAL_RESERVATIONS_KEY = "customerReservations";

export const createReservation = async (reservationData) => {
    // Read the JWT token stored by the login flow
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(
            `${API_BASE_URL}/reservations`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Send the JWT so the backend can identify the authenticated customer
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify(reservationData)
            }
        );

        if (!response.ok) {
            const errorResult = await response.json().catch(() => ({}));
            throw new Error(errorResult.message || "Backend unavailable");
        }

        return await response.json();
    } catch (error) {
        // Only fall back to localStorage if the backend is genuinely unreachable.
        // If the error is an auth failure (401), propagate it so the user is aware.
        if (error.message && (
            error.message.includes('401') ||
            error.message.toLowerCase().includes('unauthorized') ||
            error.message.toLowerCase().includes('log in')
        )) {
            throw error;
        }

        const existingReservations =
            JSON.parse(
                localStorage.getItem(LOCAL_RESERVATIONS_KEY)
            ) || [];

        const newReservation = {
            ...reservationData,
            id: `RES${Date.now()}`,
            status: "RESERVED"
        };

        const updatedReservations = [
            newReservation,
            ...existingReservations
        ];

        localStorage.setItem(
            LOCAL_RESERVATIONS_KEY,
            JSON.stringify(updatedReservations)
        );

        return {
            success: true,
            data: newReservation
        };
    }
};

export const fetchCustomerReservations = async () => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/reservations`
        );

        if (!response.ok) {
            throw new Error("Backend unavailable");
        }

        const result = await response.json();

        return result.data || [];
    } catch (error) {
        return (
            JSON.parse(
                localStorage.getItem(LOCAL_RESERVATIONS_KEY)
            ) || []
        );
    }
};

export const cancelCustomerReservation = async (reservationId) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/reservations/${reservationId}/cancel`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        if (!response.ok) {
            throw new Error("Unable to cancel reservation");
        }

        return await response.json();
    } catch (error) {
        const existingReservations =
            JSON.parse(
                localStorage.getItem(LOCAL_RESERVATIONS_KEY)
            ) || [];

        const updatedReservations = existingReservations.map(
            (reservation) =>
                reservation.id === reservationId
                    ? {
                        ...reservation,
                        status: "CANCELLED"
                    }
                    : reservation
        );

        localStorage.setItem(
            LOCAL_RESERVATIONS_KEY,
            JSON.stringify(updatedReservations)
        );

        return {
            success: true,
            data: updatedReservations
        };
    }
};

export const startCustomerRental = async (reservationId) => {
    const response = await fetch(
        `${API_BASE_URL}/rentals/start`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                reservationId
            })
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Unable to start rental");
    }

    return result;
};

export const returnCustomerRental = async (rentalId) => {
    const response = await fetch(
        `${API_BASE_URL}/rentals/${rentalId}/return`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Unable to end rental");
    }

    return result;
};

export const checkVehicleAvailability = async (
    vehicleId,
    startDate,
    endDate
) => {
    const query = new URLSearchParams({
        vehicleId,
        startDate,
        endDate
    });

    const response = await fetch(
        `${API_BASE_URL}/vehicles/availability?${query.toString()}`
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Unable to check vehicle availability"
        );
    }

    return result;
};

export const fetchVehicleById = async (vehicleId) => {
    const response = await fetch(
        `${API_BASE_URL}/vehicles/${vehicleId}`
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Unable to fetch vehicle details"
        );
    }

    return result.data;
};

// ==========================================
// FEEDBACK API
// ==========================================

export const submitFeedback = async (feedbackData) => {
    try {
        const response = await fetch(`http://localhost:5000/api/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(feedbackData),
        });
        if (!response.ok) throw new Error('Failed to submit feedback');
        return await response.json();
    } catch (error) {
        console.error("Error submitting feedback:", error);
        throw error;
    }
};

export const fetchFeedback = async () => {
    try {
        const response = await fetch(`http://localhost:5000/api/feedback`);
        if (!response.ok) throw new Error('Failed to fetch feedback');
        const data = await response.json();
        return data.feedbacks || [];
    } catch (error) {
        console.error("Error fetching feedback:", error);
        return [];
    }
};