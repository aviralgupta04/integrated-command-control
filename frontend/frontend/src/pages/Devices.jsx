import { useEffect, useState } from "react";
import "./Devices.css";

function Devices() {

    const [showModal, setShowModal] = useState(false);

    const [devices, setDevices] = useState([]);

    const [camera, setCamera] = useState({
        name: "",
        ipAddress: "",
        port: 80,
        username: "",
        password: ""
    });


    // GET cameras from backend
    useEffect(() => {

        fetch("https://localhost:7068/api/CameraDbRegister")
            .then(response => response.json())
            .then(data => {
                setDevices(data);
            })
            .catch(error => {
                console.error("Error loading cameras:", error);
            });

    }, []);


    // Handle input changes
    const handleChange = (event) => {

        const { name, value } = event.target;

        setCamera({
            ...camera,
            [name]: value
        });

    };


    // Add camera
    const handleAddCamera = async () => {

        try {

            const response = await fetch(
                "https://localhost:7068/api/CameraDbRegister",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(camera)
                }
            );

            if (!response.ok) {

                const error = await response.text();

                console.error("Camera could not be added:", error);

                return;
            }

            const result = await response.text();

            console.log(result);

            // Close modal
            setShowModal(false);

            // Clear form
            setCamera({
                name: "",
                ipAddress: "",
                port: 80,
                username: "",
                password: ""
            });


            // Reload cameras from database
            const camerasResponse = await fetch(
                "https://localhost:7068/api/CameraDbRegister"
            );

            const cameras = await camerasResponse.json();

            setDevices(cameras);

        }
        catch (error) {

            console.error("Error adding camera:", error);

        }

    };


    return (
        <div className="devices-page">

            {/* Header */}
            <div className="devices-header">

                <div>
                    <h1>Devices</h1>
                    <p>Manage cameras connected to your system</p>
                </div>

                <button
                    className="add-device-btn"
                    onClick={() => setShowModal(true)}
                >
                    + Add Device
                </button>

            </div>


            {/* Device Table */}
            <div className="devices-container">

                <table className="devices-table">

                    <thead>

                        <tr>
                            <th>ID</th>
                            <th>Camera Name</th>
                            <th>IP Address</th>
                            <th>Port</th>
                            <th>Username</th>
                            <th>Password</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>

                    </thead>


                    <tbody>

                        {devices.map((device) => (

                            <tr key={device.id}>

                                <td>{device.id}</td>

                                <td>{device.name}</td>

                                <td>{device.ipAddress}</td>

                                <td>{device.port}</td>

                                <td>{device.username}</td>

                                <td>••••••••</td>

                                <td>

                                    <span
                                        className={
                                            device.status === "Online"
                                                ? "status online"
                                                : "status offline"
                                        }
                                    >
                                        {device.status}
                                    </span>

                                </td>

                                <td>

                                    <button className="action-btn">
                                        Edit
                                    </button>

                                    <button className="delete-btn">
                                        Delete
                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>


            {/* Add Device Modal */}

            {showModal && (

                <div className="modal-overlay">

                    <div className="add-device-modal">

                        <div className="modal-header">

                            <div>
                                <h2>Add Device</h2>
                                <p>Add camera details to your VMS</p>
                            </div>

                            <button
                                className="close-btn"
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>

                        </div>


                        {/* Camera Form */}

                        <div className="camera-form">

                            <div className="form-group">

                                <label>Camera Name</label>

                                <input
                                    type="text"
                                    name="name"
                                    value={camera.name}
                                    onChange={handleChange}
                                    placeholder="Enter camera name"
                                />

                            </div>


                            <div className="form-group">

                                <label>IP Address</label>

                                <input
                                    type="text"
                                    name="ipAddress"
                                    value={camera.ipAddress}
                                    onChange={handleChange}
                                    placeholder="192.168.0.12"
                                />

                            </div>


                            <div className="form-group">

                                <label>Port</label>

                                <input
                                    type="number"
                                    name="port"
                                    value={camera.port}
                                    onChange={handleChange}
                                />

                            </div>


                            <div className="form-group">

                                <label>Username</label>

                                <input
                                    type="text"
                                    name="username"
                                    value={camera.username}
                                    onChange={handleChange}
                                    placeholder="Enter username"
                                />

                            </div>


                            <div className="form-group">

                                <label>Password</label>

                                <input
                                    type="password"
                                    name="password"
                                    value={camera.password}
                                    onChange={handleChange}
                                    placeholder="Enter password"
                                />

                            </div>

                        </div>


                        {/* Modal Footer */}

                        <div className="modal-footer">

                            <button
                                className="cancel-btn"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>

                            <button
                                className="save-device-btn"
                                onClick={handleAddCamera}
                            >
                                Add Camera
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Devices;