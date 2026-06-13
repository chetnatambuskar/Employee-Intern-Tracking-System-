<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index()
    {
        $departments = Department::withCount(['employees', 'interns'])
            ->orderBy('name')
            ->get();

        return response()->json($departments);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'code'        => 'required|string|unique:departments,code|max:10',
            'description' => 'nullable|string',
        ]);

        $department = Department::create($request->all());

        return response()->json(['message' => 'Department created', 'department' => $department], 201);
    }

    public function show(Department $department)
    {
        return response()->json($department->load(['employees.user', 'interns.user']));
    }

    public function update(Request $request, Department $department)
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'code'        => 'required|string|max:10|unique:departments,code,' . $department->id,
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        $department->update($request->all());

        return response()->json(['message' => 'Department updated', 'department' => $department]);
    }

    public function destroy(Department $department)
    {
        $department->delete();
        return response()->json(['message' => 'Department deleted']);
    }
}
