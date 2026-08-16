export const overviewStats = {
  totalUsers: 128,
  totalCompanies: 9,
  totalApplications: 342,
  approvalRate: 78,
};

export const usersByCompany = [
  { label: "Apex Insurance Brokers", value: 34 },
  { label: "Shield Financial Services", value: 27 },
  { label: "Trustline Advisors", value: 21 },
  { label: "Bharat Insurance Hub", value: 18 },
  { label: "SecureNet Brokers", value: 15 },
  { label: "Prime Cover Agency", value: 13 },
].map((row) => ({ ...row, total: 128 }));

export const applicationStatus = [
  { label: "Approved", value: 214, tone: "good" },
  { label: "Pending review", value: 89, tone: "warning" },
  { label: "Rejected", value: 39, tone: "critical" },
].map((row) => ({ ...row, total: 342 }));

export const recentApplications = [
  {
    id: "APP-3021",
    applicant: "Ramesh Kannan",
    company: "Apex Insurance Brokers",
    type: "Renewal",
    insurer: "Tata AIG",
    status: "Approved",
    date: "2026-08-12",
  },
  {
    id: "APP-3020",
    applicant: "Divya Shankar",
    company: "Shield Financial Services",
    type: "New",
    insurer: "ICICI Lombard",
    status: "Pending",
    date: "2026-08-12",
  },
  {
    id: "APP-3019",
    applicant: "Arjun Mehta",
    company: "Trustline Advisors",
    type: "Renewal",
    insurer: "ACKO",
    status: "Approved",
    date: "2026-08-11",
  },
  {
    id: "APP-3018",
    applicant: "Neha Kulkarni",
    company: "Bharat Insurance Hub",
    type: "New",
    insurer: "Tata AIG",
    status: "Rejected",
    date: "2026-08-11",
  },
  {
    id: "APP-3017",
    applicant: "Suresh Iyer",
    company: "SecureNet Brokers",
    type: "Renewal",
    insurer: "ICICI Lombard",
    status: "Approved",
    date: "2026-08-10",
  },
  {
    id: "APP-3016",
    applicant: "Priya Raman",
    company: "Prime Cover Agency",
    type: "New",
    insurer: "ACKO",
    status: "Pending",
    date: "2026-08-10",
  },
];
