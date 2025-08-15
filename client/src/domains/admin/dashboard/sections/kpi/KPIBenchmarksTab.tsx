
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Award } from 'lucide-react';

export const KPIBenchmarksTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Industry Benchmarks
        </CardTitle>
        <CardDescription>Compare your KPIs against industry standards</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>KPI</TableHead>
              <TableHead>Your Value</TableHead>
              <TableHead>Industry Average</TableHead>
              <TableHead>Top Quartile</TableHead>
              <TableHead>Performance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Conversion Rate</TableCell>
              <TableCell>3.8%</TableCell>
              <TableCell>3.2%</TableCell>
              <TableCell>4.8%</TableCell>
              <TableCell>
                <Badge className="bg-green-100 text-green-800">Above Average</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Customer Acquisition Cost</TableCell>
              <TableCell>BDT 450</TableCell>
              <TableCell>BDT 380</TableCell>
              <TableCell>BDT 320</TableCell>
              <TableCell>
                <Badge className="bg-red-100 text-red-800">Below Average</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Average Order Value</TableCell>
              <TableCell>BDT 1,850</TableCell>
              <TableCell>BDT 1,650</TableCell>
              <TableCell>BDT 2,200</TableCell>
              <TableCell>
                <Badge className="bg-green-100 text-green-800">Above Average</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Customer Retention Rate</TableCell>
              <TableCell>78%</TableCell>
              <TableCell>75%</TableCell>
              <TableCell>85%</TableCell>
              <TableCell>
                <Badge className="bg-green-100 text-green-800">Above Average</Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
