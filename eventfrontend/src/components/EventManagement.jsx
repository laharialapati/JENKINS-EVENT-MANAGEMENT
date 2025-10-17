// src/components/EventManagement.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "./config.js"; // Make sure path is correct
import "./style.css";

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [event, setEvent] = useState({ id: "", name: "", date: "", location: "", organizer: "" });
  const [idToFetch, setIdToFetch] = useState("");
  const [fetchedEvent, setFetchedEvent] = useState(null);
  const [message, setMessage] = useState("");
  const [editMode, setEditMode] = useState(false);

  const baseUrl = `${config.url}/eventapi`; // Base URL for API

  // --- API FUNCTIONS ---
  const fetchAllEvents = async () => {
    try {
      const response = await axios.get(`${baseUrl}/all`);
      setEvents(response.data);
    } catch (err) {
      console.error("Error fetching events:", err);
      setMessage("Failed to fetch events. Check backend URL.");
    }
  };

  const addEventApi = async (event) => await axios.post(`${baseUrl}/add`, event);
  const updateEventApi = async (event) => await axios.put(`${baseUrl}/update`, event);
  const deleteEventApi = async (id) => await axios.delete(`${baseUrl}/delete/${id}`);
  const fetchEventByIdApi = async (id) => await axios.get(`${baseUrl}/get/${id}`);

  // --- LOAD EVENTS ON PAGE LOAD ---
  useEffect(() => { fetchAllEvents(); }, []);

  // --- HANDLERS ---
  const handleChange = (e) => setEvent({ ...event, [e.target.name]: e.target.value });

  const validateForm = () => {
    for (let key in event) {
      if (!event[key] || event[key].toString().trim() === "") {
        setMessage(`Please fill out the ${key} field.`);
        return false;
      }
    }
    return true;
  };

  const handleAddEvent = async () => {
    if (!validateForm()) return;
    try {
      await addEventApi(event);
      setMessage("Event added successfully.");
      fetchAllEvents();
      resetForm();
    } catch {
      setMessage("Error adding event.");
    }
  };

  const handleUpdateEvent = async () => {
    if (!validateForm()) return;
    try {
      await updateEventApi(event);
      setMessage("Event updated successfully.");
      fetchAllEvents();
      resetForm();
    } catch {
      setMessage("Error updating event.");
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await deleteEventApi(id);
      setMessage("Event deleted successfully.");
      fetchAllEvents();
    } catch {
      setMessage("Error deleting event.");
    }
  };

  const handleFetchById = async () => {
    if (!idToFetch) {
      setMessage("Enter an event ID to fetch.");
      return;
    }
    try {
      const response = await fetchEventByIdApi(idToFetch);
      setFetchedEvent(response.data);
      setMessage("");
    } catch {
      setFetchedEvent(null);
      setMessage("Event not found.");
    }
  };

  const handleEdit = (e) => {
    setEvent(e);
    setEditMode(true);
    setMessage(`Editing event with ID ${e.id}`);
  };

  const resetForm = () => {
    setEvent({ id: "", name: "", date: "", location: "", organizer: "" });
    setEditMode(false);
  };

  // --- RENDER ---
  return (
    <div className="event-container">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-title">EVENT MANAGEMENT</div>
      </nav>

      {message && (
        <div className={`message-banner ${message.toLowerCase().includes("error") ? "error" : "success"}`}>
          {message}
        </div>
      )}

      <h2>Manage Your Events</h2>

      {/* Add / Edit Event Form */}
      <div>
        <h3>{editMode ? "Edit Event" : "Add Event"}</h3>
        <div className="form-grid">
          <input type="number" name="id" placeholder="ID" value={event.id} onChange={handleChange} />
          <input type="text" name="name" placeholder="Event Name" value={event.name} onChange={handleChange} />
          <input type="date" name="date" placeholder="Date" value={event.date} onChange={handleChange} />
          <input type="text" name="location" placeholder="Location" value={event.location} onChange={handleChange} />
          <input type="text" name="organizer" placeholder="Organizer" value={event.organizer} onChange={handleChange} />
        </div>

        <div className="btn-group">
          {!editMode ? (
            <button className="btn-blue" onClick={handleAddEvent}>Add Event</button>
          ) : (
            <>
              <button className="btn-green" onClick={handleUpdateEvent}>Update Event</button>
              <button className="btn-gray" onClick={resetForm}>Cancel</button>
            </>
          )}
        </div>
      </div>

      {/* Fetch Event By ID */}
      <div>
        <h3>Get Event By ID</h3>
        <input type="number" value={idToFetch} onChange={(e) => setIdToFetch(e.target.value)} placeholder="Enter ID" />
        <button className="btn-blue" onClick={handleFetchById}>Fetch</button>
        {fetchedEvent && (
          <div>
            <h4>Event Found:</h4>
            <pre>{JSON.stringify(fetchedEvent, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* All Events Table */}
      <div>
        <h3>All Events</h3>
        {events.length === 0 ? (
          <p>No events found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {Object.keys(event).map((key) => <th key={key}>{key}</th>)}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id}>
                    {Object.keys(event).map((key) => <td key={key}>{e[key]}</td>)}
                    <td>
                      <div className="action-buttons">
                        <button className="btn-green" onClick={() => handleEdit(e)}>Edit</button>
                        <button className="btn-red" onClick={() => handleDeleteEvent(e.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default EventManagement;
