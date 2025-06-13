export function parseUserFriendlyDateTime(dateTime: string): Date {
  // Example dateTime: "June 15, 2025 07:30 PM"
  try {
    // Step 1: Split the date part (before the comma) and the time part (after the comma)
    const [datePart, timePart] = dateTime.split(',');  // Split at comma to separate date and time
    
    // Trim extra spaces
    const [monthName, day, year] = datePart.trim().split(' '); // Split the date part
    const [time, ampm] = timePart.trim().split(' '); // Split the time part

    // Map month names to numbers (months are 0-based in JavaScript Date)
    const monthMap: { [key: string]: number } = {
      January: 0, February: 1, March: 2, April: 3,
      May: 4, June: 5, July: 6, August: 7,
      September: 8, October: 9, November: 10, December: 11
    };

    const month = monthMap[monthName];
    const dayNum = parseInt(day, 10);
    const yearNum = parseInt(year, 10);

    // Step 2: Parse time (e.g., "07:30 PM")
    let [hours, minutes] = time.split(':').map((num) => parseInt(num, 10));

    // Convert to 24-hour format based on AM/PM
    if (ampm === 'PM' && hours !== 12) {
      hours += 12;  // Convert PM times to 24-hour format
    } else if (ampm === 'AM' && hours === 12) {
      hours = 0;  // Midnight (12:00 AM) is 0 hours
    }

    // Log parsed components to verify
    console.log(`Parsed date: ${monthName} ${dayNum}, ${yearNum}`);
    console.log(`Parsed time: ${hours}:${minutes} ${ampm}`);
    
    // Step 3: Create the Date object in UTC (Note: months are 0-based)
    const date = new Date(Date.UTC(yearNum, month, dayNum, hours, minutes, 0));

    // Log the final date
    console.log(`Final Date object: ${date}`);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      throw new Error("Invalid Date");
    }

    return date;
  } catch (error) {
    console.error("Error parsing date:", error);
    throw new Error("Invalid Date format");
  }
}
