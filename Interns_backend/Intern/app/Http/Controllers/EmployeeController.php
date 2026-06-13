<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = Employee::with(['user', 'department'])
            ->when($request->department_id, fn($q) => $q->where('department_id', $request->department_id))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->search, fn($q) => $q->whereHas('user', fn($u) =>
                $u->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
            ));

        return response()->json($query->paginate(15));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'            => 'required|string|max:255',
            'email'           => 'required|email|unique:users,email',
            'password'        => 'required|min:8',
            'department_id'   => 'required|exists:departments,id',
            'designation'     => 'required|string',
            'joining_date'    => 'required|date',
            'employment_type' => 'in:full_time,part_time,contract',
            'salary'          => 'nullable|numeric',
            'gender'          => 'nullable|in:male,female,other',
            'date_of_birth'   => 'nullable|date',
        ]);

        return DB::transaction(function () use ($request) {
            $user = User::create([
                'name'          => $request->name,
                'email'         => $request->email,
                'password'      => Hash::make($request->password),
                'role'          => 'employee',
                'department_id' => $request->department_id,
                'phone'         => $request->phone,
            ]);

            $empId = 'EMP-' . str_pad(Employee::count() + 1, 4, '0', STR_PAD_LEFT);

            $employee = Employee::create([
                'user_id'          => $user->id,
                'employee_id'      => $empId,
                'department_id'    => $request->department_id,
                'designation'      => $request->designation,
                'joining_date'     => $request->joining_date,
                'salary'           => $request->salary ?? 0,
                'employment_type'  => $request->employment_type ?? 'full_time',
                'address'          => $request->address,
                'emergency_contact'=> $request->emergency_contact,
                'date_of_birth'    => $request->date_of_birth,
                'gender'           => $request->gender,
            ]);

            return response()->json([
                'message'  => 'Employee created successfully',
                'employee' => $employee->load(['user', 'department']),
            ], 201);
        });
    }

    public function show(Employee $employee)
    {
        return response()->json($employee->load(['user', 'department']));
    }

    public function update(Request $request, Employee $employee)
    {
        $request->validate([
            'name'          => 'required|string',
            'department_id' => 'required|exists:departments,id',
            'designation'   => 'required|string',
            'joining_date'  => 'required|date',
            'status'        => 'in:active,inactive,terminated,on_leave',
        ]);

        return DB::transaction(function () use ($request, $employee) {
            $employee->user->update([
                'name'          => $request->name,
                'phone'         => $request->phone,
                'department_id' => $request->department_id,
            ]);

            $employee->update($request->except(['name', 'email', 'password', 'phone']));

            return response()->json([
                'message'  => 'Employee updated',
                'employee' => $employee->load(['user', 'department']),
            ]);
        });
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();
        return response()->json(['message' => 'Employee deleted']);
    }
}
