<?php

namespace App\Http\Controllers;

use App\Models\Intern;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class InternController extends Controller
{
    public function index(Request $request)
    {
        $query = Intern::with(['user', 'department'])
            ->when($request->department_id, fn($q) => $q->where('department_id', $request->department_id))
            ->when($request->status,        fn($q) => $q->where('status', $request->status))
            ->when($request->search,        fn($q) => $q->whereHas('user', fn($u) =>
                $u->where('name', 'like', "%{$request->search}%")
            ));

        $interns = $query->paginate(15);

        // Format dates properly so frontend shows clean dates not ISO strings
        $interns->getCollection()->transform(function ($intern) {
            return [
                'id'                => $intern->id,
                'intern_id'         => $intern->intern_id,
                'college_name'      => $intern->college_name,
                'course'            => $intern->course,
                'specialization'    => $intern->specialization,
                'internship_start'  => $intern->internship_start
                                        ? Carbon::parse($intern->internship_start)->format('Y-m-d')
                                        : null,
                'internship_end'    => $intern->internship_end
                                        ? Carbon::parse($intern->internship_end)->format('Y-m-d')
                                        : null,
                'status'            => $intern->status,
                'stipend'           => $intern->stipend,
                'performance_score' => $intern->performance_score,
                'mentor_notes'      => $intern->mentor_notes,
                'skills'            => $intern->skills,
                'department_id'     => $intern->department_id,
                'user_id'           => $intern->user_id,
                'user'              => $intern->user ? [
                    'id'    => $intern->user->id,
                    'name'  => $intern->user->name,
                    'email' => $intern->user->email,
                    'phone' => $intern->user->phone,
                ] : null,
                'department'        => $intern->department ? [
                    'id'   => $intern->department->id,
                    'name' => $intern->department->name,
                ] : null,
            ];
        });

        return response()->json($interns);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'             => 'required|string',
            'email'            => 'required|email|unique:users,email',
            'password'         => 'required|min:8',
            'department_id'    => 'required|exists:departments,id',
            'college_name'     => 'required|string',
            'course'           => 'required|string',
            'internship_start' => 'required|date',
            'internship_end'   => 'required|date|after:internship_start',
        ]);

        return DB::transaction(function () use ($request) {
            $user = User::create([
                'name'          => $request->name,
                'email'         => $request->email,
                'password'      => Hash::make($request->password),
                'role'          => 'intern',
                'department_id' => $request->department_id,
                'phone'         => $request->phone,
            ]);

            $internId = 'INT-' . str_pad(Intern::count() + 1, 4, '0', STR_PAD_LEFT);

            $intern = Intern::create([
                'user_id'          => $user->id,
                'intern_id'        => $internId,
                'department_id'    => $request->department_id,
                'college_name'     => $request->college_name,
                'course'           => $request->course,
                'specialization'   => $request->specialization,
                'internship_start' => $request->internship_start,
                'internship_end'   => $request->internship_end,
                'stipend'          => $request->stipend ?? 0,
                'skills'           => $request->skills ?? [],
            ]);

            return response()->json([
                'message' => 'Intern created successfully',
                'intern'  => $intern->load(['user', 'department']),
            ], 201);
        });
    }

    public function show(Intern $intern)
    {
        $data = [
            'id'                => $intern->id,
            'intern_id'         => $intern->intern_id,
            'college_name'      => $intern->college_name,
            'course'            => $intern->course,
            'specialization'    => $intern->specialization,
            'internship_start'  => $intern->internship_start
                                    ? Carbon::parse($intern->internship_start)->format('Y-m-d')
                                    : null,
            'internship_end'    => $intern->internship_end
                                    ? Carbon::parse($intern->internship_end)->format('Y-m-d')
                                    : null,
            'status'            => $intern->status,
            'stipend'           => $intern->stipend,
            'performance_score' => $intern->performance_score,
            'mentor_notes'      => $intern->mentor_notes,
            'skills'            => $intern->skills,
            'department_id'     => $intern->department_id,
            'user_id'           => $intern->user_id,
            'user'              => $intern->user ? [
                'id'    => $intern->user->id,
                'name'  => $intern->user->name,
                'email' => $intern->user->email,
                'phone' => $intern->user->phone,
            ] : null,
            'department'        => $intern->department ? [
                'id'   => $intern->department->id,
                'name' => $intern->department->name,
            ] : null,
            'placements'        => $intern->placements ?? [],
        ];

        return response()->json($data);
    }

    public function update(Request $request, Intern $intern)
    {
        $request->validate([
            'department_id'    => 'required|exists:departments,id',
            'college_name'     => 'required|string',
            'course'           => 'required|string',
            'internship_start' => 'required|date',
            'internship_end'   => 'required|date',
            'status'           => 'nullable|in:active,completed,terminated,placed',
        ]);

        // Update user name and phone
        if ($intern->user) {
            $intern->user->update([
                'name'  => $request->name  ?? $intern->user->name,
                'phone' => $request->phone ?? $intern->user->phone,
            ]);
        }

        // Update intern fields
        $intern->update([
            'department_id'    => $request->department_id,
            'college_name'     => $request->college_name,
            'course'           => $request->course,
            'specialization'   => $request->specialization,
            'internship_start' => $request->internship_start,
            'internship_end'   => $request->internship_end,
            'stipend'          => $request->stipend          ?? $intern->stipend,
            'status'           => $request->status           ?? $intern->status,
            'performance_score'=> $request->performance_score ?? $intern->performance_score,
            'mentor_notes'     => $request->mentor_notes     ?? $intern->mentor_notes,
            'skills'           => $request->skills           ?? $intern->skills,
        ]);

        $intern->load(['user', 'department']);

        return response()->json([
            'message' => 'Intern updated successfully',
            'intern'  => [
                'id'                => $intern->id,
                'intern_id'         => $intern->intern_id,
                'college_name'      => $intern->college_name,
                'course'            => $intern->course,
                'internship_start'  => Carbon::parse($intern->internship_start)->format('Y-m-d'),
                'internship_end'    => Carbon::parse($intern->internship_end)->format('Y-m-d'),
                'status'            => $intern->status,
                'performance_score' => $intern->performance_score,
                'user'              => $intern->user ? [
                    'name'  => $intern->user->name,
                    'email' => $intern->user->email,
                ] : null,
                'department'        => $intern->department ? [
                    'name' => $intern->department->name,
                ] : null,
            ],
        ]);
    }

    public function destroy(Intern $intern)
    {
        $intern->delete();
        return response()->json(['message' => 'Intern deleted successfully']);
    }

    public function updatePerformance(Request $request, Intern $intern)
    {
        $request->validate([
            'performance_score' => 'required|integer|min:0|max:100',
            'mentor_notes'      => 'nullable|string',
        ]);

        $intern->update($request->only('performance_score', 'mentor_notes'));

        return response()->json([
            'message' => 'Performance updated successfully',
            'intern'  => $intern,
        ]);
    }
}
