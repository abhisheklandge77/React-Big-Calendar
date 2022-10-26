import React, { useEffect, useState } from "react";
import moment from "moment/moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import Modal from '@mui/material/Modal';
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import './App.css';

function App() {
  const DeagDropCalendar = withDragAndDrop(Calendar);
  const defaultEvents = [
    {
      id: 1,
      title: "Test event 1",
      start: new Date(2022, 9, 26),
      end: new Date(2022, 9, 29),
    },
    {
      id: 2,
      title: "Test event 2",
      start: new Date(2022, 9, 2),
      end: new Date(2022, 9, 3),
    },
    {
      id: 3,
      title: "Test event 3",
      start: new Date(2022, 10, 5),
      end: new Date(2022, 10, 5),
    },
    {
      id: 4,
      title: "Test event 4",
      start: new Date(2022, 10, 20),
      end: new Date(2022, 10, 21),
    },
  ];
  const [events, setEvents] = useState(defaultEvents);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedEvent, setSelectedEvent] = useState();
  const [openModal, setOpenModal] = useState(false);
  const [showDeleteBtn, setShowDeleteBtn] = useState(false);

  const localizer = momentLocalizer(moment);

  useEffect(() => {
    const eventsList = JSON.parse(sessionStorage.getItem("events"));
    if (eventsList) {
      setEvents(eventsList);
    }

    return () => sessionStorage.removeItem("events");
  }, []);

  const clearAllFormFields = () => {
    setTitle("");
    setStartDate("");
    setEndDate("");
    setShowDeleteBtn(false);
  }

  const onEventResize = (data) => {
    const { event, start, end } = data;
    setEvents((prevEvents) => {
      const filtered = prevEvents.filter((e) => e.id !== event.id);
      sessionStorage.setItem("events", JSON.stringify([...filtered, { ...event, start, end }]));
      return [...filtered, { ...event, start, end }];
    });
  };

  const onEventDrop = ({ event, start, end }) => {
    setEvents((prevEvents) => {
      const filtered = prevEvents.filter((e) => e.id !== event.id);
      sessionStorage.setItem("events", JSON.stringify([...filtered, { ...event, start, end }]));
      return [...filtered, { ...event, start, end }];
    });
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    const startMonth = event.start.getMonth() + 1 < 10 ? `0${event.start.getMonth() + 1}` : event.start.getMonth() + 1;
    const startDt = event.start.getDate() + 1 < 10 ? `0${event.start.getDate()}` : event.start.getDate();

    const endMonth = event.end.getMonth() + 1 < 10 ? `0${event.end.getMonth() + 1}` : event.end.getMonth() + 1;
    const endDt = event.end.getDate() + 1 < 10 ? `0${event.end.getDate()}` : event.end.getDate();

    setStartDate(`${event.start.getFullYear()}-${startMonth}-${startDt}`);
    setEndDate(`${event.end.getFullYear()}-${endMonth}-${endDt}`);
    setTitle(event.title);
    setOpenModal(true);
    setShowDeleteBtn(true);
  }

  const handleSelectSlot = ({ start, end }) => {
    const startMonth = start.getMonth() + 1 < 10 ? `0${start.getMonth() + 1}` : start.getMonth() + 1;
    const startDt = start.getDate() + 1 < 10 ? `0${start.getDate()}` : start.getDate();

    const endMonth = end.getMonth() + 1 < 10 ? `0${end.getMonth() + 1}` : end.getMonth() + 1;
    const endDt = end.getDate() + 1 < 10 ? `0${end.getDate()}` : end.getDate();

    setStartDate(`${start.getFullYear()}-${startMonth}-${startDt}`);
    setEndDate(`${end.getFullYear()}-${endMonth}-${endDt}`);
    setOpenModal(true);
  }

  const handleSubmitEvent = () => {
    if (selectedEvent) {
      setEvents((prevEvents) => {
        const index = prevEvents.findIndex((e) => e.id === selectedEvent.id);
        prevEvents[index].title = title;
        prevEvents[index].start = new Date(startDate);
        prevEvents[index].end = new Date(endDate);
        sessionStorage.setItem("events", JSON.stringify([...prevEvents]));
        return [...prevEvents];
      });
    } else {
      if (!title || !startDate || !endDate) {
        alert("All fields are required !");
        return;
      }
      const newEvent = {
        id: Math.floor(Math.random() * 100000),
        title: title,
        start: new Date(startDate),
        end: new Date(endDate),
      };
      setEvents((prevEvents) => {
        sessionStorage.setItem("events", JSON.stringify([...prevEvents, newEvent]));
        return [...prevEvents, newEvent];
      });
    }
    setOpenModal(false);
    clearAllFormFields();
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      if (window.confirm(`Are you sure you want to delete '${selectedEvent.title}'`)) {
        setEvents((prevEvents) => {
          const filtered = prevEvents.filter((e) => e.id !== selectedEvent.id);
          sessionStorage.setItem("events", JSON.stringify([...filtered]));
          return [...filtered];
        });
        setOpenModal(false);
        clearAllFormFields();
      }
    }
  }

  return (
    <div className="App">
      <div className="app-header">
        <h1>React Big Calendar</h1>
        <button onClick={() => setOpenModal(true)}>Create Event</button>
      </div>
      <DeagDropCalendar
        events={events}
        localizer={localizer}
        startAccessor="start"
        endAccessor="end"
        onEventDrop={onEventDrop}
        onEventResize={onEventResize}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        resizable
        style={{ height: "500px", width: "90%", margin: "0 auto" }}
      />

      <Modal open={openModal}>
        <div className="event-form">
          <div className="event-form-header">
            <h2>Add Event</h2>
            <div className="close-btn" onClick={() => {
              setOpenModal(false);
              clearAllFormFields();
            }}>&#10006;</div>
          </div>
          <label htmlFor="title">Title</label>
          <input name="title" value={title} onChange={(e) => setTitle(e.target.value)} />

          <label htmlFor="start-date">Start Date</label>
          <input name="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

          <label htmlFor="end-date">End Date</label>
          <input name="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

          <button className="submit-btn" onClick={() => handleSubmitEvent()}>{showDeleteBtn ? "Edit" : "Submit"}</button>

          {
            showDeleteBtn && <button className="delete-btn" onClick={() => handleDeleteEvent()}>Delete</button>
          }
        </div>
      </Modal>
    </div>
  );
}

export default App;
