import React, { useState, useCallback, useMemo } from 'react';
import axios from 'axios';

const ProfessorSchedule = () => {
  const [professorId, setProfessorId] = useState('');
  const [schedule, setSchedule] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

  const initializeSchedule = useMemo(() => {
    const initialSchedule = {};
    days.forEach(day => {
      initialSchedule[day] = {};
      timeSlots.forEach(time => {
        initialSchedule[day][time] = {
          subjectName: '',
          group: '',
          semester: '',
          venue: '',
        };
      });
    });
    return initialSchedule;
  }, []);

  const formatScheduleData = useCallback((data) => {
    const formattedSchedule = initializeSchedule;
    data.forEach((item) => {
      if (formattedSchedule[item.day] && timeSlots.includes(item.time)) {
        formattedSchedule[item.day][item.time] = {
          subjectName: item.subjectName,
          group: item.group,
          semester: item.semester,
          venue: item.venue,
        };
      }
    });
    return formattedSchedule;
  }, [initializeSchedule]);

  const fetchProfessorSchedule = useCallback(async () => {
    if (professorId) {
      setLoading(true);
      try {
        const response = await axios.get(`https://apiemnnit.onrender.com/api/professorSchedule/${professorId}`);
        const formattedSchedule = formatScheduleData(response.data);
        setSchedule(formattedSchedule);
      } catch (error) {
        console.error('Error fetching professor schedule:', error);
        setSchedule(initializeSchedule);
      } finally {
        setLoading(false);
      }
    }
  }, [professorId, formatScheduleData, initializeSchedule]);

  const handleCellChange = useCallback((day, time, field, value) => {
    setSchedule(prevSchedule => ({
      ...prevSchedule,
      [day]: {
        ...prevSchedule[day],
        [time]: {
          ...prevSchedule[day][time],
          [field]: value
        }
      }
    }));
  }, []);

  const handleSubmit = async () => {
    const classesToUpload = [];
    Object.entries(schedule).forEach(([day, times]) => {
      Object.entries(times).forEach(([time, classInfo]) => {
        if (classInfo.subjectName || classInfo.group || classInfo.semester || classInfo.venue) {
          classesToUpload.push({
            professorId,
            day,
            time,
            ...classInfo
          });
        }
      });
    });

    try {
      await axios.post(`https://apiemnnit.onrender.com/api/professorSchedule/${professorId}/bulk`, classesToUpload);
      alert('Schedule updated successfully!');
      setEditMode(false);
    } catch (error) {
      console.error('Error updating professor schedule:', error);
      alert('Failed to update schedule. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      
      
      <div style={styles.searchContainer}>
        <input 
          type="text" 
          value={professorId} 
          onChange={(e) => setProfessorId(e.target.value)}
          placeholder="Enter Professor ID"
          style={styles.input}
        />
        <button onClick={fetchProfessorSchedule} disabled={loading} style={styles.button}>
          {loading ? 'Loading...' : 'Search'}
        </button>
      </div>
      
      {Object.keys(schedule).length > 0 && (
        <div style={styles.scheduleContainer}>
          <h3 style={styles.title}>Schedule for Professor ID: {professorId}</h3>
          <div style={styles.buttonContainer}>
            <button onClick={() => setEditMode(!editMode)} style={editMode ? styles.cancelButton : styles.editButton}>
              {editMode ? 'Cancel Editing' : 'Edit Schedule'}
            </button>
            {editMode && <button onClick={handleSubmit} style={styles.saveButton}>Save Changes</button>}
          </div>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Time</th>
                  {days.map(day => <th key={day} style={styles.th}>{day}</th>)}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(time => (
                  <tr key={time}>
                    <td style={styles.tdTime}>{time}</td>
                    {days.map(day => {
                      const classInfo = schedule[day]?.[time] || { subjectName: '', group: '', semester: '', venue: '' };
                      return (
                        <td key={`${day}-${time}`} style={styles.td}>
                          {editMode ? (
                            <div>
                              <input
                                value={classInfo.subjectName}
                                onChange={(e) => handleCellChange(day, time, 'subjectName', e.target.value)}
                                placeholder="Subject"
                                style={styles.cellInput}
                              />
                              <input
                                value={classInfo.group}
                                onChange={(e) => handleCellChange(day, time, 'group', e.target.value)}
                                placeholder="Group"
                                style={styles.cellInput}
                              />
                              <input
                                value={classInfo.semester}
                                onChange={(e) => handleCellChange(day, time, 'semester', e.target.value)}
                                placeholder="Semester"
                                style={styles.cellInput}
                              />
                              <input
                                value={classInfo.venue}
                                onChange={(e) => handleCellChange(day, time, 'venue', e.target.value)}
                                placeholder="Venue"
                                style={styles.cellInput}
                              />
                            </div>
                          ) : (
                            classInfo.subjectName || classInfo.group || classInfo.semester || classInfo.venue ? (
                              <>
                                <div style={styles.cellContent}>{classInfo.subjectName}</div>
                                <div style={styles.cellContent}>{classInfo.group} - {classInfo.semester}</div>
                                <div style={styles.cellContent}>{classInfo.venue}</div>
                              </>
                            ) : null
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  mainTitle: {
    fontSize: '28px',
    color: '#1a237e',
    textAlign: 'center',
    marginBottom: '10px',
  },
  subTitle: {
    fontSize: '22px',
    color: '#3f51b5',
    textAlign: 'center',
    marginBottom: '30px',
  },
  searchContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '30px',
  },
  input: {
    padding: '12px',
    fontSize: '16px',
    marginRight: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '250px',
  },
  button: {
    padding: '12px 24px',
    fontSize: '16px',
    backgroundColor: '#3f51b5',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  scheduleContainer: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '24px',
    color: '#1a237e',
    marginBottom: '20px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '20px',
  },
  editButton: {
    padding: '10px 20px',
    fontSize: '14px',
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: '10px',
  },
  cancelButton: {
    padding: '10px 20px',
    fontSize: '14px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: '10px',
  },
  saveButton: {
    padding: '10px 20px',
    fontSize: '14px',
    backgroundColor: '#2196f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: '10px',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0',
  },
  th: {
    backgroundColor: '#3f51b5',
    color: 'white',
    border: '1px solid #ddd',
    padding: '12px',
    textAlign: 'left',
    fontSize: '14px',
  },
  td: {
    border: '1px solid #ddd',
    padding: '12px',
    fontSize: '14px',
    verticalAlign: 'top',
  },
  tdTime: {
    border: '1px solid #ddd',
    padding: '12px',
    fontSize: '14px',
    fontWeight: 'bold',
    backgroundColor: '#e8eaf6',
  },
  cellInput: {
    width: '100%',
    padding: '6px',
    marginBottom: '5px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  cellContent: {
    marginBottom: '5px',
  },
};

export default ProfessorSchedule;