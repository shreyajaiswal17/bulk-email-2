import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Eye, 
  MousePointer, 
  AlertTriangle,
  BarChart2,
  PieChart as PieChartIcon,
  TrendingUp
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer
} from 'recharts';
import axios from 'axios'; // Import axios for making API calls

const EmailAnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState({
    emailStats: [
      { name: 'Sent', value: 0, icon: Mail },
      { name: 'Opened', value: 0, icon: Eye },
      { name: 'Clicked', value: 0, icon: MousePointer },
      { name: 'Bounced', value: 0, icon: AlertTriangle }
    ],
    timeSeriesData: [] // Initialize with empty array
  });

  // Fetch analytics data from the backend
  const fetchAnalyticsData = async () => {
    try {
      const [openRateResponse, clickRateResponse] = await Promise.all([
        axios.get('http://localhost:3000/open-rate'),
        axios.get('http://localhost:3000/click-rate'),
      ]);
  
      const openRateData = openRateResponse.data;
      const clickRateData = clickRateResponse.data;
       console.log("openRateData",openRateData)
       const filteredOpenRateData = openRateData.filter(entry => entry.email);
        const emptyOpenRateData= openRateData.filter(entry => entry.email==="");
       // Calculate total delivered and opened based on filtered data
       const totalDelivered = filteredOpenRateData.reduce((acc, curr) => acc + curr.delivered, 0);
       const totalOpened = emptyOpenRateData.reduce((acc, curr) => acc + curr.opened, 0);
       const totalClicked = clickRateData.reduce((acc, curr) => acc + curr.clicked, 0)  
      setAnalyticsData({
        emailStats: [
          { name: 'Sent', value: totalDelivered, icon: Mail },
          { name: 'Opened', value: totalOpened, icon: Eye },
          { name: 'Clicked', value: totalClicked, icon: MousePointer },
          { name: 'Bounced', value: 0, icon: AlertTriangle }, // Replace with actual bounce data if available
        ],
        timeSeriesData: [], // Adjust as needed for time-series data
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  };
  

  // Fetch analytics data on component mount
  useEffect(() => {
    fetchAnalyticsData();
    const interval = setInterval(fetchAnalyticsData, 30000); // Refresh data every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6 p-6">
      {/* Overview Cards */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart2 className="h-5 w-5" />
          Email Campaign Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {analyticsData.emailStats.map((stat, index) => (
            <div key={stat.name} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <stat.icon className="h-5 w-5 text-gray-600" />
                <h3 className="text-sm font-medium text-gray-500">{stat.name}</h3>
              </div>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {stat.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <PieChartIcon className=" h-5 w-5" />
            Email Distribution
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.emailStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analyticsData.emailStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

   

      {/* Bar Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart2 className="h-5 w-5" />
          Campaign Performance
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData.emailStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8">
                {analyticsData.emailStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
    </div>
  );
};

export default EmailAnalyticsDashboard;