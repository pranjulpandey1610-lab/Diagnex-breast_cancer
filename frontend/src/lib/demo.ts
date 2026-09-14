export type DemoReport = { id: string; title: string; date: string; category: string; status: string };
export const demoReports: DemoReport[] = [
  { id: 'r1', title: 'Breast awareness summary', date: '14 Sep 2026', category: 'Self-awareness', status: 'Saved summary' },
  { id: 'r2', title: 'Breast ultrasound report', date: '02 Sep 2026', category: 'Imaging record', status: 'Report attached' },
];
export const specialists = [
  ['Dr. Maya Shah', 'Breast Surgeon', 'Harbor Women’s Clinic', '+91 22 5550 0101', 'Mumbai'],
  ['Dr. Anika Rao', 'Gynecologist', 'Bloom Health Centre', '+91 80 5550 0102', 'Bengaluru'],
  ['Dr. Priya Menon', 'Radiologist', 'Northstar Imaging', '+91 11 5550 0103', 'Delhi'],
  ['Dr. Rhea Kapoor', 'Genetic Counselor', 'Everwell Cancer Centre', '+91 44 5550 0104', 'Chennai'],
] as const;
