import AdminLayout from "../../components/layout/AdminLayout";
import Card from "../../components/common/Card";
import StatCard from "../../components/common/StatCard";
import Badge from "../../components/common/Badge";
import BarList from "../../components/charts/BarList";
import { UsersIcon, BuildingIcon, FileTextIcon, CheckCircleIcon } from "../../components/common/icons";
import { overviewStats, usersByCompany, applicationStatus, recentApplications } from "../../features/admin/mockData";
import "./AdminDashboardPage.css";

const STATUS_TONE = {
  Approved: "good",
  Pending: "warning",
  Rejected: "critical",
};

export default function AdminDashboardPage() {
  return (
    <AdminLayout title="Dashboard" subtitle="Platform activity across every connected agency">
      <div className="dash-stats">
        <StatCard
          label="Total users"
          value={overviewStats.totalUsers}
          delta="8% vs last month"
          icon={<UsersIcon width={20} height={20} />}
        />
        <StatCard
          label="Companies onboarded"
          value={overviewStats.totalCompanies}
          delta="1 new this month"
          icon={<BuildingIcon width={20} height={20} />}
        />
        <StatCard
          label="Total applications"
          value={overviewStats.totalApplications}
          delta="12% vs last month"
          icon={<FileTextIcon width={20} height={20} />}
        />
        <StatCard
          label="Approval rate"
          value={`${overviewStats.approvalRate}%`}
          delta="3 pts vs last month"
          icon={<CheckCircleIcon width={20} height={20} />}
        />
      </div>

      <div className="dash-charts">
        <Card>
          <div className="dash-panel-head">
            <h3>Users by company</h3>
            <span>{overviewStats.totalUsers} agents total</span>
          </div>
          <BarList data={usersByCompany} />
        </Card>

        <Card>
          <div className="dash-panel-head">
            <h3>Application status</h3>
            <span>{overviewStats.totalApplications} applications total</span>
          </div>
          <BarList data={applicationStatus} />
        </Card>
      </div>

      <Card className="dash-table-card" padded={false}>
        <div className="dash-table-head">
          <h3>Recent applications</h3>
          <span style={{ fontSize: 13, color: "var(--color-text-subtle)" }}>Last 6 submissions</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="dash-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Applicant</th>
                <th>Type</th>
                <th>Insurer</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentApplications.map((row) => (
                <tr key={row.id}>
                  <td className="dash-table-id">{row.id}</td>
                  <td>
                    <div className="dash-table-applicant">{row.applicant}</div>
                    <div className="dash-table-company">{row.company}</div>
                  </td>
                  <td>{row.type}</td>
                  <td>{row.insurer}</td>
                  <td>
                    <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge>
                  </td>
                  <td>{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminLayout>
  );
}
