<?php

use App\Http\Controllers\{
    AuthController,
    AttendanceController,
    DashboardController,
    DepartmentController,
    EmployeeController,
    InternController,
    PlacementController,
    ResumeController,
    TaskController,
    NotificationController,
    ProfileController
};
use Illuminate\Support\Facades\Route;

// ─── Public Routes ─────────────────────────────────────────
Route::post('/login', [AuthController::class, 'login']);

// ─── Authenticated Routes ──────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::get('/me',               [AuthController::class, 'me']);
    Route::post('/logout',          [AuthController::class, 'logout']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/profile',         [AuthController::class, 'updateProfile']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Departments (admin/manager)
    Route::apiResource('departments', DepartmentController::class);

    // Employees (admin/manager)
    Route::apiResource('employees', EmployeeController::class);

    // Interns (admin/manager)
    Route::apiResource('interns', InternController::class);
    Route::put('/interns/{intern}/performance', [InternController::class, 'updatePerformance']);

    // Attendance
    Route::get('/attendance',              [AttendanceController::class, 'index']);
    Route::post('/attendance/mark',        [AttendanceController::class, 'markAttendance']);
    Route::post('/attendance/bulk',        [AttendanceController::class, 'bulkMark']);
    Route::get('/attendance/my',           [AttendanceController::class, 'myAttendance']);
    Route::get('/attendance/report',       [AttendanceController::class, 'report']);

    // Tasks
    Route::apiResource('tasks', TaskController::class);
    Route::put('/tasks/{task}/status',     [TaskController::class, 'updateStatus']);

    // Placements
    Route::apiResource('placements', PlacementController::class);
    Route::get('/placements/stats',        [PlacementController::class, 'stats']);

    // Resumes
    Route::get('/resumes',                 [ResumeController::class, 'index']);
    Route::post('/resumes/upload',         [ResumeController::class, 'upload']);
    Route::delete('/resumes/{resume}',     [ResumeController::class, 'destroy']);
    Route::put('/resumes/{resume}/primary',[ResumeController::class, 'setPrimary']);

    // Notifications
    Route::get('/notifications',              [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read',    [NotificationController::class, 'markRead']);
    Route::post('/notifications/read-all',    [NotificationController::class, 'markAllRead']);
    Route::delete('/notifications/{id}',      [NotificationController::class, 'destroy']);


    // Inside auth:sanctum group:
    Route::get('/profile',          [ProfileController::class, 'show']);
    Route::post('/profile/update',  [ProfileController::class, 'update']);
    Route::post('/profile/avatar',  [ProfileController::class, 'uploadAvatar']);

    Route::get('/profile',         [ProfileController::class, 'show']);
    Route::post('/profile/update', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar']);


    Route::get('/profile',                    [ProfileController::class, 'show']);
    Route::post('/profile/update',            [ProfileController::class, 'update']);
    Route::post('/profile/avatar',            [ProfileController::class, 'uploadAvatar']);
    Route::get('/admin/user-profile/{id}',    [ProfileController::class, 'adminView']);
    Route::get('/admin/users-list',           [ProfileController::class, 'usersList']);
    Route::get('/admin/user-profile/{id}', [ProfileController::class, 'adminView']);

});
