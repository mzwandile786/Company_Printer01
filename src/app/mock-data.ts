export const MOCK_PRINTERS = [
  { 
    EngenPrintersID: 1, 
    PrinterName: 'Reception_LaserJet', 
    PrinterMakeName: 'HP', 
    PrinterMakeID: 1,
    FolderToMonitor: 'C:/Printers/Inbound', 
    OutputType: 'PDF',
    FileOutput: 'C:/Printers/Out',
    Active: true,
    CreatedTimeStamp: '2026-03-24' 
  },
  { 
    EngenPrintersID: 2, 
    PrinterName: 'HR_Scanner_Main', 
    PrinterMakeName: 'Canon', 
    PrinterMakeID: 2,
    FolderToMonitor: 'C:/Scans/HR', 
    OutputType: 'JPG',
    FileOutput: 'C:/Scans/Processed',
    Active: false,
    CreatedTimeStamp: '2026-03-24' 
  },

    { 
    EngenPrintersID: 3, 
    PrinterName: 'HR_Scanner_Main', 
    PrinterMakeName: 'Canon', 
    PrinterMakeID: 2,
    FolderToMonitor: 'C:/Scans/HR', 
    OutputType: 'JPG',
    FileOutput: 'C:/Scans/Processed',
    Active: false,
    CreatedTimeStamp: '2026-03-24' 
  }
];

// Add this section below your printers
export const MOCK_PRINTER_MAKES = [
  { printerMakeID: 1, printerMakeName: 'HP' },
  { printerMakeID: 2, printerMakeName: 'Canon' },
  { printerMakeID: 3, printerMakeName: 'Epson' },
  { printerMakeID: 4, printerMakeName: 'Zebra' },
  { printerMakeID: 5, printerMakeName: 'Brother' }
];


export const MOCK_DESIGNATIONS = [
  { DesignationID: 1, DesignationName: 'Senior Software Engineer' },
  { DesignationID: 2, DesignationName: 'IT Support Technician' },
  { DesignationID: 3, DesignationName: 'Office Administrator' },
  { DesignationID: 4, DesignationName: 'Hardware Specialist' }
];


// src/app/mock-data.ts
export const MOCK_USERS = [
  { 
    UserID: 101, 
    FirstName: 'Admin', 
    LastName: 'User', 
    Email: 'admin@company.com', 
    UserName: 'admin', 
    Password: 'password123', 
    DesignationID: 1, 
    DesignationName: 'System Administrator' 
  },
  { 
    UserID: 102, 
    FirstName: 'John', 
    LastName: 'Doe', 
    Email: 'john@company.com', 
    UserName: 'jdoe', 
    Password: 'password456', 
    DesignationID: 2, 
    DesignationName: 'Software Developer' 
  }
];