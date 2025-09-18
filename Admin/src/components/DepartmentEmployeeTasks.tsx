import { useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Textarea } from "./ui/textarea";

interface EmployeeTask {
  id: string;
  title: string;
  department: string;
  status?: "pending" | "approved" | "in-progress" | "resolved" | "dropped" | "pending-request";
  priority: "low" | "medium" | "high";
  notes?: string;
}

interface DepartmentEmployeeTasksProps {
  userDepartment: string;
  userName: string;
}

const mockTasks: EmployeeTask[] = [
  { id: "JT-3001", title: "Survey pothole on Main St", department: "Public Works", status: "pending", priority: "high" },
  { id: "JT-3002", title: "Meet contractor about sidewalk fix", department: "Public Works", status: "in-progress", priority: "medium" },
  { id: "JT-3020", title: "Inspect storm drain on Maple Ave", department: "Water Department", status: "pending", priority: "medium" },
];

export function DepartmentEmployeeTasks({ userDepartment, userName }: DepartmentEmployeeTasksProps) {
  const [tasks, setTasks] = useState<EmployeeTask[]>(mockTasks);
  const [filter, setFilter] = useState<string>("all");
  const [myJobsStatus, setMyJobsStatus] = useState<"all" | "pending" | "in-progress" | "resolved">("pending");
  const [denyOpen, setDenyOpen] = useState<boolean>(false);
  const [denyReason, setDenyReason] = useState<string>("");
  const [denyTaskId, setDenyTaskId] = useState<string | null>(null);

  const deptTasks = useMemo(() => tasks.filter(t => t.department === userDepartment), [tasks, userDepartment]);
  const filtered = deptTasks.filter(t => filter === "all" || t.status === filter);

  const updateTaskStatus = (taskId: string, status: EmployeeTask["status"]) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  };
  const updateTaskNotes = (taskId: string, notes: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, notes } : t));
  };
  const [reassignOpen, setReassignOpen] = useState<boolean>(false);
  const [reassignTaskId, setReassignTaskId] = useState<string | null>(null);

  const openReassign = (taskId: string) => {
    setReassignTaskId(taskId);
    setReassignOpen(true);
  };
  const confirmReassign = () => {
    if (!reassignTaskId) return;
    setTasks(prev => prev.map(t => t.id === reassignTaskId ? { ...t, status: "pending-request" } : t));
    setReassignOpen(false);
    setReassignTaskId(null);
  };

  const openDeny = (taskId: string) => {
    setDenyTaskId(taskId);
    setDenyReason("");
    setDenyOpen(true);
  };
  const confirmDeny = () => {
    if (!denyTaskId) return;
    setTasks(prev => prev.map(t => t.id === denyTaskId ? { ...t, status: "dropped", notes: denyReason.trim() } : t));
    setDenyOpen(false);
    setDenyTaskId(null);
    setDenyReason("");
  };

  return (
    <div className="space-y-6">
      <div className="mb-4 px-6">
        <h1 className="text-2xl font-semibold">My Tasks</h1>
      </div>

      <Card className="p-6">
        <div className="mb-2">
          <h2 className="text-xl font-semibold">Pending Job Requests</h2>
          <p className="text-muted-foreground">Job requests from HOD for {userName} - {userDepartment}</p>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">Showing {filtered.length} of {deptTasks.length} tasks</div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Task ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="w-52">Update Status</TableHead>
                <TableHead className="w-44">Status</TableHead>
                <TableHead className="w-[260px]">Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(task => (
                <TableRow key={task.id} className="h-14">
                  <TableCell className="font-medium">{task.id}</TableCell>
                  <TableCell>{task.title}</TableCell>
                  <TableCell className="capitalize">{task.priority}</TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" variant="outline" onClick={() => updateTaskStatus(task.id, "approved")}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => openDeny(task.id)}>Deny</Button>
                    <Button size="sm" variant="outline" onClick={() => openReassign(task.id)}>Request Reassign</Button>
                  </TableCell>
                  <TableCell>
                    <Select value={task.status} onValueChange={(v) => updateTaskStatus(task.id, v as EmployeeTask["status"])}>
                      <SelectTrigger className="w-44">
                        <SelectValue placeholder="Update" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="dropped">Denied</SelectItem>
                        <SelectItem value="pending-request">Pending Request</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {task.notes ? task.notes : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={denyOpen} onOpenChange={setDenyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny Task</DialogTitle>
            <DialogDescription>Please provide a reason for denial.</DialogDescription>
          </DialogHeader>
          <Textarea placeholder="Type your reason..." value={denyReason} onChange={(e) => setDenyReason(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDenyOpen(false)}>Cancel</Button>
            <Button onClick={confirmDeny} disabled={denyReason.trim().length === 0}>Confirm Deny</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reassignOpen} onOpenChange={setReassignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Reassign</DialogTitle>
            <DialogDescription>
              Are you sure you want to request reassignment? The task will be marked as Pending Request.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReassignOpen(false)}>Cancel</Button>
            <Button onClick={confirmReassign}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="p-6 mt-6">
        <div className="mb-2">
          <h2 className="text-xl font-semibold">My Jobs</h2>
          <p className="text-muted-foreground">View your tasks by current status</p>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">Showing {deptTasks.filter(t => myJobsStatus === "all" ? true : t.status === myJobsStatus).length} job(s)</div>
          <Select value={myJobsStatus} onValueChange={(v) => setMyJobsStatus(v as typeof myJobsStatus)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Task ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="w-44">Status</TableHead>
                <TableHead className="w-[260px]">Update Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deptTasks.filter(t => myJobsStatus === "all" ? true : t.status === myJobsStatus).map(task => (
                <TableRow key={`jobs-${task.id}`} className="h-14">
                  <TableCell className="font-medium">{task.id}</TableCell>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>
                    <Select value={task.status} onValueChange={(v) => updateTaskStatus(task.id, v as EmployeeTask["status"])}>
                      <SelectTrigger className="w-44">
                        <SelectValue placeholder="Update" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="dropped">Denied</SelectItem>
                        <SelectItem value="pending-request">Pending Request</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Textarea
                      placeholder="Add update description..."
                      value={task.notes || ""}
                      onChange={(e) => updateTaskNotes(task.id, e.target.value)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}


