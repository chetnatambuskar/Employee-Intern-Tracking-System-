<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Notification;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $user  = $request->user();
        $query = Task::with(['creator', 'assignee', 'department'])
            ->whereNull('tasks.deleted_at');

        // Role-based filtering
        if ($user->role === 'employee' || $user->role === 'intern') {
            $query->where('assigned_to', $user->id);
        } elseif ($user->role === 'manager') {
            $query->where(function ($q) use ($user) {
                $q->where('created_by', $user->id)
                  ->orWhere('assigned_to', $user->id);
            });
        }
        // admin sees all

        $query->when($request->status,   fn($q) => $q->where('status',   $request->status))
              ->when($request->priority, fn($q) => $q->where('priority', $request->priority))
              ->when($request->category, fn($q) => $q->where('category', $request->category))
              ->when($request->search,   fn($q) => $q->where('title', 'like', "%{$request->search}%"));

        $tasks = $query->latest()->paginate(50);

        // Format response cleanly
        $tasks->getCollection()->transform(function ($task) {
            return [
                'id'          => $task->id,
                'title'       => $task->title,
                'description' => $task->description,
                'priority'    => $task->priority,
                'status'      => $task->status,
                'category'    => $task->category,
                'progress'    => $task->progress,
                'due_date'    => $task->due_date,
                'remarks'     => $task->remarks,
                'created_at'  => $task->created_at,
                'assigned_to' => $task->assigned_to,
                'created_by'  => $task->created_by,
                'assignee'    => $task->assignee ? [
                    'id'   => $task->assignee->id,
                    'name' => $task->assignee->name,
                ] : null,
                'creator' => $task->creator ? [
                    'id'   => $task->creator->id,
                    'name' => $task->creator->name,
                ] : null,
                'department' => $task->department ? [
                    'name' => $task->department->name,
                ] : null,
            ];
        });

        return response()->json($tasks);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'assigned_to' => 'required|exists:users,id',
            'priority'    => 'nullable|in:low,medium,high,urgent',
            'category'    => 'nullable|in:development,design,qa,management,other',
            'due_date'    => 'nullable|date',
            'description' => 'nullable|string',
            'status'      => 'nullable|in:pending,in_progress,review,completed,cancelled',
        ]);

        $task = Task::create([
            'title'       => $request->title,
            'description' => $request->description,
            'assigned_to' => $request->assigned_to,
            'created_by'  => $request->user()->id,
            'priority'    => $request->priority    ?? 'medium',
            'category'    => $request->category    ?? 'other',
            'status'      => $request->status      ?? 'pending',
            'due_date'    => $request->due_date    ?? null,
            'department_id' => $request->department_id ?? null,
            'progress'    => 0,
        ]);

        // Send notification to assigned user
        try {
            Notification::send(
                $request->assigned_to,
                'New Task Assigned',
                'You have been assigned: "' . $task->title . '" — Priority: ' . ($task->priority ?? 'medium') . '.',
                'task',
                '/tasks'
            );
        } catch (\Exception $e) {
            // Notification failure should not break task creation
        }

        return response()->json([
            'message' => 'Task created successfully',
            'task'    => $task->load(['creator', 'assignee', 'department']),
        ], 201);
    }

    public function show(Task $task)
    {
        return response()->json($task->load(['creator', 'assignee', 'department']));
    }

    public function update(Request $request, Task $task)
    {
        $this->authorizeTaskAccess($request->user(), $task);

        $request->validate([
            'title'    => 'required|string|max:255',
            'status'   => 'nullable|in:pending,in_progress,review,completed,cancelled',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'progress' => 'nullable|integer|min:0|max:100',
        ]);

        $data = $request->only([
            'title', 'description', 'status', 'priority',
            'category', 'progress', 'due_date', 'remarks',
        ]);

        if (isset($data['status']) && $data['status'] === 'completed') {
            $data['completed_date'] = now()->toDateString();
            $data['progress']       = 100;
        }

        $task->update($data);

        return response()->json([
            'message' => 'Task updated',
            'task'    => $task->load(['creator', 'assignee']),
        ]);
    }

    public function updateStatus(Request $request, Task $task)
    {
        $data = [];

        if ($request->has('status')) {
            $validStatuses = ['pending', 'in_progress', 'review', 'completed', 'cancelled'];
            if (in_array($request->status, $validStatuses)) {
                $data['status'] = $request->status;
                if ($request->status === 'completed') {
                    $data['progress']       = 100;
                    $data['completed_date'] = now()->toDateString();
                }
            }
        }

        if ($request->has('progress')) {
            $data['progress'] = max(0, min(100, intval($request->progress)));
        }

        if ($request->has('remarks')) {
            $data['remarks'] = $request->remarks;
        }

        if (!empty($data)) {
            $task->update($data);
        }

        return response()->json([
            'message' => 'Task updated successfully',
            'task'    => $task->fresh(),
        ]);
    }

    public function destroy(Task $task)
    {
        $task->delete();
        return response()->json(['message' => 'Task deleted successfully']);
    }

    private function authorizeTaskAccess($user, Task $task): void
    {
        if ($user->role === 'admin') return;
        if ($task->created_by === $user->id) return;
        if ($task->assigned_to === $user->id) return;
        abort(403, 'Unauthorized access to this task');
    }
}
