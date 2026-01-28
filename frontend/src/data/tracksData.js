export const tracks = [
  {
    id: "red-line",
    color: "#e64c3c", // Bright Red
    width: 8,
    path: `
      M 350 110 
      L 350 350
      C 350 370, 370 380, 390 380
      L 650 380
      L 650 650
    `,
  },
  {
    id: "orange-line",
    color: "#f39c12", // Orange
    width: 8,
    path: `
      M 75 490 
      L 620 490
      C 640 490, 650 500, 650 520
      L 650 760
    `,
  },
  {
    id: "dark-blue-line",
    color: "#2c3e50", // Dark Navy
    width: 8,
    path: `
      M 450 210 
      L 380 280
      L 380 440
      C 380 460, 390 470, 410 470
      L 670 470
      L 670 650
      L 750 650
      L 800 600
      L 900 600
    `,
  },
  {
    id: "teal-line-solid",
    color: "#16a085", // Solid Teal (Right side)
    width: 8,
    path: `
      M 700 100 
      L 700 550
      L 700 900
    `,
  },
  {
    id: "dashed-teal-line",
    color: "#16a085", // Teal Dashed
    width: 8,
    dashArray: "15, 10",
    path: `
      M 250 180 
      L 250 500
      L 450 750
      L 600 750
    `,
  },
  {
    id: "light-blue-dashed",
    color: "#3498db", // Light Blue Dashed (Bottom)
    width: 8,
    dashArray: "15, 10",
    path: `
      M 110 750 
      L 350 750
      L 450 650
      L 580 650
    `,
  }
];