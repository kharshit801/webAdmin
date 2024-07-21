import React, { useState, useEffect } from 'react';
import './WeeklySchedule.css';

const WeeklySchedule = ({ group, semester, onScheduleChange, initialSchedule }) => {
  const [schedule, setSchedule] = useState({});
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = ["8:00 AM",'9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', "5:00 PM", "6:00 PM"];

  useEffect(() => {
    setSchedule(initialSchedule);
  }, [initialSchedule, group, semester]);

  const handleScheduleChange = (day, time, field, value) => {
    setSchedule(prevSchedule => {
      const newSchedule = { ...prevSchedule };
      if (!newSchedule[day]) newSchedule[day] = {};
      if (!newSchedule[day][time]) newSchedule[day][time] = {};
      
      if (field === 'duration') {
        newSchedule[day][time].duration = value;
      } else {
        newSchedule[day][time][field] = value;
      }
      
      if (value === '') {
        delete newSchedule[day][time][field];
        if (Object.keys(newSchedule[day][time]).length === 0) {
          delete newSchedule[day][time];
        }
        if (Object.keys(newSchedule[day]).length === 0) {
          delete newSchedule[day];
        }
      }
      
      onScheduleChange(newSchedule);
      return newSchedule;
    });
  };

  const extendClass = (day, time) => {
    handleScheduleChange(day, time, 'duration', (schedule[day][time].duration || 1) + 1);
  };

  return (
    <div className="weekly-schedule">
      <table>
        <thead>
          <tr>
            <th>Time</th>
            {daysOfWeek.map(day => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((time, index) => (
            <tr key={time}>
              <td>{time}</td>
              {daysOfWeek.map(day => {
                const classData = schedule[day]?.[time];
                const isExtended = classData && classData.duration > 1;
                const isHidden = index > 0 && schedule[day]?.[timeSlots[index - 1]]?.duration > 1;

                if (isHidden) return <td key={`${day}-${time}`}></td>;

                return (
                  <td key={`${day}-${time}`} className="schedule-cell">
                    <div className="class-info">
                      <input
                        type="text"
                        placeholder="Subject"
                        value={classData?.subject || ''}
                        onChange={(e) => handleScheduleChange(day, time, 'subject', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Venue"
                        value={classData?.venue || ''}
                        onChange={(e) => handleScheduleChange(day, time, 'venue', e.target.value)}
                      />
                    </div>
                    {classData && (
                      <div className="class-actions">
                        <button className="extend-button" onClick={() => extendClass(day, time)} title="Extend class duration">
                          <span className="arrow">▼</span>
                        </button>
                        {isExtended && <span className="duration">({classData.duration} hrs)</span>}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WeeklySchedule;