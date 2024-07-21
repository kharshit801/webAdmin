import React, { useState, useCallback } from 'react';
import axios from 'axios';
import './AttendanceReport.css';

const AttendanceReport = () => {
  const [group, setGroup] = useState('');
  const [semester, setSemester] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAttendance = useCallback(async () => {
    if (group && semester) {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `https://apiemnnit.onrender.com/api/attendance/${group}/${semester}`
        );
        setAttendanceData(response.data);
      } catch (error) {
        console.error("Error fetching attendance:", error);
        setError("Failed to fetch attendance data");
        setAttendanceData([]);
      } finally {
        setLoading(false);
      }
    }
  }, [group, semester]);

  const uniqueDates = [...new Set(attendanceData.map(record => record.date))].sort();
  const uniqueStudents = [...new Set(attendanceData.map(record => record.regNo))].sort();

  const exportData = () => {
    if (attendanceData.length === 0) return;

    const csvContent = [
      ['Reg. No', 'Name', ...uniqueDates.map(date => new Date(date).toLocaleDateString())].join(','),
      ...uniqueStudents.map(regNo => {
        const student = attendanceData.find(record => record.regNo === regNo);
        const statusRow = uniqueDates.map(date => {
          const record = attendanceData.find(r => r.regNo === regNo && r.date === date);
          return record ? record.status.charAt(0).toUpperCase() : '-';
        });
        return [regNo, student.name, ...statusRow].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `attendance_report_${group}_sem${semester}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="attendance-report">
      <h2>Attendance Report</h2>
      <div className="controls">
        <select value={group} onChange={(e) => setGroup(e.target.value)}>
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
          <option value="O1">O1</option>
        </select>
        <select value={semester} onChange={(e) => setSemester(e.target.value)}>
          <option value="">Select Semester</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
        </select>
        <button onClick={fetchAttendance} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Attendance'}
        </button>
        <button onClick={exportData} disabled={!attendanceData.length}>
          Export Data
        </button>
      </div>
      
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && attendanceData.length > 0 && (
        <div className="attendance-table-container">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Reg. No</th>
                <th>Name</th>
                {uniqueDates.map(date => (
                  <th key={date}>{new Date(date).toLocaleDateString()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {uniqueStudents.map(regNo => {
                const student = attendanceData.find(record => record.regNo === regNo);
                return (
                  <tr key={regNo}>
                    <td>{regNo}</td>
                    <td>{student.name}</td>
                    {uniqueDates.map(date => {
                      const record = attendanceData.find(r => r.regNo === regNo && r.date === date);
                      return (
                        <td key={`${regNo}-${date}`} className={record?.status.toLowerCase()}>
                          {record ? record.status.charAt(0).toUpperCase() : '-'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceReport;