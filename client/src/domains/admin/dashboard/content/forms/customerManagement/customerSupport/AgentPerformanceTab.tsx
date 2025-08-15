
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SupportAgent, SupportAnalytics } from './types';
import { Clock, CheckCircle, Star, Activity } from 'lucide-react';

interface AgentPerformanceTabProps {
  agents: SupportAgent[];
  analytics: SupportAnalytics;
}

export const AgentPerformanceTab: React.FC<AgentPerformanceTabProps> = ({
  agents,
  analytics
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'away': return 'bg-orange-100 text-orange-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Agent Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={analytics.agentPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="agent" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tickets" fill="#3B82F6" name="Total Tickets" />
              <Bar dataKey="resolved" fill="#10B981" name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Agent Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Activity className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{agents.length}</div>
            <div className="text-sm text-gray-500">Total Agents</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {agents.filter(a => a.status === 'online').length}
            </div>
            <div className="text-sm text-gray-500">Online Now</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Clock className="h-8 w-8 text-purple-500 mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {(agents.reduce((sum, agent) => sum + agent.avgResponseTime, 0) / agents.length).toFixed(1)}m
            </div>
            <div className="text-sm text-gray-500">Avg Response Time</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Star className="h-8 w-8 text-yellow-500 mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {(agents.reduce((sum, agent) => sum + agent.rating, 0) / agents.length).toFixed(1)}
            </div>
            <div className="text-sm text-gray-500">Avg Rating</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Agent Table */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Active/Max Tickets</TableHead>
                <TableHead>Total Resolved</TableHead>
                <TableHead>Avg Response Time</TableHead>
                <TableHead>Avg Resolution Time</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Languages</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={agent.avatar} alt={agent.name} />
                        <AvatarFallback>{agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-sm text-gray-500">{agent.department}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(agent.status)}>
                      {agent.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">{agent.activeTickets}/{agent.maxTickets}</div>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(agent.activeTickets / agent.maxTickets) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{agent.totalResolved.toLocaleString()}</TableCell>
                  <TableCell>{agent.avgResponseTime}m</TableCell>
                  <TableCell>{agent.avgResolutionTime}m</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span>{agent.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {agent.skills.slice(0, 2).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {agent.skills.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{agent.skills.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {agent.languages.join(', ')}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
