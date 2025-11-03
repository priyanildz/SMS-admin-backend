const mongoose = require("mongoose");

const StaffAttendanceSchema = new mongoose.Schema(
    {
        staffid: {
            type: String,
            required: true,
            trim: true,
            // Links this record to the Staff document via their unique staffid (e.g., '5000')
        },
        date: {
            type: Date,
            required: true,
            // Stores the date normalized to midnight (as seen in your controller logic)
        },
        status: {
            type: String,
            required: true,
            enum: ['Present', 'Leave', 'Holiday'], // Define valid status values
            default: 'Absent',
        },
        checkInTime: {
            type: String, // Store time as a string (e.g., "08:30 AM")
            default: null,
        },
        checkOutTime: {
            type: String, // Store time as a string (e.g., "04:30 PM")
            default: null,
        },
    },
    { timestamps: true }
);

// CRITICAL: Ensure a staff member only has one attendance record per day.
StaffAttendanceSchema.index({ staffid: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("StaffAttendance", StaffAttendanceSchema);