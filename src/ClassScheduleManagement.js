import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import io from "socket.io-client";
import WeeklySchedule from "./WeeklySchedule";
import ProfessorSchedule from "./ProfessorSchedule";

const socket = io("https://apiemnnit.onrender.com");

function ClassScheduleManagement() {
  const [group, setGroup] = useState("");
  const [semester, setSemester] = useState("");
  const [initialSchedule, setInitialSchedule] = useState({});
  const [weeklySchedule, setWeeklySchedule] = useState({});
  const [file, setFile] = useState(null);
  const [isProfessorSchedule, setIsProfessorSchedule] = useState(false);

  const fetchSchedules = useCallback(async () => {
    if (group && semester) {
      try {
        console.log("Fetching schedules for group", group, "semester", semester);
        const response = await axios.get(
          `https://apiemnnit.onrender.com/api/classSchedule/${group}/${semester}`
        );
        const formattedSchedule = formatScheduleData(response.data);
        setInitialSchedule(formattedSchedule);
        setWeeklySchedule(formattedSchedule);
      } catch (error) {
        console.error("Error fetching schedules:", error);
        setInitialSchedule({});
        setWeeklySchedule({});
      }
    }
  }, [group, semester]);

  useEffect(() => {
    fetchSchedules();

    socket.on("scheduleUpdate", ({ updatedGroup, updatedSemester }) => {
      if (updatedGroup === group && updatedSemester === semester) {
        console.log("Received real-time update. Fetching new schedule.");
        fetchSchedules();
      }
    });

    return () => {
      socket.off("scheduleUpdate");
    };
  }, [fetchSchedules, group, semester]);

  const formatScheduleData = (data) => {
    const formattedSchedule = {};
    data.forEach((item) => {
      if (!formattedSchedule[item.day]) {
        formattedSchedule[item.day] = {};
      }
      formattedSchedule[item.day][item.time] = {
        subject: item.subjectName,
        venue: item.venue,
      };
    });
    return formattedSchedule;
  };

  const handleScheduleChange = (newSchedule) => {
    setWeeklySchedule(newSchedule);
  };

  const handleGroupChange = (e) => {
    setGroup(e.target.value);
    setInitialSchedule({});
    setWeeklySchedule({});
  };

  const handleSemesterChange = (e) => {
    setSemester(e.target.value);
    setInitialSchedule({});
    setWeeklySchedule({});
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("group", group);
    formData.append("semester", semester);
    
    const formattedSchedule = Object.entries(weeklySchedule).flatMap(([day, times]) =>
      Object.entries(times).map(([startTime, data]) => ({
        day,
        startTime,
        duration: data.duration || 1,
        subject: data.subject,
        venue: data.venue
      }))
    );
    
    formData.append("weeklySchedule", JSON.stringify(formattedSchedule));
    
    if (file) {
      formData.append("file", file);
    }
    
    try {
      await axios.post(
        "https://apiemnnit.onrender.com/api/upload-weekly-schedule",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      alert("Weekly schedule uploaded successfully!");
      // Emit the update event locally
      socket.emit('scheduleUpdate', { group, semester });
    } catch (error) {
      console.error("Error uploading schedule:", error);
      alert("Failed to upload schedule: " + error.message);
    }
  };

  return (
    <div className="class-schedule-management">
      <h2>Class Schedule Management</h2>
      <div className="controls">
        <select
          className="schedule-type-select"
          onChange={(e) =>
            setIsProfessorSchedule(e.target.value === "professor")
          }
        >
          <option value="student">Student Schedule</option>
          <option value="professor">Professor Schedule</option>
        </select>

        {isProfessorSchedule ? (
          <ProfessorSchedule />
        ) : (
          <>
            <select value={group} onChange={handleGroupChange}>
              <option value="">Select Group</option>
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
              <option value="C1">C1</option>
              <option value="C2">C2</option>
              <option value="D1">D1</option>
              <option value="D2">D2</option>
              <option value="E1">E1</option>
              <option value="E2">E2</option>
              <option value="F1">F1</option>
              <option value="F2">F2</option>
              <option value="G1">G1</option>
              <option value="G2">G2</option>
              <option value="H1">H1</option>
              <option value="H2">H2</option>
              <option value="I1">I1</option>
              <option value="J1">J1</option>
              <option value="K1">K1</option>
              <option value="L1">L1</option>
              <option value="M1">M1</option>
              <option value="N1">N1</option>
              <option value="N2">N2</option>
              <option value="O1">O1</option>            </select>
            <select value={semester} onChange={handleSemesterChange}>
              <option value="">Select Semester</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option> 
              <option value="4">4</option>{" "}
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>            </select>
          </>
        )}
      </div>

      {!isProfessorSchedule && (
        <section className="schedule-form">
          <WeeklySchedule
            group={group}
            semester={semester}
            onScheduleChange={handleScheduleChange}
            initialSchedule={initialSchedule}
          />
          <form onSubmit={handleSubmit}>
            <div className="form-actions">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".csv,.json"
              />
              <button type="submit" className="primary-button">
                Upload Weekly Schedule
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}

export default ClassScheduleManagement;