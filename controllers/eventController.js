// const Event = require("../models/eventsModel");
// exports.addEvent = async (req, res) => {
//   try {
//     const response = new Event(req.body);
//     await response.save();
//     return res.status(200).json({ message: "added event successfully" });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// // list of all events
// exports.getEvents = async (req, res) => {
//   try {
//     const response = await Event.find();
//     return res.status(200).json(response);
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };







import React, { useState, useEffect } from "react";
import MainLayout from "../layout/MainLayout";
import Select, { components } from "react-select";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaTimes } from "react-icons/fa";
import { API_BASE_URL } from "../config";

const CustomMultiValue = (props) => {
  if (props.selectProps.name === "participants") {
    return null;
  }
  return <components.MultiValue {...props} />;
};

const studentToSelectOption = (student) => {
  const className =
    student.standard && student.division
      ? ` (Std ${student.standard}-${student.division})`
      : "";
  return {
    value: student._id,
    label: `${student.firstname} ${student.lastname || ""}`.trim() + className,
    studentId: student._id || student.id,
    standard: student.standard,
    division: student.division,
  };
};

const fetchStudentsByMultipleClasses = async (
  selectedStandard,
  selectedDivision,
  setError,
  setLoadingStudents,
  setAllStudents,
) => {
  const standards = selectedStandard.map((s) => s.value);
  const divisions = selectedDivision.map((d) => d.value);

  if (standards.length === 0 || divisions.length === 0) {
    setAllStudents([]);
    return;
  }

  setLoadingStudents(true);
  setError("");
  let allFetchedStudents = [];

  try {
    for (const std of standards) {
      for (const div of divisions) {
        try {
          const res = await axios.post(
            `${API_BASE_URL}api/student`,
            { standard: std, division: div },
            { headers: { auth: "ZjVGZPUtYW1hX2FuZHJvaWRfMjAyMzY0MjU=" } },
          );
          allFetchedStudents = [...allFetchedStudents, ...res.data];
        } catch (err) {
          console.warn(`Failed to load students for Std ${std} Div ${div}.`);
        }
      }
    }

    const uniqueStudents = Array.from(
      new Map(allFetchedStudents.map((s) => [s._id, s])).values(),
    );

    setAllStudents(uniqueStudents);
  } catch (err) {
    setError("Failed to load students for the selected classes.");
    setAllStudents([]);
  } finally {
    setLoadingStudents(false);
  }
};

