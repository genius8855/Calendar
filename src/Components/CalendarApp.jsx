import React, { useState, useEffect } from "react";
import { getEvents, addEvent, editEvent, deleteEvent } from "../services/Api.js";
import './CalendarApp.css';

const CalendarApp = () => {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthsOfYear = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventTime, setEventTime] = useState({ hours: "00", minutes: "00" });
  const [eventText, setEventText] = useState("");
  const [editingEvent, setEditingEvent] = useState(null);
  const [notification, setNotification] = useState("");
  const [showEventList, setShowEventList] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [currentMonth, currentYear]);

  const loadEvents = async () => {
    try {
      const response = await getEvents();
      setEvents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching events:", error);
      setNotification("Error fetching events. Please try again.");
    }
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const prevMonth = () => {
    setCurrentMonth((prevMonth) => (prevMonth === 0 ? 11 : prevMonth - 1));
    setCurrentYear((prevYear) => (currentMonth === 0 ? prevYear - 1 : prevYear));
  };

  const nextMonth = () => {
    setCurrentMonth((prevMonth) => (prevMonth === 11 ? 0 : prevMonth + 1));
    setCurrentYear((prevYear) => (currentMonth === 11 ? prevYear + 1 : prevYear));
  };

  const handleDayClick = (day) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    const today = new Date();

    if (clickedDate >= today || isSameDay(clickedDate, today)) {
      setSelectedDate(clickedDate);
      setShowEventPopup(true);
      setEventTime({ hours: "00", minutes: "00" });
      setEventText("");
      setEditingEvent(null);
    }
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const handleEventSubmit = async () => {
    const newEvent = {
      id: editingEvent ? editingEvent.id : Date.now(),
      date: selectedDate.toISOString().split('T')[0],
      time: `${eventTime.hours.padStart(2, "0")}:${eventTime.minutes.padStart(2, "0")}`,
      text: eventText,
    };

    try {
      if (editingEvent) {
        await editEvent(editingEvent.id, newEvent);
        const updatedEvents = events.map((event) =>
          event.id === editingEvent.id ? newEvent : event
        );
        setEvents(updatedEvents);
        setNotification("Event updated successfully!");
      } else {
        await addEvent(newEvent);
        setEvents((prevEvents) => [...prevEvents, newEvent]);
        setNotification("Event added successfully!");
      }
      resetEventForm();
    } catch (error) {
      console.error("Error saving event:", error);
      setNotification("Error saving event. Please try again.");
    }
  };

  const resetEventForm = () => {
    setEventTime({ hours: "00", minutes: "00" });
    setEventText("");
    setShowEventPopup(false);
    setEditingEvent(null);
  };

  const handleEditEvent = (event) => {
    setSelectedDate(new Date(event.date));
    setEventTime({
      hours: event.time.split(":")[0],
      minutes: event.time.split(":")[1],
    });
    setEventText(event.text);
    setEditingEvent(event);
    setShowEventPopup(true);
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteEvent(eventId);
      const updatedEvents = events.filter((event) => event.id !== eventId);
      setEvents(updatedEvents);
      setNotification("Event deleted successfully!");
    } catch (error) {
      console.error("Error deleting event:", error);
      setNotification("Error deleting event. Please try again.");
    }
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setEventTime((prevTime) => ({
      ...prevTime,
      [name]: value.padStart(2, "0"),
    }));
  };

  return (
    <div className="calendar-app">
      <div className="calendar">
        <h1 style={{ fontFamily: "cursive", fontSize: "large", fontWeight: "bold" }} className="heading">Calendar</h1>
        {notification && <div className="notification">{notification}</div>}
        <div className="navigate-date">
          <h2 className="month">{monthsOfYear[currentMonth]},</h2>
          <h2 className="year">{currentYear}</h2>
          <div className="buttons">
            <button onClick={prevMonth} aria-label="Previous Month">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-left-fill" viewBox="0 0 16 16">
                <path d="m3.86 8.753 5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z" />
              </svg>
            </button>
            <button onClick={nextMonth} aria-label="Next Month">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-right-fill" viewBox="0 0 16 16">
                <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="weekdays">
          {daysOfWeek.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="days">
          {[...Array(firstDayOfMonth).keys()].map((_, index) => (
            <span key={`empty-${index}`} />
          ))}

          {/* Render days of the month */}
          {[...Array(daysInMonth).keys()].map((day) => {
            const currentDay = new Date(currentYear, currentMonth, day + 1);
            const today = new Date();

            const isActive = events.some((event) =>
              isSameDay(new Date(event.date), currentDay)
            );

            // Check if the day is today
            const isToday =
              currentDay.getDate() === today.getDate() &&
              currentDay.getMonth() === today.getMonth() &&
              currentDay.getFullYear() === today.getFullYear();

            return (
              <span
                key={day + 1}
                className={`day ${isActive ? "active" : ""} ${isToday ? "today" : ""}`}
                onClick={() => handleDayClick(day + 1)}
              >
                {day + 1}
              </span>
            );
          })}
        </div>

      </div>
      {showEventPopup && (
        <div className="event-popup">
          <div className="time-input">
            <div className="event-popup-time">Time</div>
            <input
              type="number"
              name="hours"
              min={0}
              max={23}
              value={eventTime.hours}
              onChange={handleTimeChange}
              placeholder="HH"
              aria-label="Hours"
            />
            <span>:</span>
            <input
              type="number"
              name="minutes"
              min={0}
              max={59}
              value={eventTime.minutes}
              onChange={handleTimeChange}
              placeholder="MM"
              aria-label="Minutes"
            />
          </div>
          <textarea
            placeholder="Enter Event Text"
            value={eventText}
            onChange={(e) => {
              if (e.target.value.length <= 60) {
                setEventText(e.target.value);
              }
            }}
            maxLength={60}
            aria-label="Event Text"
          />
          <button className="event-popup-btn" onClick={handleEventSubmit}>
            {editingEvent ? "Update Event" : "Add Event"}
          </button>
          {editingEvent && (
            <button
              onClick={() => handleDeleteEvent(editingEvent.id)}
              className="delete-button"
            >
              Delete Event
            </button>
          )}
          <button
            className="close-event-popup"
            onClick={resetEventForm}
          >
            Close
          </button>
        </div>
      )}
      <button
        className="event-list-button"
        onClick={() => setShowEventList((prev) => !prev)}
      >
        {showEventList ? "Hide Event List" : "Show Event List"}
      </button>
      {showEventList && (
        <div className="event-list">
          <h3>Events:</h3>
          {events.length > 0 ? (
            events.map((event) => (
              <div key={event.id} className="event-item">
                <div className="event-info">
                  <span className="event-date">{new Date(event.date).toLocaleDateString()}</span>
                  <span className="event-time">{event.time}</span>
                  <span className="event-text">{event.text}</span>
                </div>
                <div className="event-actions">
                  <button className="edit-button" onClick={() => handleEditEvent(event)}>
                    Edit
                  </button>
                  <button className="delete-button" onClick={() => handleDeleteEvent(event.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-events">No events for this month.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarApp;
