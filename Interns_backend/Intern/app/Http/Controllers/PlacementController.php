<?php

namespace App\Http\Controllers;

use App\Models\Intern;
use App\Models\Placement;
use Illuminate\Http\Request;

class PlacementController extends Controller
{
    public function index(Request $request)
    {
        $placements = Placement::with(['intern.user', 'intern.department'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->search, fn($q) => $q->where('company_name', 'like', "%{$request->search}%"))
            ->latest()
            ->paginate(15);

        // Format dates
        $placements->getCollection()->transform(function ($p) {
            return [
                'id'             => $p->id,
                'company_name'   => $p->company_name,
                'job_role'       => $p->job_role,
                'package_lpa'    => $p->package_lpa,
                'offer_date'     => $p->offer_date ? $p->offer_date->format('Y-m-d') : null,
                'joining_date'   => $p->joining_date ? $p->joining_date->format('Y-m-d') : null,
                'placement_type' => $p->placement_type,
                'status'         => $p->status,
                'notes'          => $p->notes,
                'intern'         => $p->intern ? [
                    'id'   => $p->intern->id,
                    'user' => $p->intern->user ? [
                        'name'  => $p->intern->user->name,
                        'email' => $p->intern->user->email,
                    ] : null,
                    'department' => $p->intern->department ? [
                        'name' => $p->intern->department->name,
                    ] : null,
                ] : null,
            ];
        });

        return response()->json($placements);
    }

    public function store(Request $request)
    {
        $request->validate([
            'intern_id'      => 'required|exists:interns,id',
            'company_name'   => 'required|string|max:255',
            'job_role'       => 'required|string|max:255',
            'offer_date'     => 'required|date',
            'placement_type' => 'nullable|in:full_time,part_time,contract,ppo',
            'package_lpa'    => 'nullable|numeric|min:0|max:9999999',
            'status'         => 'nullable|in:offered,accepted,rejected,joined',
        ]);

        $placement = Placement::create([
            'intern_id'      => $request->intern_id,
            'company_name'   => $request->company_name,
            'job_role'       => $request->job_role,
            'package_lpa'    => $request->package_lpa ? floatval($request->package_lpa) : null,
            'offer_date'     => $request->offer_date,
            'joining_date'   => $request->joining_date ?? null,
            'placement_type' => $request->placement_type ?? 'full_time',
            'status'         => $request->status ?? 'offered',
            'notes'          => $request->notes ?? null,
        ]);

        // Update intern status
        Intern::find($request->intern_id)->update(['status' => 'placed']);

        $placement->load('intern.user');

        return response()->json([
            'message'   => 'Placement recorded successfully',
            'placement' => $placement,
        ], 201);
    }

    public function update(Request $request, Placement $placement)
    {
        $request->validate([
            'status'      => 'nullable|in:offered,accepted,rejected,joined',
            'package_lpa' => 'nullable|numeric|min:0|max:9999999',
        ]);

        $placement->update($request->all());

        return response()->json([
            'message'   => 'Placement updated',
            'placement' => $placement,
        ]);
    }

    public function destroy(Placement $placement)
    {
        $placement->delete();
        return response()->json(['message' => 'Placement deleted']);
    }

    public function stats()
    {
        return response()->json([
            'total'       => Placement::count(),
            'offered'     => Placement::where('status', 'offered')->count(),
            'accepted'    => Placement::where('status', 'accepted')->count(),
            'joined'      => Placement::where('status', 'joined')->count(),
            'rejected'    => Placement::where('status', 'rejected')->count(),
            'avg_package' => round(Placement::whereNotNull('package_lpa')->avg('package_lpa'), 2),
        ]);
    }
}
