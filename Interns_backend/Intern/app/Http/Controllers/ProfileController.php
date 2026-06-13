<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user    = $request->user();
        $profile = null;

        if (Schema::hasTable('user_profiles')) {
            $profile = DB::table('user_profiles')->where('user_id', $user->id)->first();
        }

        return response()->json($this->buildResponse($user, $profile));
    }

    // Admin view any user profile
    public function adminView(Request $request, $userId)
    {
        $authUser = $request->user();

        if (!in_array($authUser->role, ['admin', 'manager'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user = DB::table('users')->where('id', $userId)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $profile = null;
        if (Schema::hasTable('user_profiles')) {
            $profile = DB::table('user_profiles')->where('user_id', $userId)->first();
        }

        return response()->json($this->buildResponse($user, $profile));
    }

    public function update(Request $request)
    {
        // All fields are OPTIONAL - save whatever is provided
        $user = $request->user();

        // Update name and phone if provided
        $userUpdate = [];
        if ($request->filled('name'))  $userUpdate['name']  = trim($request->name);
        if ($request->has('phone'))    $userUpdate['phone'] = $request->phone ?? '';
        if (!empty($userUpdate)) {
            DB::table('users')->where('id', $user->id)->update($userUpdate);
        }

        $profileData = [
            'address'       => $request->input('address',       '') ?? '',
            'bio'           => $request->input('bio',           '') ?? '',
            'date_of_birth' => $request->input('date_of_birth') ?: null,
            'gender'        => $request->input('gender',        '') ?? '',
            'linkedin'      => $request->input('linkedin',      '') ?? '',
            'github'        => $request->input('github',        '') ?? '',
            'education'     => json_encode($request->input('education',    []) ?: []),
            'experience'    => json_encode($request->input('experience',   []) ?: []),
            'skills'        => json_encode($request->input('skills',       []) ?: []),
            'languages'     => json_encode($request->input('languages',    []) ?: []),
            'projects'      => json_encode($request->input('projects',     []) ?: []),
            'achievements'  => json_encode($request->input('achievements', []) ?: []),
            'updated_at'    => now(),
        ];

        if (Schema::hasTable('user_profiles')) {
            $exists = DB::table('user_profiles')->where('user_id', $user->id)->exists();
            if ($exists) {
                DB::table('user_profiles')->where('user_id', $user->id)->update($profileData);
            } else {
                $profileData['user_id']    = $user->id;
                $profileData['created_at'] = now();
                DB::table('user_profiles')->insert($profileData);
            }
        }

        $freshUser    = DB::table('users')->where('id', $user->id)->first();
        $freshProfile = Schema::hasTable('user_profiles')
            ? DB::table('user_profiles')->where('user_id', $user->id)->first()
            : null;

        return response()->json([
            'message' => 'Profile saved successfully',
            'profile' => $this->buildResponse($freshUser, $freshProfile),
        ]);
    }

    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpg,jpeg,png,gif,webp|max:2048',
        ]);

        $user = $request->user();
        $path = $request->file('avatar')->store('avatars', 'public');
        DB::table('users')->where('id', $user->id)->update(['avatar' => $path]);

        return response()->json([
            'message' => 'Photo updated',
            'avatar'  => $path,
            'url'     => asset('storage/' . $path),
        ]);
    }

    // Get all users list for admin
    public function usersList(Request $request)
    {
        $authUser = $request->user();
        if (!in_array($authUser->role, ['admin', 'manager'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $users = DB::table('users')
            ->whereNull('deleted_at')
            ->where('is_active', true)
            ->select('id', 'name', 'email', 'role', 'phone', 'avatar', 'department_id')
            ->orderBy('name')
            ->get();

        return response()->json($users);
    }

    private function buildResponse($user, $profile): array
    {
        return [
            'id'            => $user->id,
            'name'          => $user->name          ?? '',
            'email'         => $user->email         ?? '',
            'phone'         => $user->phone         ?? '',
            'avatar'        => $user->avatar        ?? null,
            'role'          => $user->role          ?? '',
            'address'       => $profile ? ($profile->address       ?? '') : '',
            'bio'           => $profile ? ($profile->bio           ?? '') : '',
            'date_of_birth' => $profile ? ($profile->date_of_birth ?? '') : '',
            'gender'        => $profile ? ($profile->gender        ?? '') : '',
            'linkedin'      => $profile ? ($profile->linkedin      ?? '') : '',
            'github'        => $profile ? ($profile->github        ?? '') : '',
            'education'     => $this->safeJson($profile, 'education'),
            'experience'    => $this->safeJson($profile, 'experience'),
            'skills'        => $this->safeJson($profile, 'skills'),
            'languages'     => $this->safeJson($profile, 'languages'),
            'projects'      => $this->safeJson($profile, 'projects'),
            'achievements'  => $this->safeJson($profile, 'achievements'),
        ];
    }

    private function safeJson($profile, string $field): array
    {
        if (!$profile) return [];
        $val = $profile->{$field} ?? null;
        if (!$val || $val === 'null' || $val === '[]' || $val === '') return [];
        try {
            $decoded = json_decode($val, true);
            return is_array($decoded) ? $decoded : [];
        } catch (\Exception $e) {
            return [];
        }
    }
}
