
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { Plus, Edit, Trash2, Gift, Target, Users, DollarSign } from 'lucide-react';
import { RevenueSharingService } from '@/shared/services/database/revenue/RevenueSharingService';
import { useToast } from '@/shared/ui/use-toast';

interface IncentiveProgram {
  id: string;
  program_name: string;
  program_type: string;
  description?: string;
  eligibility_criteria: any;
  reward_structure: any;
  budget_allocation?: number;
  start_date: string;
  end_date?: string;
  target_metrics: any;
  participation_count: number;
  total_rewards_paid: number;
  is_active: boolean;
  created_at: string;
}

export const IncentiveProgramsTab: React.FC = () => {
  const [programs, setPrograms] = useState<IncentiveProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<IncentiveProgram | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    program_name: '',
    program_type: 'volume_bonus',
    description: '',
    eligibility_criteria: '{}',
    reward_structure: '{}',
    budget_allocation: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    target_metrics: '{}'
  });

  const { toast } = useToast();

  useEffect(() => {
    loadIncentivePrograms();
  }, []);

  const loadIncentivePrograms = async () => {
    try {
      setLoading(true);
      const data = await RevenueSharingService.getIncentivePrograms();
      setPrograms(data);
    } catch (error) {
      console.error('Failed to load incentive programs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load incentive programs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const programData = {
        ...formData,
        budget_allocation: formData.budget_allocation ? Number(formData.budget_allocation) : null,
        eligibility_criteria: JSON.parse(formData.eligibility_criteria || '{}'),
        reward_structure: JSON.parse(formData.reward_structure || '{}'),
        target_metrics: JSON.parse(formData.target_metrics || '{}'),
        created_by: '00000000-0000-0000-0000-000000000000' // Replace with actual user ID
      };

      if (selectedProgram) {
        await RevenueSharingService.updateIncentiveProgram(selectedProgram.id, programData);
        toast({
          title: 'Success',
          description: 'Incentive program updated successfully'
        });
      } else {
        await RevenueSharingService.createIncentiveProgram(programData);
        toast({
          title: 'Success',
          description: 'Incentive program created successfully'
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadIncentivePrograms();
    } catch (error) {
      console.error('Failed to save incentive program:', error);
      toast({
        title: 'Error',
        description: 'Failed to save incentive program',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (program: IncentiveProgram) => {
    setSelectedProgram(program);
    setFormData({
      program_name: program.program_name,
      program_type: program.program_type,
      description: program.description || '',
      eligibility_criteria: JSON.stringify(program.eligibility_criteria, null, 2),
      reward_structure: JSON.stringify(program.reward_structure, null, 2),
      budget_allocation: program.budget_allocation?.toString() || '',
      start_date: program.start_date,
      end_date: program.end_date || '',
      target_metrics: JSON.stringify(program.target_metrics, null, 2)
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setSelectedProgram(null);
    setFormData({
      program_name: '',
      program_type: 'volume_bonus',
      description: '',
      eligibility_criteria: '{}',
      reward_structure: '{}',
      budget_allocation: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      target_metrics: '{}'
    });
  };

  const getProgramTypeIcon = (type: string) => {
    switch (type) {
      case 'volume_bonus': return Target;
      case 'performance_bonus': return Gift;
      case 'loyalty_reward': return Users;
      case 'milestone_reward': return DollarSign;
      default: return Gift;
    }
  };

  const getProgramTypeColor = (type: string): string => {
    switch (type) {
      case 'volume_bonus': return 'bg-blue-50 text-blue-700';
      case 'performance_bonus': return 'bg-green-50 text-green-700';
      case 'loyalty_reward': return 'bg-purple-50 text-purple-700';
      case 'milestone_reward': return 'bg-orange-50 text-orange-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const isActiveProgram = (program: IncentiveProgram): boolean => {
    const now = new Date();
    const startDate = new Date(program.start_date);
    const endDate = program.end_date ? new Date(program.end_date) : null;
    
    return program.is_active && now >= startDate && (!endDate || now <= endDate);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Incentive Programs</h3>
          <p className="text-gray-600">Manage vendor incentive programs and rewards</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              New Program
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedProgram ? 'Edit Incentive Program' : 'Create Incentive Program'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="program_name">Program Name *</Label>
                  <Input
                    id="program_name"
                    value={formData.program_name}
                    onChange={(e) => setFormData({ ...formData, program_name: e.target.value })}
                    required
                    placeholder="e.g., Q4 Sales Incentive"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="program_type">Program Type *</Label>
                  <Select value={formData.program_type} onValueChange={(value) => setFormData({ ...formData, program_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="volume_bonus">Volume Bonus</SelectItem>
                      <SelectItem value="performance_bonus">Performance Bonus</SelectItem>
                      <SelectItem value="loyalty_reward">Loyalty Reward</SelectItem>
                      <SelectItem value="milestone_reward">Milestone Reward</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the incentive program..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget_allocation">Budget Allocation (৳)</Label>
                <Input
                  id="budget_allocation"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.budget_allocation}
                  onChange={(e) => setFormData({ ...formData, budget_allocation: e.target.value })}
                  placeholder="Optional"
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="eligibility_criteria">Eligibility Criteria (JSON)</Label>
                  <Textarea
                    id="eligibility_criteria"
                    value={formData.eligibility_criteria}
                    onChange={(e) => setFormData({ ...formData, eligibility_criteria: e.target.value })}
                    placeholder='{"min_rating": 4.0, "min_orders": 100, "active_months": 6}'
                    rows={3}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reward_structure">Reward Structure (JSON)</Label>
                  <Textarea
                    id="reward_structure"
                    value={formData.reward_structure}
                    onChange={(e) => setFormData({ ...formData, reward_structure: e.target.value })}
                    placeholder='{"tiers": [{"min": 0, "max": 50000, "bonus": 1000}, {"min": 50000, "max": 100000, "bonus": 2500}]}'
                    rows={3}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_metrics">Target Metrics (JSON)</Label>
                  <Textarea
                    id="target_metrics"
                    value={formData.target_metrics}
                    onChange={(e) => setFormData({ ...formData, target_metrics: e.target.value })}
                    placeholder='{"target_revenue": 500000, "target_orders": 1000, "target_rating": 4.5}'
                    rows={3}
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedProgram ? 'Update' : 'Create'} Program
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {programs.filter(p => isActiveProgram(p)).length}
            </div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ৳{programs.reduce((sum, p) => sum + (p.budget_allocation || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Allocated funds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {programs.reduce((sum, p) => sum + p.participation_count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Enrolled vendors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rewards Paid</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ৳{programs.reduce((sum, p) => sum + p.total_rewards_paid, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total distributed</p>
          </CardContent>
        </Card>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs.map((program) => {
          const Icon = getProgramTypeIcon(program.program_type);
          const isActive = isActiveProgram(program);
          
          return (
            <Card key={program.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-sm font-medium">{program.program_name}</CardTitle>
                  </div>
                  <div className="flex space-x-1">
                    <Badge variant={isActive ? 'default' : 'secondary'}>
                      {isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge className={getProgramTypeColor(program.program_type)}>
                      {program.program_type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Budget:</span>
                  <span className="font-semibold">
                    {program.budget_allocation ? `৳${program.budget_allocation.toLocaleString()}` : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Participants:</span>
                  <span className="font-medium">{program.participation_count || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rewards Paid:</span>
                  <span className="font-medium text-green-600">
                    ৳{program.total_rewards_paid.toLocaleString()}
                  </span>
                </div>
                {program.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">{program.description}</p>
                )}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-gray-400">
                    {new Date(program.start_date).toLocaleDateString()} - 
                    {program.end_date ? new Date(program.end_date).toLocaleDateString() : 'Ongoing'}
                  </span>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(program)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {programs.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Incentive Programs Found</h3>
            <p className="text-gray-500 mb-4">Create your first incentive program to motivate vendors.</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Program
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
