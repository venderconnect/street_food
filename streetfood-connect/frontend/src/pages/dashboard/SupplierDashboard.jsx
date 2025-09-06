import { useDashboardRevenue } from '../../api/hooks';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function SupplierDashboard() {
  const { data: revenue = [] } = useDashboardRevenue();
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold">Revenue Over Time</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={revenue}>
            <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2}/>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3"/>
            <XAxis dataKey="period"/>
            <YAxis/>
            <Tooltip/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
