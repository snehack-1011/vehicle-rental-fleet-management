import React, {
    useEffect,
    useMemo,
    useState
} from "react";
import { useNavigate } from "react-router-dom";
import { fetchVehicles } from "../../../services/api";
import "./BrowseVehicles.css";

const BrowseVehicles = () => {
    const navigate = useNavigate();

    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [location, setLocation] = useState("");
    const [vehicleType, setVehicleType] = useState("ALL");
    const [maxPrice, setMaxPrice] = useState(10000);
    const [sortBy, setSortBy] = useState("price");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        const loadVehicles = async () => {
            setLoading(true);

            const data = await fetchVehicles({
                location,
                type: vehicleType,
                startDate,
                endDate
            });

            setVehicles(data);
            setLoading(false);
        };

        loadVehicles();
    }, [location, vehicleType, startDate, endDate]);

    const filteredVehicles = useMemo(() => {
        let result = vehicles.filter((vehicle) => {
            const searchValue = searchTerm.trim().toLowerCase();

            const searchMatch =
                searchValue === "" ||
                vehicle.model.toLowerCase().includes(searchValue) ||
                vehicle.id.toLowerCase().includes(searchValue) ||
                vehicle.type.toLowerCase().includes(searchValue);

            const locationMatch =
                location.trim() === "" ||
                vehicle.location.toLowerCase().includes(location.toLowerCase());

            const typeMatch =
                vehicleType === "ALL" || vehicle.type === vehicleType;

            const priceMatch = vehicle.pricePerDay <= Number(maxPrice);

            const availableMatch = vehicle.status === "AVAILABLE";

            return (
                searchMatch &&
                locationMatch &&
                typeMatch &&
                priceMatch &&
                availableMatch
            );
        });

        result = [...result].sort((a, b) => {
            if (sortBy === "price") {
                return a.pricePerDay - b.pricePerDay;
            }

            if (sortBy === "rating") {
                return b.rating - a.rating;
            }

            if (sortBy === "distance") {
                return a.distanceKm - b.distanceKm;
            }

            return 0;
        });

        return result;
    }, [vehicles, searchTerm, location, vehicleType, maxPrice, sortBy]);

    const handleReserve = (vehicle) => {
        if (!startDate || !endDate) {
            alert("Please select both pick-up and return dates before reserving.");
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            alert("Return date cannot be before pick-up date.");
            return;
        }

        if (vehicle.status !== "AVAILABLE") {
            alert("This vehicle is currently not available.");
            return;
        }

        navigate("/booking", {
            state: {
                vehicle,
                searchDates: {
                    startDate,
                    endDate
                }
            }
        });
    };

    return (
        <div className="browse-page">
            <section className="browse-hero">
                <div className="browse-hero-content">
                    <span className="browse-badge">Vehicle Rental Platform</span>

                    <h1>
                        Find the right vehicle for
                        <span> every journey.</span>
                    </h1>

                    <p>
                        Search, compare and reserve available vehicles with flexible
                        rental options.
                    </p>
                </div>
            </section>

            <section className="search-panel">
                <div className="search-field search-field-wide">
                    <label>Search Vehicles</label>
                    <input
                        type="text"
                        placeholder="Search by vehicle name, model or ID"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="search-field">
                    <label>Location</label>
                    <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    >
                        <option value="">All Cities</option>
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="Hyderabad">Hyderabad</option>
                    </select>

                </div>

                <div className="search-field">
                    <label>Pick-up Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>

                <div className="search-field">
                    <label>Return Date</label>
                    <input
                        type="date"
                        value={endDate}
                        min={startDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>

                <div className="search-field">
                    <label>Vehicle Type</label>
                    <select
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                    >
                        <option value="ALL">All Types</option>
                        <option value="HATCHBACK">Hatchback</option>
                        <option value="SEDAN">Sedan</option>
                        <option value="SUV">SUV</option>
                        <option value="LUXURY">Luxury</option>
                        <option value="ELECTRIC">Electric</option>
                    </select>
                </div>
            </section>

            <main className="vehicle-content">
                <div className="vehicle-toolbar">
                    <div>
                        <p className="toolbar-label">Available Vehicles</p>
                        <h2>
                            {filteredVehicles.length} vehicle
                            {filteredVehicles.length !== 1 ? "s" : ""} found
                        </h2>
                    </div>

                    <div className="toolbar-controls">
                        <div className="price-control">
                            <label>Max ₹{Number(maxPrice).toLocaleString("en-IN")}/day</label>
                            <input
                                type="range"
                                min="1000"
                                max="10000"
                                step="500"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>

                        <select
                            className="sort-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="price">Price: Low to High</option>
                            <option value="rating">Highest Rated</option>
                            <option value="distance">Nearest First</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="empty-state">
                        <h3>Loading vehicles...</h3>
                        <p>Please wait while we check the available fleet.</p>
                    </div>
                ) : filteredVehicles.length === 0 ? (
                    <div className="empty-state">
                        <h3>No vehicles found</h3>
                        <p>Try changing the location, vehicle type or price range.</p>
                    </div>
                ) : (
                    <div className="vehicle-grid">
                        {filteredVehicles.map((vehicle) => (
                            <article className="vehicle-card" key={vehicle.id}>
                                <div className="vehicle-image-wrapper">
                                    <img
                                        src={vehicle.image}
                                        alt={vehicle.model}
                                        className="vehicle-image"
                                    />

                                    <span className="vehicle-status">
                                        {vehicle.status}
                                    </span>
                                </div>

                                <div className="vehicle-card-body">
                                    <div className="vehicle-title-row">
                                        <div>
                                            <span className="vehicle-id">{vehicle.id}</span>
                                            <h3>{vehicle.model}</h3>
                                        </div>

                                        <span className="vehicle-rating">
                                            ★ {vehicle.rating}
                                        </span>
                                    </div>

                                    <p className="vehicle-meta">
                                        {vehicle.type} • {vehicle.fuelType} •{" "}
                                        {vehicle.transmission}
                                    </p>

                                    <div className="vehicle-info-grid">
                                        <div>
                                            <span>Location</span>
                                            <strong>{vehicle.location}</strong>
                                        </div>

                                        <div>
                                            <span>Seats</span>
                                            <strong>{vehicle.seats}</strong>
                                        </div>

                                        <div>
                                            <span>Condition</span>
                                            <strong>{vehicle.condition}</strong>
                                        </div>

                                        <div>
                                            <span>Distance</span>
                                            <strong>{vehicle.distanceKm} km</strong>
                                        </div>
                                    </div>

                                    <div className="vehicle-card-footer">
                                        <div>
                                            <span className="price-label">Starting from</span>

                                            <div className="vehicle-price">
                                                ₹{vehicle.pricePerDay.toLocaleString("en-IN")}
                                                <span>/day</span>
                                            </div>
                                        </div>

                                        <div className="vehicle-card-actions">
                                            <button
                                                className="details-button"
                                                onClick={() =>
                                                    navigate("/vehicle-details", {
                                                        state: {
                                                            vehicle,
                                                            searchDates: {
                                                                startDate,
                                                                endDate
                                                            }
                                                        }
                                                    })
                                                }
                                            >
                                                View Details
                                            </button>

                                            <button
                                                className="reserve-button"
                                                onClick={() => handleReserve(vehicle)}
                                                disabled={vehicle.status !== "AVAILABLE"}
                                            >
                                                {vehicle.status === "AVAILABLE"
                                                    ? "Reserve"
                                                    : "Unavailable"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default BrowseVehicles;