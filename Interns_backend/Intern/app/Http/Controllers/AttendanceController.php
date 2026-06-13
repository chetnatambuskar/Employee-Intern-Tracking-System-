<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $query = Attendance::with('user')
            ->when($request->user_id, fn($q) => $q->where('user_id', $request->user_id))
            ->when($request->month, fn($q) => $q->whereMonth('date', $request->month))
            ->when($request->year, fn($q) => $q->whereYear('date', $request->year ?? date('Y')))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->orderBy('date', 'desc');

        return response()->json($query->paginate(30));
    }

    public function markAttendance(Request $request)
    {
        $request->validate([
            'user_id'  => 'required|exists:users,id',
            'date'     => 'required|date',
            'status'   => 'required|in:present,absent,half_day,leave,holiday',
            'check_in' => 'nullable|date_format:H:i',
            'check_out'=> 'nullable|date_format:H:i',
            'notes'    => 'nullable|string',
        ]);

        $workingHours = null;
        if ($request->check_in && $request->check_out) {
            $in  = Carbon::parse($request->check_in);
            $out = Carbon::parse($request->check_out);
            $workingHours = round($out->diffInMinutes($in) / 60, 2);
        }

        $attendance = Attendance::updateOrCreate(
            ['user_id' => $request->user_id, 'date' => $request->date],
            [
                'check_in'      => $request->check_in,
                'check_out'     => $request->check_out,
                'status'        => $request->status,
                'working_hours' => $workingHours,
                'notes'         => $request->notes,
                'marked_by'     => $request->user()->name,
            ]
        );

        return response()->json(['message' => 'Attendance marked', 'attendance' => $attendance->load('user')]);
    }

    public function bulkMark(Request $request)
    {
        $request->validate([
            'date'     => 'required|date',
            'records'  => 'required|array',
            'records.*.user_id' => 'required|exists:users,id',
            'records.*.status'  => 'required|in:present,absent,half_day,leave,holiday',
        ]);

        foreach ($request->records as $record) {
            Attendance::updateOrCreate(
                ['user_id' => $record['user_id'], 'date' => $request->date],
                ['status' => $record['status'], 'marked_by' => $request->user()->name]
            );
        }

        return response()->json(['message' => 'Bulk attendance marked successfully']);
    }

    public function myAttendance(Request $request)
    {
        $month = $request->month ?? date('m');
        $year  = $request->year  ?? date('Y');

        $records = Attendance::where('user_id', $request->user()->id)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->orderBy('date')
            ->get();

        $summary = [
            'present'  => $records->where('status', 'present')->count(),
            'absent'   => $records->where('status', 'absent')->count(),
            'half_day' => $records->where('status', 'half_day')->count(),
            'leave'    => $records->where('status', 'leave')->count(),
        ];

        return response()->json(['records' => $records, 'summary' => $summary]);
    }

    public function report(Request $request)
    {
        $month = $request->month ?? date('m');
        $year  = $request->year  ?? date('Y');

        $users = User::where('is_active', true)
            ->with(['attendances' => fn($q) => $q->whereMonth('date', $month)->whereYear('date', $year)])
            ->get()
            ->map(fn($user) => [
                'user'     => $user->only(['id', 'name', 'email', 'role']),
                'present'  => $user->attendances->where('status', 'present')->count(),
                'absent'   => $user->attendances->where('status', 'absent')->count(),
                'half_day' => $user->attendances->where('status', 'half_day')->count(),
                'leave'    => $user->attendances->where('status', 'leave')->count(),
                'total_hours' => $user->attendances->sum('working_hours'),
            ]);

        return response()->json($users);
    }
}