const AddEvents = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize staff state with passed data or empty array
  const [staffList, setStaffList] = useState(location.state?.staffList || []);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [selectedManager, setSelectedManager] = useState([]);
  const [selectedStandard, setSelectedStandard] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState([]);

  const [allStudents, setAllStudents] = useState([]);
  const [participantsOptions, setParticipantsOptions] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState("");

  // Fallback: Fetch staff if navigation data is empty
  useEffect(() => {
    const fetchStaffFallback = async () => {
      if (staffList.length === 0) {
        try {
          const res = await axios.get(`${API_BASE_URL}api/getstaffs`, {
            headers: { auth: "ZjVGZPUtYW1hX2FuZHJvaWRfMjAyMzY0MjU=" }
          });
          setStaffList(res.data);
        } catch (err) {
          console.error("Staff fetch failed:", err);
        }
      }
    };
    fetchStaffFallback();
  }, [staffList.length]);

  // Map staff to full names using MongoDB schema fields
  const staffOptions = staffList.map((staff) => {
    const fullName = `${staff.firstname || ""} ${staff.middlename || ""} ${staff.lastname || ""}`
      .replace(/\s+/g, ' ')
      .trim();

    return {
      value: fullName, 
      label: fullName || staff.staffid || "Unnamed Staff", 
    };
  });

  const extractValues = (selectArray) => selectArray.map((item) => item.value);

  useEffect(() => {
    fetchStudentsByMultipleClasses(
      selectedStandard,
      selectedDivision,
      setError,
      setLoadingStudents,
      setAllStudents,
    );
  }, [selectedStandard, selectedDivision]);

  useEffect(() => {
    if (allStudents.length > 0) {
      const options = allStudents.map(studentToSelectOption);
      setParticipantsOptions(options);
    } else {
      setParticipantsOptions([]);
    }

    const availableIds = new Set(allStudents.map((s) => s._id));
    setSelectedParticipants((prev) =>
      prev.filter((p) => availableIds.has(p.value)),
    );
  }, [allStudents]);

  const [eventDetails, setEventDetails] = useState({ eventName: "", date: "" });

  const handleDetailInputChange = (e) => {
    const { name, value } = e.target;
    setEventDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemoveParticipant = (participantIdToRemove) => {
    setSelectedParticipants((prevParticipants) =>
      prevParticipants.filter((p) => p.value !== participantIdToRemove),
    );
  };

  const today = new Date().toISOString().split("T")[0];

  const validateForm = () => {
    return eventDetails.eventName && eventDetails.date && selectedManager.length > 0 && eventDetails.date >= today;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const eventData = {
        eventname: eventDetails.eventName,
        date: eventDetails.date,
        managedby: extractValues(selectedManager).join(", "),
        standard: extractValues(selectedStandard).join(", "),
        division: extractValues(selectedDivision).join(", "),
        participants: extractValues(selectedParticipants),
      };

      await axios.post(
        `${API_BASE_URL}api/addevent`,
        eventData,
        { headers: { auth: "ZjVGZPUtYW1hX2FuZHJvaWRfMjAyMzY0MjU=" } },
      );

      alert("Event created successfully!");
      navigate("/events");
    } catch (err) {
      setError(err.message || "Failed to create event.");
    } finally {
      setLoading(false);
    }
  };

  const classesSelected = selectedStandard.length > 0 && selectedDivision.length > 0;
  const isParticipantsSelectable = classesSelected && participantsOptions.length > 0;

  return (
    <MainLayout>
      <div className="p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-blue-700 mb-8">Event Creation</h2>
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-1">
                Event Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="eventName"
                name="eventName"
                value={eventDetails.eventName}
                onChange={handleDetailInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={eventDetails.date}
                  onChange={handleDetailInputChange}
                  min={today}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Managed by <span className="text-red-500">*</span>
                </label>
                <Select
                  options={staffOptions}
                  isMulti
                  name="managedBy"
                  value={selectedManager}
                  onChange={setSelectedManager}
                  placeholder="Select Staff Member(s)"
                  classNamePrefix="select"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Std</label>
                <Select
                  options={[
                    { value: "Nursery", label: "Nursery" },
                    { value: "Junior", label: "Junior" },
                    { value: "Senior", label: "Senior" },
                    ...Array.from({ length: 10 }, (_, i) => ({
                      value: (i + 1).toString(),
                      label: (i + 1).toString(),
                    })),
                  ]}
                  isMulti
                  value={selectedStandard}
                  onChange={setSelectedStandard}
                  placeholder="Select Standard(s)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Div</label>
                <Select
                  options={["A", "B", "C", "D", "E"].map((div) => ({ value: div, label: div }))}
                  isMulti
                  value={selectedDivision}
                  onChange={setSelectedDivision}
                  placeholder="Select Division(s)"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Participants</label>
              <Select
                options={participantsOptions}
                isMulti
                name="participants"
                value={selectedParticipants}
                onChange={setSelectedParticipants}
                components={{ MultiValue: CustomMultiValue }}
                placeholder={classesSelected ? (loadingStudents ? "Loading..." : "Select participants") : "Select Std and Div first"}
                isDisabled={!isParticipantsSelectable}
                isLoading={loadingStudents}
              />
            </div>

            <div className="mt-6">
              <h4 className="font-semibold text-gray-700 mb-2">Selected Participants List</h4>
              <div className="space-y-2">
                {selectedParticipants.map((p) => (
                  <div key={p.value} className="flex items-center justify-between p-2 bg-white border rounded-lg shadow-sm">
                    <span className="text-gray-800">{p.label}</span>
                    <button type="button" onClick={() => handleRemoveParticipant(p.value)} className="text-red-500 hover:bg-red-100 rounded-full p-1">
                      <FaTimes className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {selectedParticipants.length === 0 && <p className="text-sm text-gray-500 text-center pt-2">No participants selected.</p>}
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button type="button" onClick={() => navigate("/events")} className="px-6 py-2 mr-4 rounded-lg border text-gray-700 hover:bg-gray-100" disabled={loading}>
                Cancel
              </button>
              <button type="submit" className={`px-6 py-2 rounded-lg text-white ${loading || !validateForm() ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`} disabled={loading || !validateForm()}>
                {loading ? "Creating..." : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default AddEvents;