<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $today = Carbon::today();
        $month = $today->month;
        $year  = $today->year;

        $totalEmployees  = DB::table('employees')->whereNull('deleted_at')->count();
        $totalInterns    = DB::table('interns')->whereNull('deleted_at')->count();
        $activeEmployees = DB::table('employees')->whereNull('deleted_at')->where('status', 'active')->count();
        $activeInterns   = DB::table('interns')->whereNull('deleted_at')->where('status', 'active')->count();
        $totalPlaced     = DB::table('placements')->where('status', 'joined')->count();
        $pendingTasks    = DB::table('tasks')->whereNull('deleted_at')->whereIn('status', ['pending', 'in_progress'])->count();

        $presentToday = DB::table('attendances')->where('date', $today->toDateString())->where('status', 'present')->count();
        $absentToday  = DB::table('attendances')->where('date', $today->toDateString())->where('status', 'absent')->count();
        $leaveToday   = DB::table('attendances')->where('date', $today->toDateString())->where('status', 'leave')->count();

        $taskPending    = DB::table('tasks')->whereNull('deleted_at')->where('status', 'pending')->count();
        $taskInProgress = DB::table('tasks')->whereNull('deleted_at')->where('status', 'in_progress')->count();
        $taskCompleted  = DB::table('tasks')->whereNull('deleted_at')->where('status', 'completed')->count();
        $taskOverdue    = DB::table('tasks')->whereNull('deleted_at')
                            ->whereNotIn('status', ['completed', 'cancelled'])
                            ->whereNotNull('due_date')
                            ->where('due_date', '<', $today->toDateString())
                            ->count();

        $monthlyAttendance = [];
        $daysInMonth = $today->daysInMonth;
        $maxDay = ($today->month == $month && $today->year == $year) ? $today->day : $daysInMonth;

        for ($d = 1; $d <= $maxDay; $d++) {
            $date = Carbon::create($year, $month, $d)->toDateString();
            $monthlyAttendance[] = [
                'date'    => $date,
                'present' => DB::table('attendances')->where('date', $date)->where('status', 'present')->count(),
                'absent'  => DB::table('attendances')->where('date', $date)->where('status', 'absent')->count(),
            ];
        }

        $totalPlacements = DB::table('placements')->count();
        $monthPlacements = DB::table('placements')->whereMonth('offer_date', $month)->count();
        $avgPackage      = DB::table('placements')->whereNotNull('package_lpa')->avg('package_lpa');

        $recentTasks = DB::table('tasks')
            ->whereNull('tasks.deleted_at')
            ->join('users as assignee', 'tasks.assigned_to', '=', 'assignee.id')
            ->join('users as creator', 'tasks.created_by', '=', 'creator.id')
            ->select(
                'tasks.id', 'tasks.title', 'tasks.status',
                'tasks.priority', 'tasks.due_date', 'tasks.progress',
                'assignee.name as assignee_name',
                'creator.name as creator_name'
            )
            ->orderBy('tasks.created_at', 'desc')
            ->limit(5)
            ->get();

        $topInterns = DB::table('interns')
            ->whereNull('interns.deleted_at')
            ->whereNotNull('performance_score')
            ->join('users', 'interns.user_id', '=', 'users.id')
            ->select('interns.id', 'interns.performance_score', 'users.name')
            ->orderBy('performance_score', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'overview' => [
                'total_employees'  => $totalEmployees,
                'total_interns'    => $totalInterns,
                'active_employees' => $activeEmployees,
                'active_interns'   => $activeInterns,
                'total_placements' => $totalPlaced,
                'pending_tasks'    => $pendingTasks,
            ],
            'attendance_today' => [
                'present' => $presentToday,
                'absent'  => $absentToday,
                'leave'   => $leaveToday,
            ],
            'task_summary' => [
                'pending'     => $taskPending,
                'in_progress' => $taskInProgress,
                'completed'   => $taskCompleted,
                'overdue'     => $taskOverdue,
            ],
            'monthly_attendance' => $monthlyAttendance,
            'placement_stats' => [
                'total'       => $totalPlacements,
                'this_month'  => $monthPlacements,
                'avg_package' => $avgPackage ? round($avgPackage, 2) : 0,
            ],
            'recent_tasks' => $recentTasks->map(function($t) {
                return [
                    'id'       => $t->id,
                    'title'    => $t->title,
                    'status'   => $t->status,
                    'priority' => $t->priority,
                    'progress' => $t->progress,
                    'assignee' => ['name' => $t->assignee_name],
                    'creator'  => ['name' => $t->creator_name],
                ];
            }),
            'intern_performance' => $topInterns->map(function($i) {
                return [
                    'id'                => $i->id,
                    'performance_score' => $i->performance_score,
                    'user'              => ['name' => $i->name],
                ];
            }),
        ]);
    }
}
